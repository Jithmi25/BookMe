"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Provider } from "@/types/provider";
import { Review } from "@/types/review";

export default function ReviewsListPage() {
  const params = useParams<{ providerId: string }>();
  const [provider, setProvider] = useState<Provider | null | "not-found">(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const providerSnap = await getDoc(
        doc(db, "providers", params.providerId),
      );
      if (!providerSnap.exists()) {
        setProvider("not-found");
        setLoading(false);
        return;
      }
      setProvider(providerSnap.data() as Provider);

      const q = query(
        collection(db, "reviews"),
        where("providerId", "==", params.providerId),
        orderBy("createdAt", "desc"),
        limit(50),
      );
      const snap = await getDocs(q);
      setReviews(snap.docs.map((d) => d.data() as Review));
      setLoading(false);
    }
    load();
  }, [params.providerId]);

  if (loading) {
    return <div className="p-6 text-center text-foreground/70">Loading...</div>;
  }
  if (provider === "not-found" || provider === null) {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center text-foreground/70">
        This provider profile doesn&apos;t exist.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <Link
        href={`/providers/${params.providerId}`}
        className="text-sm text-brand-strong hover:underline"
      >
        ← Back to {provider.name}&apos;s profile
      </Link>

      <h1 className="mt-4 text-3xl font-semibold text-foreground">
        Reviews for {provider.name}
      </h1>
      <p className="mt-1 text-foreground/70">
        {provider.ratingCount > 0
          ? `${provider.ratingAvg.toFixed(1)} ★ average from ${provider.ratingCount} review${provider.ratingCount === 1 ? "" : "s"}`
          : "No reviews yet"}
      </p>

      <div className="mt-6 space-y-4">
        {reviews.length === 0 && (
          <p className="text-center text-foreground/60">No reviews yet.</p>
        )}
        {reviews.map((review) => (
          <div
            key={review.bookingId}
            className="rounded-2xl border border-border bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                {review.customerName}
              </span>
              <span className="text-sm text-foreground/60">
                {"★".repeat(review.stars)}
                {"☆".repeat(5 - review.stars)}
              </span>
            </div>
            {review.comment && (
              <p className="mt-1 text-sm text-foreground/80">
                {review.comment}
              </p>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
