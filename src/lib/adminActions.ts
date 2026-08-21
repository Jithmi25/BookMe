import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { authedFetch } from "@/lib/authedFetch";

export async function verifyProvider(
  providerId: string,
  verificationType: "nic" | "photo",
  approved: boolean,
): Promise<void> {
  await authedFetch("/api/admin/verify-provider", {
    providerId,
    verificationType,
    approved,
  });
}

export async function setUserSuspended(
  userId: string,
  suspended: boolean,
): Promise<void> {
  await authedFetch("/api/admin/set-user-suspended", { userId, suspended });
}

/**
 * Raising a dispute stays a direct Firestore write — either party flagging
 * their own booking doesn't need server-side verification beyond "is this
 * your booking", which Firestore rules already enforce.
 */
export async function raiseDispute(
  bookingId: string,
  raisedBy: "customer" | "provider",
  reason: string,
): Promise<void> {
  await updateDoc(doc(db, "bookings", bookingId), {
    disputed: true,
    disputeReason: reason,
    disputeRaisedBy: raisedBy,
    disputeStatus: "open",
  });
}

/**
 * NOTE: previously this wrote `disputeResolved: true` directly from the
 * client, while the (unused) Cloud Function version wrote `disputeStatus`.
 * This now goes through the admin-gated API route and writes
 * `disputeStatus`, matching the Cloud Function's original behavior. Update
 * any UI that reads `disputeResolved` to read `disputeStatus !== "open"`
 * (or similar) instead.
 */
export async function resolveDispute(
  bookingId: string,
  resolution: "resolved" | "dismissed" = "resolved",
): Promise<void> {
  await authedFetch("/api/admin/resolve-dispute", { bookingId, resolution });
}
