"use client";

import Link from "next/link";
import { useAuthContext } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useProviderBookings } from "@/hooks/useProviderBookings";

function isThisMonth(timestampMs: number): boolean {
  const now = new Date();
  const d = new Date(timestampMs);
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}

function toMillis(value: unknown): number {
  // Firestore Timestamps have a toMillis() method; fall back to Date.now()
  // for the brief window before serverTimestamp() resolves locally.
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}

function DashboardContent() {
  const { firebaseUser, appUser } = useAuthContext();
  const { bookings, loading } = useProviderBookings(firebaseUser?.uid);

  const bookingsThisMonth = bookings.filter((b) =>
    isThisMonth(toMillis(b.createdAt)),
  );
  const earningsThisMonth = bookings
    .filter(
      (b) =>
        b.status === "completed" &&
        b.completedAt &&
        isThisMonth(toMillis(b.completedAt)) &&
        b.providerEarning !== null,
    )
    .reduce((sum, b) => sum + (b.providerEarning ?? 0), 0);
  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const stats = [
    { label: "Bookings this month", value: bookingsThisMonth.length },
    { label: "Earnings this month", value: `LKR ${earningsThisMonth}` },
    { label: "Pending requests", value: pendingCount },
    {
      label: "Average rating",
      value: appUser?.role === "provider" ? "See profile" : "-",
    },
  ];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

      <div className="mt-8 flex gap-3">
        <Link
          href="/provider/bookings"
          className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-strong"
        >
          View bookings
        </Link>
        <Link
          href="/provider/earnings"
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium text-foreground hover:bg-brand-soft/40"
        >
          View earnings
        </Link>
      </div>

      {pendingCount > 0 && (
        <div className="mt-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          You have {pendingCount} pending booking{pendingCount === 1 ? "" : "s"}{" "}
          waiting for a response.
        </div>
      )}
    </main>
  );
}

export default function ProviderDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["provider"]}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
