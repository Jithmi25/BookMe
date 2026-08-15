"use client";

import Link from "next/link";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminRoute } from "@/components/AdminRoute";
import { Booking } from "@/types/booking";

function DashboardContent() {
  const [usersSnap, usersLoading] = useCollection(collection(db, "users"));
  const [providersSnap, providersLoading] = useCollection(
    collection(db, "providers"),
  );
  const [bookingsSnap, bookingsLoading] = useCollection(
    collection(db, "bookings"),
  );
  const [pendingVerificationsSnap] = useCollection(
    query(collection(db, "providers"), where("nicVerified", "==", false)),
  );
  const [disputesSnap] = useCollection(
    query(
      collection(db, "bookings"),
      where("disputed", "==", true),
      where("disputeResolved", "==", false),
    ),
  );

  const bookings = bookingsSnap?.docs.map((d) => d.data() as Booking) ?? [];
  const totalCommission = bookings
    .filter((b) => b.status === "completed" && b.commissionAmount !== null)
    .reduce((sum, b) => sum + (b.commissionAmount ?? 0), 0);

  const loading = usersLoading || providersLoading || bookingsLoading;

  const stats = [
    { label: "Total users", value: usersSnap?.size ?? 0 },
    { label: "Total providers", value: providersSnap?.size ?? 0 },
    { label: "Total bookings", value: bookingsSnap?.size ?? 0 },
    { label: "Platform revenue (commission)", value: `LKR ${totalCommission}` },
    {
      label: "Pending verifications",
      value: pendingVerificationsSnap?.size ?? 0,
    },
    { label: "Open disputes", value: disputesSnap?.size ?? 0 },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">
        Admin dashboard
      </h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border bg-white p-4"
          >
            <p className="text-2xl font-semibold text-foreground">
              {loading ? "..." : stat.value}
            </p>
            <p className="mt-1 text-xs text-foreground/60">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/verifications"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          Verifications
        </Link>
        <Link
          href="/admin/disputes"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-brand-soft/40"
        >
          Disputes
        </Link>
        <Link
          href="/admin/users"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-brand-soft/40"
        >
          Users
        </Link>
      </div>
    </main>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminRoute>
      <DashboardContent />
    </AdminRoute>
  );
}
