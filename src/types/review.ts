export interface Review {
  reviewId: string;
  bookingId: string;
  customerId: string;
  customerName: string; // denormalized so the public provider page can show
  // it without needing read access to the private users collection
  providerId: string;
  stars: number; // 1-5
  comment: string;
  createdAt: number;
}
