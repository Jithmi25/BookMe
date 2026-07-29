"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Provider } from "@/types/provider";

function ViewProviderProfileContent() {
  const { firebaseUser } = useAuthContext();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!firebaseUser) return;
      const snap = await getDoc(doc(db, "providers", firebaseUser.uid));
      setProvider(snap.exists() ? (snap.data() as Provider) : null);
      setLoading(false);
    }
    load();
  }, [firebaseUser]);

  if (loading) {
    return <div className="p-6 text-center text-foreground/70">Loading...</div>;
  }

  if (!provider) {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center">
        <p className="text-foreground/70">
          You haven&apos;t set up your provider profile yet.
        </p>
        <Link
          href="/providers/profile/edit"
          className="mt-4 inline-block rounded-full bg-brand px-6 py-3 font-semibold text-white"
        >
          Create profile
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground">Your profile</h1>
        <Link
          href="/providers/profile/edit"
          className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-brand-soft/40"
        >
          Edit
        </Link>
      </div>

      <div className="mt-6 space-y-6 rounded-[2rem] border border-border bg-white p-8 shadow-xl shadow-brand/10">
        <div>
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

        <div>
          <h2 className="text-sm font-medium text-foreground/70">
            Service areas
          </h2>
          <p className="mt-2 text-foreground">
            {provider.serviceAreas.join(", ")}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div>
            <h2 className="text-sm font-medium text-foreground/70">Bio</h2>
            <p className="mt-2 text-foreground">{provider.bio}</p>
          </div>
        )}

        <div>
          <h2 className="text-sm font-medium text-foreground/70">
            Verification
          </h2>
          <p className="mt-2 text-sm text-foreground/70">
            NIC: {provider.nicVerified ? "Verified" : "Pending"} · Photo:{" "}
            {provider.photoVerified ? "Verified" : "Pending"}
          </p>
        </div>
      </div>
    </main>
  );
}

export default function ViewProviderProfilePage() {
  return (
    <ProtectedRoute allowedRoles={["provider"]}>
      <ViewProviderProfileContent />
    </ProtectedRoute>
  );
}
