"use client";

import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminRoute } from "@/components/AdminRoute";
import { verifyProvider } from "@/lib/adminActions";
import { Provider } from "@/types/provider";

function VerificationRow({ provider }: { provider: Provider }) {
  const [busy, setBusy] = useState<"nic" | "photo" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDecision(type: "nic" | "photo", approved: boolean) {
    setBusy(type);
    setError(null);
    try {
      await verifyProvider(provider.providerId, type, approved);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-4">
      <div className="flex items-center gap-3">
        {provider.profilePhotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={provider.profilePhotoUrl}
            alt={provider.name}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-strong">
            {provider.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-foreground">{provider.name}</p>
          <p className="text-sm text-foreground/60">
            {provider.skills.slice(0, 3).join(", ")}
          </p>
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-3">
          <p className="text-sm font-medium text-foreground">
            NIC document {provider.nicVerified && "✓ verified"}
          </p>
          {provider.nicDocUrl ? (
            <a
              href={provider.nicDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-brand-strong hover:underline"
            >
              View document
            </a>
          ) : (
            <p className="mt-1 text-sm text-foreground/50">Not uploaded</p>
          )}
          {provider.nicDocUrl && !provider.nicVerified && (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                disabled={busy === "nic"}
                onClick={() => handleDecision("nic", true)}
                className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busy === "nic"}
                onClick={() => handleDecision("nic", false)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-border p-3">
          <p className="text-sm font-medium text-foreground">
            Profile photo {provider.photoVerified && "✓ verified"}
          </p>
          {provider.profilePhotoUrl ? (
            <a
              href={provider.profilePhotoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm text-brand-strong hover:underline"
            >
              View photo
            </a>
          ) : (
            <p className="mt-1 text-sm text-foreground/50">Not uploaded</p>
          )}
          {provider.profilePhotoUrl && !provider.photoVerified && (
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                disabled={busy === "photo"}
                onClick={() => handleDecision("photo", true)}
                className="rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busy === "photo"}
                onClick={() => handleDecision("photo", false)}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function VerificationsContent() {
  // Filtered client-side rather than an `or()` Firestore query (nicVerified
  // == false OR photoVerified == false) — keeps this working without extra
  // composite indexes, and provider counts are small enough at MVP scale
  // that fetching all providers and filtering in JS is a non-issue.
  const [snapshot, loading] = useCollection(collection(db, "providers"));

  const pending = (
    snapshot?.docs.map((d) => d.data() as Provider) ?? []
  ).filter((p) => !p.nicVerified || !p.photoVerified);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">
        Verification queue
      </h1>

      <div className="mt-6 space-y-4">
        {loading && (
          <p className="text-center text-foreground/60">Loading...</p>
        )}
        {!loading && pending.length === 0 && (
          <p className="text-center text-foreground/60">
            Nothing waiting on verification.
          </p>
        )}
        {pending.map((provider) => (
          <VerificationRow key={provider.providerId} provider={provider} />
        ))}
      </div>
    </main>
  );
}

export default function AdminVerificationsPage() {
  return (
    <AdminRoute>
      <VerificationsContent />
    </AdminRoute>
  );
}
