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
  customerName: string;
  providerId: string;
  providerName: string;
  category: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "HH:MM"
  note: string;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  amount: number | null;
  commissionAmount: number | null;
  providerEarning: number | null;
  paymentId: string | null;
  paymentStatus: PaymentStatus;
  // Disputes: the plan specs an /admin/disputes page but never defines a
  // dispute schema anywhere. Rather than invent a whole new collection with
  // its own rules and pages, disputes are modeled as a flag directly on the
  // booking — either party can raise one, admin reviews and resolves it.
  // Refunds aren't wired here since Stripe isn't connected yet (Phase 10).
  disputed: boolean;
  disputeReason: string | null;
  disputeRaisedBy: "customer" | "provider" | null;
  disputeResolved: boolean;
  createdAt: number;
  acceptedAt: number | null;
  completedAt: number | null;
}
