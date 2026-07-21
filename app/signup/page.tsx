import Image from "next/image";
import Link from "next/link";

import logo from "@/assest/images/logo.png";

export default function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-6 py-10 sm:px-10 lg:px-12">
      <section className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
        <div className="rounded-[2rem] border border-border bg-white/85 p-8 shadow-xl shadow-brand/10 backdrop-blur">
          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-border bg-brand-soft px-4 py-2">
            <Image src={logo} alt="BookMe logo" width={34} height={34} />
            <span className="text-sm font-semibold text-brand-strong">
              BookMe
            </span>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-foreground">
            Start your account
          </h1>
          <p className="mt-3 max-w-md text-base leading-7 text-foreground/72">
            Create an account to book faster, keep your details in one place,
            and stay within the same calm green visual system.
          </p>

          <div className="mt-8 grid gap-4 text-sm text-foreground/72 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-white p-4">
              Simple onboarding built around the logo palette.
            </div>
            <div className="rounded-2xl border border-border bg-brand-soft/60 p-4">
              Ready for bookings, reminders, and profile data.
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-white p-8 shadow-xl shadow-brand/10">
          <form className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
              />
            </div>

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
                autoComplete="new-password"
                placeholder="Create a password"
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/15"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 font-semibold text-white shadow-lg shadow-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-brand-strong"
            >
              Create account
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-foreground/70">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-semibold text-brand-strong hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
