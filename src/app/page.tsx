"use client";

import { useState } from "react";
import { useProviders, ProviderFilters as Filters } from "@/hooks/useProviders";
import { ProviderFilters } from "@/components/providers/ProviderFilters";
import { ProviderCard } from "@/components/providers/ProviderCard";

export default function HomePage() {
  const [filters, setFilters] = useState<Filters>({});
  const { providers, loading, error } = useProviders(filters);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">
        Find trusted service providers
      </h1>
      <p className="mt-2 text-foreground/70">
        Browse verified providers near you — no account needed to look around.
      </p>

      <div className="mt-6">
        <ProviderFilters filters={filters} onChange={setFilters} />
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
            No providers match those filters yet.
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
