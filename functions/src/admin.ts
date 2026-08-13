import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

function assertIsAdmin(request: {
  auth?: { token?: Record<string, unknown> } | null;
}) {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required");
  }
  // The plan's original draft called
  // `admin.auth().getIdTokenResult(context.auth!.uid)` here — that's not a
  // valid Admin SDK call (getIdTokenResult is a *client*-side method that
  // decodes a token you already hold, it doesn't accept a uid), so it would
  // throw on every single invocation. The platform already verifies and
  // decodes the caller's ID token before your function runs — custom claims
  // are just sitting on request.auth.token, no extra call needed.
  if (request.auth.token?.admin !== true) {
    throw new HttpsError("permission-denied", "Admin access required");
  }
}

export const verifyProvider = onCall(async (request) => {
  assertIsAdmin(request);

  const { providerId, verificationType, approved } = request.data as {
    providerId: string;
    verificationType: "nic" | "photo";
    approved: boolean;
  };

  if (verificationType !== "nic" && verificationType !== "photo") {
    throw new HttpsError(
      "invalid-argument",
      "verificationType must be 'nic' or 'photo'",
    );
  }

  const field = verificationType === "nic" ? "nicVerified" : "photoVerified";
  await db
    .collection("providers")
    .doc(providerId)
    .update({ [field]: approved });

  return { success: true };
});

/**
 * Not in the plan's Cloud Function snippet, but /admin/users is speced as
 * "suspend/ban" — this is the function that actually does it. Suspension is
 * a Firestore field (checked by ProtectedRoute client-side), not an Auth
 * account disable, so it's instant and reversible without touching sign-in
 * state. A stronger version could also call admin.auth().updateUser(uid,
 * { disabled: true }) to hard-block sign-in entirely; left out for now since
 * the plan doesn't specify ban severity and a soft suspend is easier to
 * reverse if an admin makes a mistake.
 */
export const setUserSuspended = onCall(async (request) => {
  assertIsAdmin(request);

  const { userId, suspended } = request.data as {
    userId: string;
    suspended: boolean;
  };

  await db.collection("users").doc(userId).update({ suspended });

  return { success: true };
});
