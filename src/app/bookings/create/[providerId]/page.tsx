"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { createBooking } from "@/lib/bookings";
import { Provider } from "@/types/provider";
import { PaymentMethod } from "@/types/booking";

function CreateBookingForm() {
  const params = useParams<{ providerId: string }>();
  const router = useRouter();
  const { firebaseUser, appUser } = useAuthContext();

  const [provider, setProvider] = useState<Provider | null | "not-found">(null);
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, "providers", params.providerId));
      if (snap.exists()) {
        const data = snap.data() as Provider;
        setProvider(data);
        setCategory(data.skills[0] ?? "");
      } else {
        setProvider("not-found");
      }
    }
    load();
  }, [params.providerId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !firebaseUser ||
      !appUser ||
      provider === null ||
      provider === "not-found"
    ) {
      return;
    }
    if (!date || !time) {
      setError("Pick a date and time.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const bookingId = await createBooking({
        customerId: firebaseUser.uid,
        customerName: appUser.name,
        providerId: provider.providerId,
        providerName: provider.name,
        category,
        date,
        time,
        note,
        paymentMethod,
      });
      router.push(`/bookings/confirmation?bookingId=${bookingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create booking");
    } finally {
      setSubmitting(false);
    }
  }

  if (provider === null) {
    return <div className="p-6 text-center text-foreground/70">Loading...</div>;
  }
  if (provider === "not-found") {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center">
        <p className="text-foreground/70">
          This provider profile doesn&apos;t exist.
        </p>
      </main>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <main className="mx-auto max-w-xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">
        Book {provider.name}
      </h1>
      <p className="mt-2 text-foreground/70">
        LKR {provider.priceMin}-{provider.priceMax} · final price is confirmed
        once {provider.name.split(" ")[0]} accepts
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label
            htmlFor="category"
            className="text-sm font-medium text-foreground"
          >
            What do you need help with?
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground"
          >
            {provider.skills.map((skill) => (
              <option key={skill} value={skill}>
                {skill.replace("-", " ")}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="date"
              className="text-sm font-medium text-foreground"
            >
              Date
            </label>
            <input
              id="date"
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground"
            />
          </div>
          <div>
            <label
              htmlFor="time"
              className="text-sm font-medium text-foreground"
            >
              Time
            </label>
            <input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground"
            />
          </div>
        </div>

        <div>
          <label htmlFor="note" className="text-sm font-medium text-foreground">
            Describe the problem
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="E.g. Kitchen sink is leaking under the cabinet"
            className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground"
          />
        </div>

        <fieldset>
          <legend className="text-sm font-medium text-foreground">
            Payment method
          </legend>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setPaymentMethod("cash")}
              className={`flex-1 rounded-2xl border px-4 py-3 text-sm ${
                paymentMethod === "cash"
                  ? "border-brand bg-brand-soft/60 text-brand-strong"
                  : "border-border text-foreground/70"
              }`}
            >
              Cash on completion
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("digital")}
              className={`flex-1 rounded-2xl border px-4 py-3 text-sm ${
                paymentMethod === "digital"
                  ? "border-brand bg-brand-soft/60 text-brand-strong"
                  : "border-border text-foreground/70"
              }`}
            >
              Pay online (PayHere)
            </button>
          </div>
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 font-semibold text-white shadow-lg shadow-brand/20 disabled:opacity-60"
        >
          {submitting ? "Booking..." : "Confirm booking"}
        </button>
      </form>
    </main>
  );
}

export default function CreateBookingPage() {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <CreateBookingForm />
    </ProtectedRoute>
  );
}
