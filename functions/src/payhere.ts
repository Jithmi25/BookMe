import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

/**
 * Minimal PayHere webhook handler.
 * PayHere sends POST callbacks / IPN - payload structure depends on merchant settings.
 * This handler expects a JSON body containing a booking or order identifier (try common fields).
 */
export const handlePayHereWebhook = functions.https.onRequest(
  async (req, res) => {
    try {
      const body = req.method === "POST" ? req.body : req.query;

      // Try common keys used by payment gateways / merchant callbacks
      const bookingId =
        body.bookingId ||
        body.order_id ||
        body.merchant_order_id ||
        body.orderId;
      const status = (
        body.status ||
        body.payment_status ||
        body.transaction_status ||
        ""
      )
        .toString()
        .toLowerCase();
      const transactionId =
        body.transaction_id ||
        body.payhere_payment_id ||
        body.payment_id ||
        body.txn_id ||
        null;

      if (!bookingId) {
        // Not enough information; ack so PayHere doesn't keep retrying, but log for debugging
        console.warn("PayHere webhook missing bookingId", body);
        res.status(400).send("missing booking id");
        return;
      }

      if (
        status.includes("success") ||
        status.includes("paid") ||
        status.includes("completed")
      ) {
        await db.collection("bookings").doc(bookingId).update({
          paymentStatus: "completed",
          paymentId: transactionId,
        });

        // create a notification for the provider (the notifications trigger will also fire on update)
        res.json({ received: true });
        return;
      }

      // fallback: set paymentStatus to value provided
      await db
        .collection("bookings")
        .doc(bookingId)
        .update({
          paymentStatus: status || "pending",
          paymentId: transactionId,
        });

      res.json({ received: true });
    } catch (err) {
      console.error("handlePayHereWebhook error", err);
      res.status(500).send("error");
    }
  },
);
import { onCall, onRequest, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as crypto from "crypto";

if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

// Set with:
//   firebase functions:secrets:set PAYHERE_MERCHANT_ID
//   firebase functions:secrets:set PAYHERE_MERCHANT_SECRET
// Merchant ID/Secret come from PayHere Dashboard → Integrations. Sandbox and
// live mode use different secrets — make sure these match whichever mode
// PAYHERE_MODE (a plain env var, not a secret, since it's not sensitive) is
// set to on the client.
const payhereMerchantId = defineSecret("PAYHERE_MERCHANT_ID");
const payhereMerchantSecret = defineSecret("PAYHERE_MERCHANT_SECRET");

function md5(input: string): string {
  return crypto.createHash("md5").update(input).digest("hex").toUpperCase();
}

/**
 * Generates the PayHere checkout hash server-side. The amount is read from
 * the booking document in Firestore — never trusted from the client — so a
 * customer can't tamper with what they're charged by editing request data.
 * Uses the bookingId itself as PayHere's order_id, which is what lets the
 * notify webhook below map a payment straight back to a booking with no
 * extra bookkeeping.
 */
export const createPayHereHash = onCall(
  { secrets: [payhereMerchantId, payhereMerchantSecret] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Sign in required");
    }

    const { bookingId } = request.data as { bookingId: string };
    const bookingSnap = await db.collection("bookings").doc(bookingId).get();

    if (!bookingSnap.exists) {
      throw new HttpsError("not-found", "Booking not found");
    }
    const booking = bookingSnap.data()!;

    if (booking.customerId !== request.auth.uid) {
      throw new HttpsError("permission-denied", "This isn't your booking");
    }
    if (booking.status !== "accepted") {
      throw new HttpsError(
        "failed-precondition",
        "Booking must be accepted before it can be paid",
      );
    }
    if (booking.paymentMethod !== "digital") {
      throw new HttpsError(
        "failed-precondition",
        "This booking isn't set up for digital payment",
      );
    }
    if (booking.paymentStatus === "completed") {
      throw new HttpsError(
        "failed-precondition",
        "This booking is already paid",
      );
    }
    if (typeof booking.amount !== "number") {
      throw new HttpsError(
        "failed-precondition",
        "No price set on this booking yet",
      );
    }

    const merchantId = payhereMerchantId.value();
    const merchantSecret = payhereMerchantSecret.value();
    const amount = booking.amount.toFixed(2);
    const currency = "LKR";

    const hash = md5(
      merchantId + bookingId + amount + currency + md5(merchantSecret),
    );

    return {
      merchantId,
      orderId: bookingId,
      amount,
      currency,
      hash,
    };
  },
);

/**
 * PayHere posts here (form-encoded, not JSON) once a payment attempt
 * finishes — this is the authoritative source of truth for payment status,
 * not the client-side onCompleted callback the JS SDK fires (that's a UX
 * signal only; a user could in principle close the tab or the callback
 * could be spoofed, so nothing security-relevant should depend on it).
 *
 * Must be onRequest (not onCall) — PayHere's callback is a plain HTTP POST
 * from their servers, not an authenticated Firebase client call.
 */
export const payHereNotify = onRequest(
  { secrets: [payhereMerchantId, payhereMerchantSecret] },
  async (req, res) => {
    const {
      merchant_id,
      order_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      payment_id,
    } = req.body as Record<string, string>;

    const merchantSecret = payhereMerchantSecret.value();

    const expectedSig = md5(
      merchant_id +
        order_id +
        payhere_amount +
        payhere_currency +
        status_code +
        md5(merchantSecret),
    );

    if (expectedSig !== md5sig) {
      // Signature mismatch — either tampered or not actually from PayHere.
      // Respond 400 so PayHere's retry logic doesn't treat this as success,
      // but don't leak why in the response body.
      res.status(400).send("Invalid signature");
      return;
    }

    const bookingRef = db.collection("bookings").doc(order_id);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      res.status(404).send("Booking not found");
      return;
    }
    const booking = bookingSnap.data()!;

    // Extra defense-in-depth beyond the signature check: the reported
    // amount must match what this booking was actually priced at. The
    // signature already covers this in practice (payhere_amount is part of
    // what's signed), but a mismatch here would mean something is very
    // wrong, so it's worth failing loudly rather than trusting the sig alone.
    const expectedAmount = Number(booking.amount).toFixed(2);
    if (payhere_amount !== expectedAmount) {
      res.status(400).send("Amount mismatch");
      return;
    }

    // status_code: 2 = success, 0 = pending, -1 = cancelled, -2 = failed,
    // -3 = chargedback
    if (status_code === "2") {
      await bookingRef.update({
        paymentStatus: "completed",
        paymentId: payment_id,
      });
    } else if (status_code === "-1" || status_code === "-2") {
      await bookingRef.update({
        paymentStatus: "failed",
        paymentId: payment_id ?? null,
      });
    }
    // status_code 0 (pending) and -3 (chargedback, handled separately/
    // manually) intentionally leave paymentStatus untouched here.

    res.status(200).send("OK");
  },
);
