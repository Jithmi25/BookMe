import Image from "next/image";
import Link from "next/link";

import logo from "@/assest/images/logo.png";

export default function SignInPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 sm:px-10 lg:px-12">
      <section className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
        <div className="flex flex-col justify-center rounded-[2rem] border border-border bg-white/80 p-8 shadow-xl shadow-brand/10 backdrop-blur">
          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-border bg-brand-soft px-4 py-2">
            <Image src={logo} alt="BookMe logo" width={34} height={34} />
            <span className="text-sm font-semibold text-brand-strong">
              BookMe
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground">
            Welcome back
          </h1>
          <p className="mt-3 max-w-md text-base leading-7 text-foreground/72">
            Sign in to manage bookings, keep your schedule organized, and
            continue in the same green-branded experience.
          </p>

          <div className="mt-8 grid gap-4 text-sm text-foreground/72 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-brand-soft/60 p-4">
              Secure access and a clean login flow.
            </div>
            <div className="rounded-2xl border border-border bg-white p-4">
              Designed to match the logo palette.
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-white p-8 shadow-xl shadow-brand/10">
          <form className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 font-semibold text-white shadow-lg shadow-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-brand-strong"
            >
              Sign in
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/70">
            New to BookMe?{" "}
            <Link
              href="/signup"
              className="font-semibold text-brand-strong hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
