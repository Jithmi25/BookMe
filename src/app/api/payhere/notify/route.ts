import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";

function md5(input: string): string {
  return crypto.createHash("md5").update(input).digest("hex").toUpperCase();
}

/**
 * PayHere posts here (form-encoded, not JSON) once a payment attempt
 * finishes — this is the authoritative source of truth for payment status.
 *
 * IMPORTANT: this route is intentionally NOT behind requireAuth — PayHere's
 * servers call it directly, with no Firebase ID token. The md5 signature
 * check below is what verifies the request is genuinely from PayHere, so
 * do not remove it or "simplify" this route to use requireAuth.
 *
 * For local testing, `localhost` isn't reachable from PayHere's servers —
 * use a tunnel (e.g. `ngrok http 3000`) and set NEXT_PUBLIC_PAYHERE_NOTIFY_URL
 * / your PayHere dashboard's notify URL to the tunnel URL + /api/payhere/notify.
 */
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const merchant_id = String(form.get("merchant_id") ?? "");
  const order_id = String(form.get("order_id") ?? "");
  const payhere_amount = String(form.get("payhere_amount") ?? "");
  const payhere_currency = String(form.get("payhere_currency") ?? "");
  const status_code = String(form.get("status_code") ?? "");
  const md5sig = String(form.get("md5sig") ?? "");
  const payment_id = form.get("payment_id") ? String(form.get("payment_id")) : null;

  const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
  if (!merchantSecret) {
    console.error("Missing PAYHERE_MERCHANT_SECRET env var");
    return new NextResponse("Server misconfigured", { status: 500 });
  }

  const expectedSig = md5(
    merchant_id + order_id + payhere_amount + payhere_currency + status_code + md5(merchantSecret),
  );

  if (expectedSig !== md5sig) {
    // Signature mismatch — either tampered or not actually from PayHere.
    return new NextResponse("Invalid signature", { status: 400 });
  }

  const bookingRef = adminDb.collection("bookings").doc(order_id);
  const bookingSnap = await bookingRef.get();
  if (!bookingSnap.exists) {
    return new NextResponse("Booking not found", { status: 404 });
  }
  const booking = bookingSnap.data()!;

  // Extra defense-in-depth beyond the signature check: the reported amount
  // must match what this booking was actually priced at.
  const expectedAmount = Number(booking.amount).toFixed(2);
  if (payhere_amount !== expectedAmount) {
    return new NextResponse("Amount mismatch", { status: 400 });
  }

  // status_code: 2 = success, 0 = pending, -1 = cancelled, -2 = failed,
  // -3 = chargedback
  if (status_code === "2") {
    await bookingRef.update({ paymentStatus: "completed", paymentId: payment_id });
  } else if (status_code === "-1" || status_code === "-2") {
    await bookingRef.update({ paymentStatus: "failed", paymentId: payment_id ?? null });
  }
  // status_code 0 (pending) and -3 (chargedback) intentionally left as-is.

  return new NextResponse("OK", { status: 200 });
}
