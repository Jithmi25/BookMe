import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin, ApiAuthError } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { bookingId, resolution } = await req.json();
    if (typeof bookingId !== "string") {
      return NextResponse.json({ error: "bookingId is required" }, { status: 400 });
    }
    if (resolution !== "resolved" && resolution !== "dismissed") {
      return NextResponse.json(
        { error: "resolution must be 'resolved' or 'dismissed'" },
        { status: 400 },
      );
    }

    const bookingRef = adminDb.collection("bookings").doc(bookingId);
    const bookingSnap = await bookingRef.get();
    if (!bookingSnap.exists) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    await bookingRef.update({ disputeStatus: resolution });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("resolve-dispute error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
