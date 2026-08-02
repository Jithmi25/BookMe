import { useCollection } from "react-firebase-hooks/firestore";
import {
  collection,
  query,
  where,
  orderBy,
  QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Provider } from "@/types/provider";

export interface ProviderFilters {
  category?: string; // matches Provider.skills entries
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
  availableNow?: boolean;
}

/**
 * Fetches providers, applying what Firestore can do server-side (category via
 * array-contains, sorted by rating), then filtering price/rating/availability
 * client-side. The plan's original draft passed `filters?.category || null`
 * straight into `where("skills", "array-contains", ...)` — that throws when
 * no category is selected, since array-contains against null isn't a valid
 * query. This only adds the constraint when a category is actually chosen.
 *
 * Price/rating/availability stay client-side rather than Firestore range
 * queries to avoid needing a composite index per filter combination — fine
 * at MVP provider-count scale; worth revisiting with indexed queries if the
 * provider list grows large.
 */
export function useProviders(filters?: ProviderFilters) {
  const constraints: QueryConstraint[] = [];

  if (filters?.category) {
    constraints.push(where("skills", "array-contains", filters.category));
  }
  constraints.push(orderBy("ratingAvg", "desc"));

  const q = query(collection(db, "providers"), ...constraints);
  const [snapshot, loading, error] = useCollection(q);

  let providers: Provider[] =
    snapshot?.docs.map((d) => d.data() as Provider) ?? [];

  if (filters?.priceMin !== undefined) {
    providers = providers.filter((p) => p.priceMax >= filters.priceMin!);
  }
  if (filters?.priceMax !== undefined) {
    providers = providers.filter((p) => p.priceMin <= filters.priceMax!);
  }
  if (filters?.ratingMin !== undefined) {
    providers = providers.filter((p) => p.ratingAvg >= filters.ratingMin!);
  }
  if (filters?.availableNow) {
    providers = providers.filter((p) => isAvailableNow(p));
  }

  return { providers, loading, error };
}

function isAvailableNow(provider: Provider): boolean {
  const days: (keyof Provider["availability"])[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const now = new Date();
  const today = days[now.getDay()];
  const slot = provider.availability[today];
  if (!slot.available) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = slot.start.split(":").map(Number);
  const [endH, endM] = slot.end.split(":").map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
}
