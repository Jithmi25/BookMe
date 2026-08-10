"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { createReview, getReviewForBooking } from "@/lib/reviews";
import { Booking } from "@/types/booking";

type LoadState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "not-yours" }
  | { status: "not-completed" }
  | { status: "already-reviewed" }
  | { status: "ready"; booking: Booking };

function CreateReviewForm() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();
  const { firebaseUser, appUser } = useAuthContext();

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [stars, setStars] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!firebaseUser) return;

      const snap = await getDoc(doc(db, "bookings", params.bookingId));
      if (!snap.exists()) {
        setState({ status: "not-found" });
        return;
      }
      const booking = { bookingId: snap.id, ...snap.data() } as Booking;

      if (booking.customerId !== firebaseUser.uid) {
        setState({ status: "not-yours" });
        return;
      }
      if (booking.status !== "completed") {
        setState({ status: "not-completed" });
        return;
      }
      const existingReview = await getReviewForBooking(params.bookingId);
      if (existingReview) {
        setState({ status: "already-reviewed" });
        return;
      }

      setState({ status: "ready", booking });
    }
    load();
  }, [firebaseUser, params.bookingId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state.status !== "ready" || !firebaseUser || !appUser) return;
    if (stars === 0) {
      setError("Pick a star rating.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      await createReview({
        bookingId: params.bookingId,
        customerId: firebaseUser.uid,
        customerName: appUser.name,
        providerId: state.booking.providerId,
        stars,
        comment,
      });
      router.push(`/providers/${state.booking.providerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  if (state.status === "loading") {
    return <div className="p-6 text-center text-foreground/70">Loading...</div>;
  }
  if (state.status === "not-found") {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center text-foreground/70">
        Booking not found.
      </main>
    );
  }
  if (state.status === "not-yours") {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center text-foreground/70">
        This isn&apos;t your booking to review.
      </main>
    );
  }
  if (state.status === "not-completed") {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center text-foreground/70">
        You can leave a review once this booking is marked completed.
      </main>
    );
  }
  if (state.status === "already-reviewed") {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center text-foreground/70">
        You&apos;ve already reviewed this booking.
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">
        Review {state.booking.providerName}
      </h1>
      <p className="mt-2 text-foreground/70">
        {state.booking.category.replace("-", " ")} · {state.booking.date}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label className="text-sm font-medium text-foreground">Rating</label>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setStars(n)}
                onMouseEnter={() => setHoveredStar(n)}
                onMouseLeave={() => setHoveredStar(0)}
                className="text-3xl leading-none"
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
              >
                {n <= (hoveredStar || stars) ? "★" : "☆"}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            htmlFor="comment"
            className="text-sm font-medium text-foreground"
          >
            Comment (optional)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            placeholder="How did it go?"
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 font-semibold text-white shadow-lg shadow-brand/20 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit review"}
        </button>
      </form>
    </main>
  );
}

export default function CreateReviewPage() {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <CreateReviewForm />
    </ProtectedRoute>
  );
}
