import { httpsCallable } from "firebase/functions";
import { doc, updateDoc } from "firebase/firestore";
import { functions, db } from "@/lib/firebase";

interface SuccessResult {
  success: true;
}

export async function verifyProvider(
  providerId: string,
  verificationType: "nic" | "photo",
  approved: boolean,
): Promise<void> {
  const call = httpsCallable<
    {
      providerId: string;
      verificationType: "nic" | "photo";
      approved: boolean;
    },
    SuccessResult
  >(functions, "verifyProvider");
  await call({ providerId, verificationType, approved });
}

export async function setUserSuspended(
  userId: string,
  suspended: boolean,
): Promise<void> {
  const call = httpsCallable<
    { userId: string; suspended: boolean },
    SuccessResult
  >(functions, "setUserSuspended");
  await call({ userId, suspended });
}

/**
 * Raising a dispute is a direct Firestore write (not a Cloud Function) —
 * either party flagging their own booking doesn't need server-side
 * verification beyond "is this your booking", which Firestore rules already
 * enforce. Resolving one, however, is admin-only and goes through rules
 * too (see firestore.rules), since only an admin should be able to clear
 * a dispute flag.
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
    disputeResolved: false,
  });
}

export async function resolveDispute(bookingId: string): Promise<void> {
  await updateDoc(doc(db, "bookings", bookingId), {
    disputeResolved: true,
  });
}
