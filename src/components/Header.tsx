"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import logo from "@/assest/images/logo.png";
import { useAuthContext } from "@/context/AuthContext";

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { firebaseUser, appUser, loading, signOut } = useAuthContext();

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  const homeHref =
    appUser?.role === "provider"
      ? "/provider/dashboard"
      : appUser?.role === "admin"
        ? "/admin/dashboard"
        : "/";

  const primaryLinks =
    appUser?.role === "provider"
      ? [
          { href: "/provider/dashboard", label: "Dashboard" },
          { href: "/provider/bookings", label: "Bookings" },
          { href: "/providers/profile/view", label: "My profile" },
        ]
      : appUser?.role === "customer"
        ? [{ href: "/bookings/history", label: "My bookings" }]
        : appUser?.role === "admin"
          ? [
              { href: "/admin/dashboard", label: "Admin" },
              { href: "/admin/users", label: "Users" },
              { href: "/admin/disputes", label: "Disputes" },
            ]
          : [{ href: "/", label: "Browse providers" }];

  // Shown for everyone, regardless of sign-in state or role.
  const staticLinks = [{ href: "/contact", label: "Contact us" }];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border/80 bg-white/90 backdrop-blur supports-backdrop-filter:bg-white/80">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-1">
          <Link href={homeHref} className="flex items-center gap-3 self-start">
            <Image
              src={logo}
              alt="BookMe logo"
              width={40}
              height={40}
              style={{ height: "auto" }}
            />
            <div>
              <span className="block text-sm font-semibold tracking-wide text-brand-strong">
                BookMe
              </span>
              <span className="block text-xs text-foreground/60">
                {appUser?.role === "provider"
                  ? "Manage bookings and availability"
                  : appUser?.role === "admin"
                    ? "Review users, disputes, and verifications"
                    : "Find and book trusted service providers"}
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          {!loading &&
            primaryLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${isActive(link.href) ? "bg-brand-soft text-brand-strong" : "text-foreground/80 hover:bg-brand-soft/30 hover:text-foreground"}`}
              >
                {link.label}
              </Link>
            ))}

          {staticLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${isActive(link.href) ? "bg-brand-soft text-brand-strong" : "text-foreground/80 hover:bg-brand-soft/30 hover:text-foreground"}`}
            >
              {link.label}
            </Link>
          ))}

          {loading ? null : !firebaseUser ? (
            <>
              <Link
                href="/auth/signin"
                className="rounded-full px-3 py-2 text-sm font-medium text-foreground/80 hover:bg-brand-soft/30 hover:text-foreground"
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-strong"
              >
                Sign up
              </Link>
            </>
          ) : !appUser?.role ? (
            <>
              <Link
                href="/auth/role-selection"
                className="rounded-full bg-brand-soft px-3 py-2 text-sm font-semibold text-brand-strong hover:bg-brand-soft/80"
              >
                Finish setting up your account
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full px-3 py-2 text-sm font-medium text-foreground/60 hover:bg-brand-soft/30 hover:text-foreground"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-brand-soft/40"
            >
              Sign out
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
