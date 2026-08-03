export type BookingStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "completed"
  | "cancelled";

export type PaymentMethod = "cash" | "digital";
export type PaymentStatus = "pending" | "completed" | "failed";

export interface Booking {
  bookingId: string;
  customerId: string;
  customerName: string; // denormalized — same reasoning as Provider.name
  providerId: string;
  providerName: string; // denormalized, shown in the customer's booking history
  category: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  note: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  // Pricing is finalized once the provider accepts (Phase 6 Cloud Function) —
  // null at creation time since the booking form doesn't collect a price.
  amount: number | null;
  commissionAmount: number | null;
  providerEarning: number | null;
  paymentId: string | null;
  paymentStatus: PaymentStatus;
  createdAt: number;
  acceptedAt: number | null;
  completedAt: number | null;
}
