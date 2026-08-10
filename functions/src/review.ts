import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

if (!getApps().length) {
  initializeApp();
}
const db = getFirestore();

/**
 * Recalculates a provider's ratingAvg/ratingCount whenever a new review
 * lands. Re-reads every review for the provider rather than incrementally
 * updating a running average — simplest correct approach, and fine at MVP
 * review volume. Worth revisiting (incremental average, avoiding an O(n)
 * read on every single review) if a provider ever accumulates thousands of
 * reviews.
 */
export const aggregateRatings = onDocumentCreated(
  "reviews/{bookingId}",
  async (event) => {
    const review = event.data?.data();
    if (!review) return;

    const { providerId } = review;

    const reviewsSnapshot = await db
      .collection("reviews")
      .where("providerId", "==", providerId)
      .get();

    const ratings = reviewsSnapshot.docs.map(
      (doc) => doc.data().stars as number,
    );
    const avgRating =
      ratings.reduce((a, b) => a + b, 0) / (ratings.length || 1);

    await db.collection("providers").doc(providerId).update({
      ratingAvg: avgRating,
      ratingCount: ratings.length,
    });
  },
);
