"use client";

import { useState } from "react";
import { Booking, BookingStatus } from "@/types/booking";
import {
  acceptBooking,
  rejectBooking,
  completeBooking,
} from "@/lib/bookingActions";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-brand-soft/60 text-brand-strong",
  rejected: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
};

export function ProviderBookingCard({ booking }: { booking: Booking }) {
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAccept() {
    const parsed = Number(amount);
    if (!parsed || parsed <= 0) {
      setError("Enter a valid price first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await acceptBooking(booking.bookingId, parsed);
      setShowAmountInput(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to accept");
    } finally {
      setBusy(false);
    }
  }

  async function handleReject() {
    setBusy(true);
    setError(null);
    try {
      await rejectBooking(booking.bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setBusy(false);
    }
  }

  async function handleComplete() {
    setBusy(true);
    setError(null);
    try {
      await completeBooking(booking.bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to mark complete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold text-foreground">{booking.customerName}</p>
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${STATUS_STYLES[booking.status]}`}
        >
          {booking.status}
        </span>
      </div>
      <p className="mt-1 text-sm capitalize text-foreground/70">
        {booking.category.replace("-", " ")}
      </p>
      <p className="mt-1 text-sm text-foreground/60">
        {booking.date} at {booking.time}
      </p>
      {booking.note && (
        <p className="mt-2 text-sm text-foreground/70">
          &ldquo;{booking.note}&rdquo;
        </p>
      )}
      {booking.amount !== null && (
        <p className="mt-2 text-sm font-medium text-foreground">
          LKR {booking.amount} · you earn LKR {booking.providerEarning}
        </p>
      )}

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {booking.status === "pending" && (
        <div className="mt-3">
          {showAmountInput ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                placeholder="Price (LKR)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-28 rounded-full border border-border px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={busy}
                onClick={handleAccept}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {busy ? "Confirming..." : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => setShowAmountInput(false)}
                className="text-sm text-foreground/60"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAmountInput(true)}
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white"
              >
                Accept
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={handleReject}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      )}

      {booking.status === "accepted" && (
        <button
          type="button"
          disabled={busy}
          onClick={handleComplete}
          className="mt-3 rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? "Updating..." : "Mark as completed"}
        </button>
      )}
    </div>
  );
}
