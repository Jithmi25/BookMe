"use client";

import { SKILL_OPTIONS } from "@/types/provider";
import { ProviderFilters as Filters } from "@/hooks/useProviders";

interface ProviderFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function ProviderFilters({ filters, onChange }: ProviderFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white p-4">
      <select
        value={filters.category ?? ""}
        onChange={(e) =>
          onChange({ ...filters, category: e.target.value || undefined })
        }
        className="rounded-full border border-border px-3 py-2 text-sm"
      >
        <option value="">All categories</option>
        {SKILL_OPTIONS.map((skill) => (
          <option key={skill} value={skill}>
            {skill.replace("-", " ")}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Min price"
        value={filters.priceMin ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            priceMin: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        className="w-28 rounded-full border border-border px-3 py-2 text-sm"
      />

      <input
        type="number"
        placeholder="Max price"
        value={filters.priceMax ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            priceMax: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        className="w-28 rounded-full border border-border px-3 py-2 text-sm"
      />

      <select
        value={filters.ratingMin ?? ""}
        onChange={(e) =>
          onChange({
            ...filters,
            ratingMin: e.target.value ? Number(e.target.value) : undefined,
          })
        }
        className="rounded-full border border-border px-3 py-2 text-sm"
      >
        <option value="">Any rating</option>
        <option value="4">4+ stars</option>
        <option value="3">3+ stars</option>
      </select>

      <label className="flex items-center gap-2 text-sm text-foreground/80">
        <input
          type="checkbox"
          checked={filters.availableNow ?? false}
          onChange={(e) =>
            onChange({ ...filters, availableNow: e.target.checked })
          }
        />
        Available now
      </label>
    </div>
  );
}
