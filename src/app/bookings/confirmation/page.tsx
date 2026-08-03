"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getBooking } from "@/lib/bookings";
import { Booking } from "@/types/booking";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const { firebaseUser } = useAuthContext();

  const [booking, setBooking] = useState<Booking | null | "not-found">(null);

  useEffect(() => {
    async function load() {
      if (!bookingId) {
        setBooking("not-found");
        return;
      }
      const data = await getBooking(bookingId);
      setBooking(data ? (data as Booking) : "not-found");
    }
    load();
  }, [bookingId]);

  if (booking === null) {
    return <div className="p-6 text-center text-foreground/70">Loading...</div>;
  }

  if (booking === "not-found" || booking.customerId !== firebaseUser?.uid) {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center">
        <p className="text-foreground/70">Booking not found.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <div className="rounded-[2rem] border border-border bg-white p-8 text-center shadow-xl shadow-brand/10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-2xl text-brand-strong">
          ✓
        </div>
        <h1 className="mt-4 text-2xl font-semibold text-foreground">
          Booking request sent
        </h1>
        <p className="mt-2 text-foreground/70">
          {booking.providerName} will confirm your booking shortly.
        </p>

        <div className="mt-6 space-y-2 rounded-2xl bg-brand-soft/30 p-4 text-left text-sm">
          <div className="flex justify-between">
            <span className="text-foreground/60">Booking ID</span>
            <span className="font-mono text-foreground">
              {booking.bookingId}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Service</span>
            <span className="capitalize text-foreground">
              {booking.category.replace("-", " ")}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Date & time</span>
            <span className="text-foreground">
              {booking.date} at {booking.time}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Payment</span>
            <span className="capitalize text-foreground">
              {booking.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-foreground/60">Status</span>
            <span className="capitalize text-foreground">{booking.status}</span>
          </div>
        </div>

        <Link
          href="/bookings/history"
          className="mt-6 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-strong"
        >
          View my bookings
        </Link>
      </div>
    </main>
  );
}

export default function BookingConfirmationPage() {
  return (
    <ProtectedRoute>
      <ConfirmationContent />
    </ProtectedRoute>
  );
}
