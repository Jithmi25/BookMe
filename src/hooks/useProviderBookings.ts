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
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(
        snapshot.docs.map((d) => ({ bookingId: d.id, ...d.data() }) as Booking),
      );
      setLoading(false);
    });

    return unsubscribe;
  }, [providerId]);

  return { bookings, loading };
}
