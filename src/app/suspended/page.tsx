"use client";

import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";

export default function SuspendedPage() {
  const router = useRouter();
  const { signOut } = useAuthContext();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">
        Your account is suspended
      </h1>
      <p className="mt-3 text-foreground/70">
        Contact support if you believe this is a mistake.
      </p>
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-6 rounded-full border border-border px-6 py-2.5 text-sm font-medium text-foreground hover:bg-brand-soft/40"
      >
        Sign out
      </button>
    </main>
  );
}
