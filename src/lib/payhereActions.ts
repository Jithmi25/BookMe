import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

interface PayHereHashResult {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  hash: string;
}

export async function getPayHereHash(
  bookingId: string,
): Promise<PayHereHashResult> {
  const call = httpsCallable<{ bookingId: string }, PayHereHashResult>(
    functions,
    "createPayHereHash",
  );
  const result = await call({ bookingId });
  return result.data;
}
