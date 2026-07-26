import Image from "next/image";
import Link from "next/link";

import logo from "@/assest/images/logo.png";

const highlights = [
  {
    title: "Trusted providers",
    description:
      "Showcase your services with a polished booking flow and a clear brand impression.",
  },
  {
    title: "Fast booking",
    description:
      "Keep the path from discovery to confirmation short, simple, and focused.",
  },
  {
    title: "Location-Based Search",
    description:
      "Show providers near customer location and filter by rating and price",
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-10 sm:px-10 lg:px-12">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
        <div className="flex flex-col justify-center gap-8">
          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-border bg-white/80 px-4 py-2 shadow-sm backdrop-blur">
            <Image
              src={logo}
              alt="BookMe logo"
              width={40}
              height={40}
              priority
            />
            <div className="leading-tight">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-strong">
                BookMe
              </p>
              <p className="text-sm text-foreground/70">
                Fast bookings with a calmer flow
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-strong">
              Book smarter
            </p>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Simple, Trusted, and Location-Aware platform.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-foreground/75">
              Customers can discover, compare, and book service providers and
              Service providers can create digital profiles, get bookings, and
              grow income.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signin"
              className="inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 font-semibold text-white shadow-lg shadow-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-brand-strong"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white/80 px-6 font-semibold text-foreground transition-colors hover:border-brand hover:bg-brand-soft"
            >
              Create account
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-white/85 p-6 shadow-xl shadow-brand/10 backdrop-blur">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-brand-soft via-white to-white p-6 ring-1 ring-brand/10">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand-strong">
                  Fast bookings with a calmer flow
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  Book Me
                </p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 text-right shadow-sm">
                <Image
                  src={logo}
                  alt="BookMe logo"
                  width={40}
                  height={40}
                  priority
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {highlights.map((item) => (
                <article
                  key={item.title}
                  className="rounded-2xl border border-border bg-white/90 p-4"
                >
                  <h2 className="text-lg font-semibold text-foreground">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm leading-7 text-foreground/70">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
