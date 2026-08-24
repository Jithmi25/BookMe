import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Booking } from "@/types/booking";

// Requires a composite index (providerId ==, createdAt desc) — Firestore
// throws a direct "create index" link the first time this runs against
// real data if it isn't there yet.
export function useProviderBookings(providerId: string | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!providerId) return;

    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", providerId),
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list = snapshot.docs.map(
          (d) => ({ bookingId: d.id, ...d.data() }) as Booking,
        );
        list.sort((a, b) => {
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
        setBookings(list);
        setLoading(false);
      },
      (err) => {
        console.error("Failed to listen to provider bookings:", err);
        setLoading(false);
      },
    );

    return unsubscribe;
  }, [providerId]);

  return { bookings, loading };
}
