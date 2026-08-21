import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin, ApiAuthError } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { providerId, verificationType, approved } = await req.json();

    if (typeof providerId !== "string" || typeof approved !== "boolean") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    if (verificationType !== "nic" && verificationType !== "photo") {
      return NextResponse.json(
        { error: "verificationType must be 'nic' or 'photo'" },
        { status: 400 },
      );
    }

    const field = verificationType === "nic" ? "nicVerified" : "photoVerified";
    await adminDb.collection("providers").doc(providerId).update({ [field]: approved });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("verify-provider error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
