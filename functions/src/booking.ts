import { onCall, HttpsError } from "firebase-functions/v2/https";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

const COMMISSION_RATE = 0.1; // 10% — adjust here if it needs to vary by category later

/**
 * Provider accepts a pending booking and sets the final price.
 *
 * Deviates from the plan's draft in two ways:
 * 1. The plan's `calculateCommission` ran as a separate onCreate trigger
 *    reading `booking.amount` — but amount is null at creation (the booking
 *    form never collects a price), so that trigger would crash on every
 *    booking. Commission is calculated here instead, once the provider
 *    actually sets a price.
 * 2. Authorization uses `request.auth.uid` (server-verified) rather than a
 *    client-supplied `providerId` field, which can't be trusted to prove
 *    who's calling.
 */
export const acceptBooking = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required");
  }

  const { bookingId, amount } = request.data as {
    bookingId: string;
    amount: number;
  };

  if (typeof amount !== "number" || amount <= 0) {
    throw new HttpsError("invalid-argument", "A valid amount is required");
  }

  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingSnap = await bookingRef.get();

  if (!bookingSnap.exists) {
    throw new HttpsError("not-found", "Booking not found");
  }

  const booking = bookingSnap.data()!;

  if (booking.providerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "You don't own this booking");
  }
  if (booking.status !== "pending") {
    throw new HttpsError(
      "failed-precondition",
      `Booking is already ${booking.status}`,
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

  return { success: true };
});

export const rejectBooking = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required");
  }

  const { bookingId } = request.data as { bookingId: string };
  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingSnap = await bookingRef.get();

  if (!bookingSnap.exists) {
    throw new HttpsError("not-found", "Booking not found");
  }

  const booking = bookingSnap.data()!;

  if (booking.providerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "You don't own this booking");
  }
  if (booking.status !== "pending") {
    throw new HttpsError(
      "failed-precondition",
      `Booking is already ${booking.status}`,
    );
  }

  await bookingRef.update({ status: "rejected" });
  return { success: true };
});

/**
 * Provider marks an accepted booking as complete. (Customer-side completion
 * confirmation isn't in scope yet — worth considering later so a job can't
 * be marked done unilaterally by the person getting paid for it.)
 */
export const completeBooking = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in required");
  }

  const { bookingId } = request.data as { bookingId: string };
  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingSnap = await bookingRef.get();

  if (!bookingSnap.exists) {
    throw new HttpsError("not-found", "Booking not found");
  }

  const booking = bookingSnap.data()!;

  if (booking.providerId !== request.auth.uid) {
    throw new HttpsError("permission-denied", "You don't own this booking");
  }
  if (booking.status !== "accepted") {
    throw new HttpsError(
      "failed-precondition",
      "Booking must be accepted before it can be completed",
    );
  }

  await bookingRef.update({
    status: "completed",
    completedAt: FieldValue.serverTimestamp(),
  });

  return { success: true };
});
