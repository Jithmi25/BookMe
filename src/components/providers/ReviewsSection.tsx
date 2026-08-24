"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Review } from "@/types/review";

export function ReviewsSection({ providerId }: { providerId: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const q = query(
          collection(db, "reviews"),
          where("providerId", "==", providerId),
          orderBy("createdAt", "desc"),
          limit(10),
        );
        const snap = await getDocs(q);
        setReviews(snap.docs.map((d) => d.data() as Review));
      } catch (err) {
        console.warn("Retrying reviews query without composite index:", err);
        try {
          const fallbackQ = query(
            collection(db, "reviews"),
            where("providerId", "==", providerId),
            limit(10),
          );
          const snap = await getDocs(fallbackQ);
          const list = snap.docs.map((d) => d.data() as Review);
          list.sort((a, b) => {
            const timeA =
              typeof a.createdAt === "number"
                ? a.createdAt
                : new Date(a.createdAt as unknown as string).getTime() || 0;
            const timeB =
              typeof b.createdAt === "number"
                ? b.createdAt
                : new Date(b.createdAt as unknown as string).getTime() || 0;
            return timeB - timeA;
          });
          setReviews(list);
        } catch (fallbackErr) {
          console.error("Failed to load reviews:", fallbackErr);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [providerId]);

  if (loading) {
    return <p className="text-sm text-foreground/60">Loading reviews...</p>;
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-foreground/60">No reviews yet.</p>;
  }

  // Breakdown is computed from this fetched sample (max 10 most recent), not
  // the provider's full review history — labeled accordingly below. A true
  // all-time breakdown would need either fetching every review or a
  // denormalized count map maintained server-side (Phase 6+).
  const breakdown = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((r) => r.stars === stars).length,
  }));

  return (
    <div>
      <div className="space-y-1">
        {breakdown.map(({ stars, count }) => (
          <div key={stars} className="flex items-center gap-2 text-sm">
            <span className="w-10 text-foreground/70">{stars}★</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-brand-soft/40">
              <div
                className="h-full bg-brand"
                style={{
                  width: `${(count / reviews.length) * 100}%`,
                }}
              />
            </div>
            <span className="w-6 text-right text-foreground/60">{count}</span>
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-foreground/40">
        Based on the {reviews.length} most recent review
        {reviews.length === 1 ? "" : "s"}
      </p>

      <div className="mt-6 space-y-4">
        {reviews.map((review) => (
          <div key={review.reviewId} className="border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-foreground">
                {review.customerName}
              </span>
              <span className="text-sm text-foreground/60">
                {"★".repeat(review.stars)}
                {"☆".repeat(5 - review.stars)}
              </span>
            </div>
            <p className="mt-1 text-sm text-foreground/80">{review.comment}</p>
          </div>
        ))}
      </div>

      <Link
        href={`/reviews/list/${providerId}`}
        className="mt-4 inline-block text-sm font-medium text-brand-strong hover:underline"
      >
        See all reviews →
      </Link>
    </div>
  );
}
