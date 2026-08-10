import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface CreateReviewInput {
  bookingId: string;
  customerId: string;
  customerName: string;
  providerId: string;
  stars: number;
  comment: string;
}

export async function createReview(input: CreateReviewInput): Promise<void> {
  // Doc ID = bookingId — this is what lets the security rules enforce "one
  // review per booking" via !exists(), and lets the UI cheaply check
  // whether a booking already has a review without a query.
  await setDoc(doc(db, "reviews", input.bookingId), {
    reviewId: input.bookingId,
    bookingId: input.bookingId,
    customerId: input.customerId,
    customerName: input.customerName,
    providerId: input.providerId,
    stars: input.stars,
    comment: input.comment.trim(),
    createdAt: serverTimestamp(),
  });
}

export async function getReviewForBooking(bookingId: string) {
  const snap = await getDoc(doc(db, "reviews", bookingId));
  return snap.exists() ? snap.data() : null;
}
