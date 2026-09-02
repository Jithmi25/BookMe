export default function ContactPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-16">
      <h1 className="text-3xl font-semibold text-foreground">Contact us</h1>
      <p className="text-base leading-7 text-foreground/70">
        Have a question, feedback, or need help with something? Get in touch and
        we&apos;ll get back to you as soon as we can.
      </p>

      <a
        href="mailto:support@bookme.example"
        className="mt-2 inline-flex w-fit items-center rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-strong"
      >
        Email us
      </a>
    </main>
  );
}
