import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

// Trigger: when a booking is created, notify the provider
export const onBookingCreated = functions.firestore
  .document("bookings/{bookingId}")
  .onCreate(async (snap, context) => {
    const booking = snap.data();
    if (!booking) return;

    try {
      await db.collection("notifications").add({
        userId: booking.providerId,
        type: "booking_request",
        title: "New Booking Request",
        message: `You have a new booking request from customer ${booking.customerId}`,
        relatedDocId: context.params.bookingId,
        relatedDocType: "booking",
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error("onBookingCreated error", err);
    }
  });

// Trigger: when a booking is updated, notify customer on accept and provider on payment
export const onBookingUpdated = functions.firestore
  .document("bookings/{bookingId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (!before || !after) return;

    try {
      // booking accepted -> notify customer
      if (before.status !== "accepted" && after.status === "accepted") {
        await db.collection("notifications").add({
          userId: after.customerId,
          type: "booking_accepted",
          title: "Booking Accepted",
          message: `Your booking ${context.params.bookingId} was accepted by the provider.`,
          relatedDocId: context.params.bookingId,
          relatedDocType: "booking",
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      // payment status changed to completed -> notify provider
      if (
        before.paymentStatus !== "completed" &&
        after.paymentStatus === "completed"
      ) {
        await db.collection("notifications").add({
          userId: after.providerId,
          type: "payment_received",
          title: "Payment Received",
          message: `Payment received for booking ${context.params.bookingId}.`,
          relatedDocId: context.params.bookingId,
          relatedDocType: "booking",
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }
    } catch (err) {
      console.error("onBookingUpdated error", err);
    }
  });

// Trigger: when a review is created, notify the provider
export const onReviewCreated = functions.firestore
  .document("reviews/{reviewId}")
  .onCreate(async (snap, context) => {
    const review = snap.data();
    if (!review) return;

    try {
      await db.collection("notifications").add({
        userId: review.providerId,
        type: "review_posted",
        title: "New Review",
        message: `You received a new review for booking ${review.bookingId}.`,
        relatedDocId: review.bookingId,
        relatedDocType: "booking",
        read: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error("onReviewCreated error", err);
    }
  });
