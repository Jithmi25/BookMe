"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuthContext } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { getPayHereHash } from "@/lib/payhereActions";
import { Booking } from "@/types/booking";

const PAYHERE_SANDBOX = process.env.NEXT_PUBLIC_PAYHERE_MODE !== "live";

type LoadState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "not-yours" }
  | { status: "not-payable" }
  | { status: "already-paid" }
  | { status: "ready"; booking: Booking };

function CheckoutContent() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();
  const { firebaseUser, appUser } = useAuthContext();

  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [scriptReady, setScriptReady] = useState(false);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    async function load() {
      if (!firebaseUser) return;
      const snap = await getDoc(doc(db, "bookings", params.bookingId));
      if (!snap.exists()) {
        setState({ status: "not-found" });
        return;
      }
      const booking = { bookingId: snap.id, ...snap.data() } as Booking;

      if (booking.customerId !== firebaseUser.uid) {
        setState({ status: "not-yours" });
        return;
      }
      if (booking.paymentStatus === "completed") {
        setState({ status: "already-paid" });
        return;
      }
      if (
        booking.status !== "accepted" ||
        booking.paymentMethod !== "digital" ||
        booking.amount === null
      ) {
        setState({ status: "not-payable" });
        return;
      }
      setState({ status: "ready", booking });
    }
    load();
  }, [firebaseUser, params.bookingId]);

  // Once payment completes, the notify webhook updates Firestore — listen
  // live rather than trusting the SDK's onCompleted callback alone, since
  // that fires client-side before the server has necessarily processed
  // anything.
  useEffect(() => {
    if (state.status !== "ready") return;
    const unsubscribe = onSnapshot(
      doc(db, "bookings", params.bookingId),
      (snap) => {
        const data = snap.data();
        if (data?.paymentStatus === "completed") {
          setJustCompleted(true);
        }
      },
    );
    return unsubscribe;
  }, [state.status, params.bookingId]);

  async function handlePay() {
    if (state.status !== "ready" || !appUser || !window.payhere) return;
    if (!address.trim() || !city.trim()) {
      setError("Enter your address and city first.");
      return;
    }

    setPaying(true);
    setError(null);
    try {
      const { merchantId, orderId, amount, currency, hash } =
        await getPayHereHash(params.bookingId);

      const [firstName, ...rest] = appUser.name.trim().split(" ");
      const lastName = rest.join(" ") || firstName;

      window.payhere.onCompleted = () => {
        setPaying(false);
        // Firestore listener above will flip justCompleted once the
        // notify webhook lands — usually within a couple of seconds.
      };
      window.payhere.onDismissed = () => {
        setPaying(false);
      };
      window.payhere.onError = (msg) => {
        setPaying(false);
        setError(msg);
      };

      window.payhere.startPayment({
        sandbox: PAYHERE_SANDBOX,
        merchant_id: merchantId,
        notify_url: process.env.NEXT_PUBLIC_PAYHERE_NOTIFY_URL as string,
        order_id: orderId,
        items: `${state.booking.category} — BookMe`,
        amount,
        currency,
        first_name: firstName,
        last_name: lastName,
        email: appUser.email ?? "",
        phone: appUser.phone ?? "",
        address,
        city,
        country: "Sri Lanka",
        hash,
      });
    } catch (err) {
      setPaying(false);
      setError(err instanceof Error ? err.message : "Failed to start payment");
    }
  }

  if (state.status === "loading") {
    return <div className="p-6 text-center text-foreground/70">Loading...</div>;
  }
  if (state.status === "not-found") {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center text-foreground/70">
        Booking not found.
      </main>
    );
  }
  if (state.status === "not-yours") {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center text-foreground/70">
        This isn&apos;t your booking.
      </main>
    );
  }
  if (state.status === "already-paid") {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center text-foreground/70">
        This booking is already paid.
      </main>
    );
  }
  if (state.status === "not-payable") {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center text-foreground/70">
        This booking isn&apos;t ready for payment yet — it needs to be accepted
        with digital payment selected first.
      </main>
    );
  }

  if (justCompleted) {
    return (
      <main className="mx-auto max-w-xl px-6 py-10 text-center">
        <div className="rounded-[2rem] border border-border bg-white p-8 shadow-xl shadow-brand/10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-2xl text-brand-strong">
            ✓
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-foreground">
            Payment received
          </h1>
          <p className="mt-2 text-foreground/70">
            LKR {state.booking.amount} paid to {state.booking.providerName}.
          </p>
          <button
            type="button"
            onClick={() => router.push("/bookings/history")}
            className="mt-6 rounded-full bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-strong"
          >
            View my bookings
          </button>
        </div>
      </main>
    );
  }

  return (
    <>
      <Script
        src="https://www.payhere.lk/lib/payhere.js"
        onLoad={() => setScriptReady(true)}
      />
      <main className="mx-auto max-w-xl px-6 py-10">
        <h1 className="text-3xl font-semibold text-foreground">
          Pay {state.booking.providerName}
        </h1>
        <p className="mt-2 text-foreground/70">
          LKR {state.booking.amount} ·{" "}
          {state.booking.category.replace("-", " ")}
        </p>

        <div className="mt-8 space-y-4 rounded-[2rem] border border-border bg-white p-6 shadow-xl shadow-brand/10">
          <div>
            <label
              htmlFor="address"
              className="text-sm font-medium text-foreground"
            >
              Address
            </label>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground"
            />
          </div>
          <div>
            <label
              htmlFor="city"
              className="text-sm font-medium text-foreground"
            >
              City
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-foreground"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="button"
            disabled={!scriptReady || paying}
            onClick={handlePay}
            className="inline-flex h-12 w-full items-center justify-center rounded-full bg-brand px-6 font-semibold text-white shadow-lg shadow-brand/20 disabled:opacity-60"
          >
            {!scriptReady
              ? "Loading payment form..."
              : paying
                ? "Processing..."
                : `Pay LKR ${state.booking.amount}`}
          </button>

          {PAYHERE_SANDBOX && (
            <p className="text-center text-xs text-foreground/40">
              Sandbox mode — no real money will be charged.
            </p>
          )}
        </div>
      </main>
    </>
  );
}

export default function PayHereCheckoutPage() {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <CheckoutContent />
    </ProtectedRoute>
  );
}
