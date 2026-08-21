import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { requireAdmin, ApiAuthError } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { userId, suspended } = await req.json();
    if (typeof userId !== "string" || typeof suspended !== "boolean") {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    await adminDb.collection("users").doc(userId).update({ suspended });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof ApiAuthError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error("set-user-suspended error", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
