"use client";

import { useAuthContext } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useProviderBookings } from "@/hooks/useProviderBookings";
import { Booking } from "@/types/booking";

function toMillis(value: unknown): number {
  if (value && typeof value === "object" && "toMillis" in value) {
    return (value as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}

function monthKey(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function EarningsContent() {
  const { firebaseUser } = useAuthContext();
  const { bookings, loading } = useProviderBookings(firebaseUser?.uid);

  const completed = bookings.filter(
    (b): b is Booking & { providerEarning: number; completedAt: object } =>
      b.status === "completed" &&
      b.providerEarning !== null &&
      b.completedAt !== null,
  );

  const totalEarnings = completed.reduce(
    (sum, b) => sum + b.providerEarning,
    0,
  );
  const totalCommission = completed.reduce(
    (sum, b) => sum + (b.commissionAmount ?? 0),
    0,
  );

  const byMonth = new Map<
    string,
    { earnings: number; commission: number; count: number }
  >();
  for (const booking of completed) {
    const key = monthKey(toMillis(booking.completedAt));
    const existing = byMonth.get(key) ?? {
      earnings: 0,
      commission: 0,
      count: 0,
    };
    existing.earnings += booking.providerEarning;
    existing.commission += booking.commissionAmount ?? 0;
    existing.count += 1;
    byMonth.set(key, existing);
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">Earnings</h1>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-white p-4">
          <p className="text-2xl font-semibold text-foreground">
            {loading ? "..." : `LKR ${totalEarnings}`}
          </p>
          <p className="mt-1 text-xs text-foreground/60">Total earnings</p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-4">
          <p className="text-2xl font-semibold text-foreground">
            {loading ? "..." : `LKR ${totalCommission}`}
          </p>
          <p className="mt-1 text-xs text-foreground/60">Commission paid</p>
        </div>
      </div>

      <h2 className="mt-8 text-lg font-semibold text-foreground">
        Monthly breakdown
      </h2>
      <div className="mt-3 overflow-hidden rounded-2xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-brand-soft/30 text-left text-foreground/70">
            <tr>
              <th className="px-4 py-2 font-medium">Month</th>
              <th className="px-4 py-2 font-medium">Jobs</th>
              <th className="px-4 py-2 font-medium">Commission</th>
              <th className="px-4 py-2 font-medium">Earned</th>
            </tr>
          </thead>
          <tbody>
            {byMonth.size === 0 && !loading && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-4 text-center text-foreground/60"
                >
                  No completed bookings yet.
                </td>
              </tr>
            )}
            {[...byMonth.entries()].map(([month, data]) => (
              <tr key={month} className="border-t border-border">
                <td className="px-4 py-2 text-foreground">{month}</td>
                <td className="px-4 py-2 text-foreground/80">{data.count}</td>
                <td className="px-4 py-2 text-foreground/80">
                  LKR {data.commission}
                </td>
                <td className="px-4 py-2 font-medium text-foreground">
                  LKR {data.earnings}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-brand-soft/20 p-4 text-sm text-foreground/70">
        Payout scheduling and bank transfer setup are coming in a later phase.
        For now, completed bookings shown here are tracked but not yet
        automatically paid out.
      </div>
    </main>
  );
}

export default function ProviderEarningsPage() {
  return (
    <ProtectedRoute allowedRoles={["provider"]}>
      <EarningsContent />
    </ProtectedRoute>
  );
}
