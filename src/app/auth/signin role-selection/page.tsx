"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import logo from "@/assest/images/logo.png";
import { useAuthContext } from "@/context/AuthContext.tsx";
import { UserRole } from "@/types/user";

export default function RoleSelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { firebaseUser, appUser, loading, completeRoleSelection, error } =
    useAuthContext();

  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [name, setName] = useState(searchParams.get("name") ?? "");
  const [submitting, setSubmitting] = useState(false);

  // Not signed in at all → back to sign-in
  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.replace("/auth/signin");
    }
  }, [loading, firebaseUser, router]);

  // Already has a role → nothing to do here
  useEffect(() => {
    if (!loading && appUser?.role) {
      router.replace("/");
    }
  }, [loading, appUser, router]);

  async function handleContinue() {
    if (!selectedRole || !name.trim()) return;
    setSubmitting(true);
    try {
      await completeRoleSelection(selectedRole, name.trim());
      // Phase 3 (Days 7-9) replaces this with the real onboarding forms.
      router.push("/");
    } catch {
      // error already captured in AuthContext's `error` state
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-foreground/70">Loading...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-10">
      <section className="w-full rounded-[2rem] border border-border bg-white p-8 shadow-xl shadow-brand/10">
        <div className="inline-flex w-fit items-center gap-3 rounded-full border border-border bg-brand-soft px-4 py-2">
          <Image src={logo} alt="BookMe logo" width={34} height={34} />
          <span className="text-sm font-semibold text-brand-strong">
            BookMe
          </span>
        </div>

        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-foreground">
          Tell us about you
        </h1>
        <p className="mt-2 text-base leading-7 text-foreground/72">
          This helps us set up the right experience for you.
        </p>

        <div className="mt-6">
          <label htmlFor="name" className="text-sm font-medium text-foreground">
            Your name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setSelectedRole("customer")}
            className={`rounded-2xl border p-5 text-left transition ${
              selectedRole === "customer"
                ? "border-brand bg-brand-soft/60 ring-4 ring-brand/15"
                : "border-border bg-white"
            }`}
          >
            <div className="font-semibold text-foreground">
              I need a service
            </div>
            <div className="mt-1 text-sm text-foreground/70">
              Book a provider
            </div>
          </button>

          <button
            type="button"
            onClick={() => setSelectedRole("provider")}
            className={`rounded-2xl border p-5 text-left transition ${
              selectedRole === "provider"
                ? "border-brand bg-brand-soft/60 ring-4 ring-brand/15"
                : "border-border bg-white"
            }`}
          >
            <div className="font-semibold text-foreground">
              I provide a service
            </div>
            <div className="mt-1 text-sm text-foreground/70">Get bookings</div>
          </button>
        </div>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

        <button
          type="button"
          disabled={submitting || !selectedRole || !name.trim()}
          onClick={handleContinue}
          className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 font-semibold text-white shadow-lg shadow-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-brand-strong disabled:opacity-60"
        >
          {submitting ? "Setting up..." : "Continue"}
        </button>
      </section>
    </main>
  );
}
