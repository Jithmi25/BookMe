"use client";

import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminRoute } from "@/components/AdminRoute";
import { resolveDispute } from "@/lib/adminActions";
import { Booking } from "@/types/booking";

function DisputeCard({ booking }: { booking: Booking }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleResolve() {
    setBusy(true);
    setError(null);
    try {
      await resolveDispute(booking.bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resolve");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-foreground">
          {booking.customerName} ↔ {booking.providerName}
        </p>
        <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
          Raised by {booking.disputeRaisedBy}
        </span>
      </div>
      <p className="mt-1 text-sm capitalize text-foreground/70">
        {booking.category.replace("-", " ")} · {booking.date} at {booking.time}
      </p>
      {booking.amount !== null && (
        <p className="mt-1 text-sm text-foreground/70">
          Amount: LKR {booking.amount} · Status: {booking.status}
        </p>
      )}
      {booking.disputeReason && (
        <p className="mt-2 rounded-xl bg-red-50 p-3 text-sm text-foreground/80">
          &ldquo;{booking.disputeReason}&rdquo;
        </p>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {/* Refunds aren't wired here — Stripe isn't connected until Phase 10.
          Once it is, this button's action needs a refund Cloud Function
          alongside marking the dispute resolved. */}
      <button
        type="button"
        disabled={busy}
        onClick={handleResolve}
        className="mt-3 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
      >
        {busy ? "Resolving..." : "Mark resolved"}
      </button>
    </div>
  );
}

function DisputesContent() {
  const q = query(collection(db, "bookings"), where("disputed", "==", true));
  const [snapshot, loading] = useCollection(q);

  const disputes = (snapshot?.docs.map((d) => ({
    bookingId: d.id,
    ...d.data(),
  })) ?? []) as Booking[];

  disputes.sort((a, b) => {
    const getMs = (val: unknown): number => {
      if (!val) return 0;
      if (typeof val === "number") return val;
      if (
        typeof val === "object" &&
        val !== null &&
        "toMillis" in val &&
        typeof (val as { toMillis: () => number }).toMillis === "function"
      ) {
        return (val as { toMillis: () => number }).toMillis();
      }
      if (
        typeof val === "object" &&
        val !== null &&
        "seconds" in val &&
        typeof (val as { seconds: number }).seconds === "number"
      ) {
        return (val as { seconds: number }).seconds * 1000;
      }
      const parsed = new Date(val as string | number).getTime();
      return isNaN(parsed) ? 0 : parsed;
    };
    return getMs(b.createdAt) - getMs(a.createdAt);
  });

  const open = disputes.filter((d) => !d.disputeResolved);
  const resolved = disputes.filter((d) => d.disputeResolved);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">Disputes</h1>
      <p className="mt-2 text-sm text-foreground/60">
        Disputes are tracked as a flag on the booking itself — there&apos;s no
        separate dispute record, refund automation, or messaging thread yet.
      </p>

      <h2 className="mt-8 text-lg font-semibold text-foreground">
        Open ({loading ? "..." : open.length})
      </h2>
      <div className="mt-3 space-y-3">
        {!loading && open.length === 0 && (
          <p className="text-center text-foreground/60">No open disputes.</p>
        )}
        {open.map((booking) => (
          <DisputeCard key={booking.bookingId} booking={booking} />
        ))}
      </div>

      {resolved.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-semibold text-foreground">
            Resolved ({resolved.length})
          </h2>
          <div className="mt-3 space-y-3 opacity-60">
            {resolved.map((booking) => (
              <DisputeCard key={booking.bookingId} booking={booking} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

export default function AdminDisputesPage() {
  return (
    <AdminRoute>
      <DisputesContent />
    </AdminRoute>
  );
}
