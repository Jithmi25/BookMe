import {
  collection,
  addDoc,
  doc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PaymentMethod } from "@/types/booking";

export const runtime = "nodejs";

export interface CreateBookingInput {
  customerId: string;
  customerName: string;
  providerId: string;
  providerName: string;
  category: string;
  date: string;
  time: string;
  note: string;
  paymentMethod: PaymentMethod;
}

export async function createBooking(
  input: CreateBookingInput,
): Promise<string> {
  const docRef = await addDoc(collection(db, "bookings"), {
    customerId: input.customerId,
    customerName: input.customerName,
    providerId: input.providerId,
    providerName: input.providerName,
    category: input.category,
    date: input.date,
    time: input.time,
    note: input.note,
    status: "pending",
    paymentMethod: input.paymentMethod,
    // Set by the provider's accept flow / a Cloud Function (Phase 6) — the
    // booking form doesn't collect a price, so these start empty.
    amount: null,
    commissionAmount: null,
    providerEarning: null,
    paymentId: null,
    paymentStatus: "pending",
    createdAt: serverTimestamp(),
    acceptedAt: null,
    completedAt: null,
  });
  return docRef.id;
}

export async function getBooking(bookingId: string) {
  const snap = await getDoc(doc(db, "bookings", bookingId));
  return snap.exists() ? { bookingId: snap.id, ...snap.data() } : null;
}
