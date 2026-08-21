import { authedFetch } from "@/lib/authedFetch";

export async function acceptBooking(
  bookingId: string,
  amount: number,
): Promise<void> {
  await authedFetch("/api/bookings/accept", { bookingId, amount });
}

export async function rejectBooking(bookingId: string): Promise<void> {
  await authedFetch("/api/bookings/reject", { bookingId });
}

export async function completeBooking(bookingId: string): Promise<void> {
  await authedFetch("/api/bookings/complete", { bookingId });
}
