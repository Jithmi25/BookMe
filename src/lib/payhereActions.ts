import { authedFetch } from "@/lib/authedFetch";

export interface PayHereHashResult {
  merchantId: string;
  orderId: string;
  amount: string;
  currency: string;
  hash: string;
}

export async function getPayHereHash(
  bookingId: string,
): Promise<PayHereHashResult> {
  return authedFetch<PayHereHashResult>("/api/payhere/create-hash", {
    bookingId,
  });
}
