"use client";

import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Booking, BookingStatus } from "@/types/booking";

const STATUS_STYLES: Record<BookingStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-brand-soft/60 text-brand-strong",
  rejected: "bg-red-100 text-red-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
};

function BookingHistoryContent() {
  const { firebaseUser } = useAuthContext();

  const q = firebaseUser
    ? query(
        collection(db, "bookings"),
        where("customerId", "==", firebaseUser.uid),
        orderBy("createdAt", "desc"),
      )
    : null;
  const [snapshot, loading, error] = useCollection(q);

  const bookings = snapshot?.docs.map((d) => ({
    bookingId: d.id,
    ...d.data(),
  })) as Booking[] | undefined;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">Your bookings</h1>

      <div className="mt-6 space-y-3">
        {loading && (
          <p className="text-center text-foreground/60">Loading...</p>
        )}
        {error && (
          <p className="text-center text-red-600">
            Couldn&apos;t load your bookings right now.
          </p>
        )}
        {!loading && bookings?.length === 0 && (
          <p className="text-center text-foreground/60">
            No bookings yet — browse providers to get started.
          </p>
        )}

        {bookings?.map((booking) => (
          <div
            key={booking.bookingId}
            className="rounded-2xl border border-border bg-white p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-foreground">
                {booking.providerName}
              </p>
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
          </div>
        ))}
      </div>
    </main>
  );
}

export default function BookingHistoryPage() {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <BookingHistoryContent />
    </ProtectedRoute>
  );
}
