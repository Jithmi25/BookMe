"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Provider } from "@/types/provider";
import { useAuthContext } from "@/context/AuthContext";
import { AvailabilityDisplay } from "@/components/providers/AvailabilityDisplay";
import { ReviewsSection } from "@/components/providers/ReviewsSection";

export default function PublicProviderProfilePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { firebaseUser, appUser } = useAuthContext();
  const [provider, setProvider] = useState<Provider | null | "not-found">(null);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "providers", params.id));
      setProvider(snap.exists() ? (snap.data() as Provider) : "not-found");
    }
    load();
  }, [params.id]);

  if (provider === null) {
    return <div className="p-6 text-center text-foreground/70">Loading...</div>;
  }

  if (provider === "not-found") {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center">
        <p className="text-foreground/70">
          This provider profile doesn&apos;t exist.
        </p>
      </main>
    );
  }

  function handleBookNow() {
    if (!firebaseUser) {
      router.push(
        `/auth/signin?redirect=/bookings/create/${provider.providerId}`,
      );
      return;
    }
    router.push(`/bookings/create/${provider.providerId}`);
  }

  const isOwnProfile = firebaseUser?.uid === provider.providerId;
  const isProvider = appUser?.role === "provider";

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="rounded-[2rem] border border-border bg-white p-8 shadow-xl shadow-brand/10">
        <div className="flex items-center gap-4">
          {provider.profilePhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.profilePhotoUrl}
              alt={provider.name}
              className="h-20 w-20 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft text-2xl font-semibold text-brand-strong">
              {provider.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              {provider.name}
            </h1>
            <p className="text-sm text-foreground/70">
              {provider.ratingCount > 0
                ? `${provider.ratingAvg.toFixed(1)} ★ (${provider.ratingCount} reviews)`
                : "No reviews yet"}
            </p>
            <div className="mt-1 flex gap-2">
              {provider.nicVerified && (
                <span className="rounded-full bg-brand-soft/60 px-2 py-0.5 text-xs text-brand-strong">
                  ID verified
                </span>
              )}
              {provider.photoVerified && (
                <span className="rounded-full bg-brand-soft/60 px-2 py-0.5 text-xs text-brand-strong">
                  Photo verified
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-medium text-foreground/70">Skills</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {provider.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-brand-soft/60 px-3 py-1 text-sm capitalize text-brand-strong"
              >
                {skill.replace("-", " ")}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-sm font-medium text-foreground/70">
            Service areas
          </h2>
          <p className="mt-2 text-foreground">
            {provider.serviceAreas.join(", ")}
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-sm font-medium text-foreground/70">
              Experience
            </h2>
            <p className="mt-2 text-foreground">
              {provider.experienceYears}
              {provider.experienceYears === 5 ? "+" : ""} years
            </p>
          </div>
          <div>
            <h2 className="text-sm font-medium text-foreground/70">
              Price range
            </h2>
            <p className="mt-2 text-foreground">
              LKR {provider.priceMin} - {provider.priceMax}
            </p>
          </div>
        </div>

        {provider.bio && (
          <div className="mt-6">
            <h2 className="text-sm font-medium text-foreground/70">About</h2>
            <p className="mt-2 text-foreground">{provider.bio}</p>
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-sm font-medium text-foreground/70">
            Weekly availability
          </h2>
          <div className="mt-2">
            <AvailabilityDisplay availability={provider.availability} />
          </div>
        </div>

        {isOwnProfile ? (
          <p className="mt-8 text-center text-sm text-foreground/50">
            This is your own profile — customers see a &quot;Book now&quot;
            button here.
          </p>
        ) : isProvider ? (
          <p className="mt-8 text-center text-sm text-foreground/50">
            Only customers can book providers.
          </p>
        ) : (
          <button
            type="button"
            onClick={handleBookNow}
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 font-semibold text-white shadow-lg shadow-brand/20 hover:bg-brand-strong"
          >
            Book now
          </button>
        )}

        <div className="mt-10 border-t border-border pt-6">
          <h2 className="text-lg font-semibold text-foreground">Reviews</h2>
          <div className="mt-4">
            <ReviewsSection providerId={provider.providerId} />
          </div>
        </div>
      </div>
    </main>
  );
}
