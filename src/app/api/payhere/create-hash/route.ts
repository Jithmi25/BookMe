import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAuth, ApiAuthError } from "@/lib/apiAuth";

function md5(input: string): string {
  return crypto.createHash("md5").update(input).digest("hex").toUpperCase();
}

/**
 * Generates the PayHere checkout hash server-side. The amount is read from
 * the booking document in Firestore — never trusted from the client — so a
 * customer can't tamper with what they're charged by editing request data.
 */
export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);

    const { bookingId } = await req.json();
    if (typeof bookingId !== "string") {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const bookingSnap = await adminDb.collection("bookings").doc(bookingId).get();
    if (!bookingSnap.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    const booking = bookingSnap.data()!;

    if (booking.customerId !== decoded.uid) {
      return NextResponse.json({ error: "This isn't your booking" }, { status: 403 });
    }
    if (booking.status !== "accepted") {
      return NextResponse.json(
        { error: "Booking must be accepted before it can be paid" },
        { status: 409 },
      );
    }
    if (booking.paymentMethod !== "digital") {
      return NextResponse.json(
        { error: "This booking isn't set up for digital payment" },
        { status: 409 },
      );
    }
    if (booking.paymentStatus === "completed") {
      return NextResponse.json({ error: "This booking is already paid" }, { status: 409 });
    }
    if (typeof booking.amount !== "number") {
      return NextResponse.json({ error: "No price set on this booking yet" }, { status: 409 });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID;
    const merchantSecret = process.env.PAYHERE_MERCHANT_SECRET;
    if (!merchantId || !merchantSecret) {
      console.error("Missing PAYHERE_MERCHANT_ID / PAYHERE_MERCHANT_SECRET env vars");
      return NextResponse.json({ error: "Payments are not configured" }, { status: 500 });
    }

    const amount = booking.amount.toFixed(2);
    const currency = "LKR";
    const hash = md5(merchantId + bookingId + amount + currency + md5(merchantSecret));

    return NextResponse.json({
      merchantId,
      orderId: bookingId,
      amount,
      currency,
      hash,
    });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("create-payhere-hash error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
