"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "@/assest/images/logo.png";
import { useAuthContext } from "@/context/AuthContext";

export function Header() {
  const router = useRouter();
  const { firebaseUser, appUser, loading, signOut } = useAuthContext();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src={logo}
            alt="BookMe logo"
            width={28}
            height={28}
            style={{ height: "auto" }}
          />
          <span className="text-sm font-semibold text-brand-strong">
            BookMe
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          {loading ? null : !firebaseUser ? (
            <>
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-foreground/80 hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-strong"
              >
                Sign up
              </Link>
            </>
          ) : !appUser?.role ? (
            <>
              <Link
                href="/auth/role-selection"
                className="text-sm font-medium text-brand-strong"
              >
                Finish setting up your account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-sm font-medium text-foreground/60 hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              {appUser.role === "provider" && (
                <>
                  <Link
                    href="/provider/dashboard"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/providers/profile/view"
                    className="text-sm font-medium text-foreground/80 hover:text-foreground"
                  >
                    My profile
                  </Link>
                </>
              )}
              <span className="text-sm text-foreground/60">
                Hi, {appUser.name.split(" ")[0]}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-brand-soft/40"
              >
                Sign out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
