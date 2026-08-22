import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAuth, ApiAuthError } from "@/lib/apiAuth";

export const runtime = "nodejs";

const COMMISSION_RATE = 0.1;

export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);

    const { bookingId, amount } = await req.json();
    if (typeof bookingId !== "string") {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 },
      );
    }
    if (typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "A valid amount is required" },
        { status: 400 },
      );
    }

    const bookingRef = adminDb.collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    const booking = bookingSnap.data()!;

    if (booking.providerId !== decoded.uid) {
      return NextResponse.json(
        { error: "You don't own this booking" },
        { status: 403 },
      );
    }
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: `Booking is already ${booking.status}` },
        { status: 409 },
      );
    }

    const commissionAmount = Math.round(amount * COMMISSION_RATE);
    const providerEarning = amount - commissionAmount;

    await bookingRef.update({
      status: "accepted",
      amount,
      commissionAmount,
      providerEarning,
      acceptedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("accept-booking error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
