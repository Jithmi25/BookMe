import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-10 sm:px-10">
      <section className="w-full rounded-[2rem] border border-border bg-white/85 p-8 text-center shadow-xl shadow-brand/10 backdrop-blur">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-strong">
          Page not found
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-foreground">
          This BookMe page does not exist.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-foreground/72">
          The route may have moved or been typed incorrectly. Return home to
          continue browsing the branded experience.
        </p>

        <Link
          href="/"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-brand px-6 font-semibold text-white shadow-lg shadow-brand/20 transition-transform hover:-translate-y-0.5 hover:bg-brand-strong"
        >
          Back to home
        </Link>
      </section>
    </main>
  );
}
