import Link from "next/link";
import { Provider } from "@/types/provider";

export function ProviderCard({ provider }: { provider: Provider }) {
  return (
    <Link
      href={`/providers/${provider.providerId}`}
      className="block rounded-2xl border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/10"
    >
      <div className="flex items-center gap-3">
        {provider.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={provider.profilePhotoUrl}
            alt={provider.name}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-lg font-semibold text-brand-strong">
            {provider.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground">{provider.name}</p>
          <p className="text-sm text-foreground/60">
            {provider.ratingCount > 0
              ? `${provider.ratingAvg.toFixed(1)} ★ (${provider.ratingCount})`
              : "No reviews yet"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {provider.skills.slice(0, 3).map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-brand-soft/60 px-2.5 py-1 text-xs capitalize text-brand-strong"
          >
            {skill.replace("-", " ")}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-foreground/70">
          {provider.serviceAreas.slice(0, 2).join(", ")}
        </span>
        <span className="font-medium text-foreground">
          LKR {provider.priceMin}-{provider.priceMax}
        </span>
      </div>
    </Link>
  );
}
