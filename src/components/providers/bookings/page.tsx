"use client";

import { useState } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useProviderBookings } from "@/hooks/useProviderBookings";
import { ProviderBookingCard } from "@/components/provider/ProviderBookingCard";
import { BookingStatus } from "@/types/booking";

const TABS: { key: BookingStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "completed", label: "Completed" },
  { key: "all", label: "All" },
];

function BookingInboxContent() {
  const { firebaseUser } = useAuthContext();
  const { bookings, loading } = useProviderBookings(firebaseUser?.uid);
  const [tab, setTab] = useState<BookingStatus | "all">("pending");

  const filtered =
    tab === "all" ? bookings : bookings.filter((b) => b.status === tab);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">Bookings</h1>

      <div className="mt-6 flex gap-2 rounded-lg bg-gray-100 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-md py-2 text-sm font-medium ${
              tab === t.key ? "bg-white shadow" : "text-gray-500"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {loading && (
          <p className="text-center text-foreground/60">Loading...</p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-center text-foreground/60">
            No {tab === "all" ? "" : tab} bookings here.
          </p>
        )}
        {filtered.map((booking) => (
          <ProviderBookingCard key={booking.bookingId} booking={booking} />
        ))}
      </div>
    </main>
  );
}

export default function ProviderBookingsPage() {
  return (
    <ProtectedRoute allowedRoles={["provider"]}>
      <BookingInboxContent />
    </ProtectedRoute>
  );
}
