import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAuth, ApiAuthError } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    const decoded = await requireAuth(req);

    const { bookingId } = await req.json();
    if (typeof bookingId !== "string") {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }

    const bookingRef = adminDb.collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }
    const booking = bookingSnap.data()!;

    if (booking.providerId !== decoded.uid) {
      return NextResponse.json({ error: "You don't own this booking" }, { status: 403 });
    }
    if (booking.status !== "pending") {
      return NextResponse.json(
        { error: `Booking is already ${booking.status}` },
        { status: 409 },
      );
    }

    await bookingRef.update({ status: "rejected" });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("reject-booking error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
