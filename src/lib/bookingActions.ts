import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

interface SuccessResult {
  success: true;
}

export async function acceptBooking(
  bookingId: string,
  amount: number,
): Promise<void> {
  const call = httpsCallable<
    { bookingId: string; amount: number },
    SuccessResult
  >(functions, "acceptBooking");
  await call({ bookingId, amount });
}

export async function rejectBooking(bookingId: string): Promise<void> {
  const call = httpsCallable<{ bookingId: string }, SuccessResult>(
    functions,
    "rejectBooking",
  );
  await call({ bookingId });
}

export async function completeBooking(bookingId: string): Promise<void> {
  const call = httpsCallable<{ bookingId: string }, SuccessResult>(
    functions,
    "completeBooking",
  );
  await call({ bookingId });
}
