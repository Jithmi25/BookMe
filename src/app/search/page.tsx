"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProviders, ProviderFilters as Filters } from "@/hooks/useProviders";
import { ProviderFilters } from "@/components/providers/ProviderFilters";
import { ProviderCard } from "@/components/providers/ProviderCard";

function parseFiltersFromParams(params: URLSearchParams): Filters {
  return {
    category: params.get("category") ?? undefined,
    priceMin: params.get("priceMin")
      ? Number(params.get("priceMin"))
      : undefined,
    priceMax: params.get("priceMax")
      ? Number(params.get("priceMax"))
      : undefined,
    ratingMin: params.get("ratingMin")
      ? Number(params.get("ratingMin"))
      : undefined,
    availableNow: params.get("availableNow") === "true" || undefined,
  };
}

function filtersToSearchString(filters: Filters): string {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.priceMin !== undefined)
    params.set("priceMin", String(filters.priceMin));
  if (filters.priceMax !== undefined)
    params.set("priceMax", String(filters.priceMax));
  if (filters.ratingMin !== undefined)
    params.set("ratingMin", String(filters.ratingMin));
  if (filters.availableNow) params.set("availableNow", "true");
  return params.toString();
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto w-full max-w-6xl px-6 py-10">
          <p className="text-center text-foreground/60">Loading providers...</p>
        </main>
      }
    >
      <SearchInner />
    </Suspense>
  );
}

function SearchInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseFiltersFromParams(searchParams);
  const { providers, loading, error } = useProviders(filters);

  function handleFiltersChange(next: Filters) {
    const qs = filtersToSearchString(next);
    router.replace(qs ? `/search?${qs}` : "/search");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">Search results</h1>
      <p className="mt-2 text-foreground/70">
        {providers.length} provider{providers.length === 1 ? "" : "s"} found
      </p>

      <div className="mt-6">
        <ProviderFilters filters={filters} onChange={handleFiltersChange} />
      </div>

      <div className="mt-6">
        {loading && (
          <p className="text-center text-foreground/60">Loading providers...</p>
        )}
        {error && (
          <p className="text-center text-red-600">
            Couldn&apos;t load providers right now.
          </p>
        )}
        {!loading && !error && providers.length === 0 && (
          <p className="text-center text-foreground/60">
            No providers match those filters.
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((provider) => (
            <ProviderCard key={provider.providerId} provider={provider} />
          ))}
        </div>
      </div>
    </main>
  );
}
