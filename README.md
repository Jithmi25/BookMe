# BookMe 👩🏻‍💻

## Problem Statement 📝

People struggle to find reliable service workers quickly because of:

- No trusted review and rating system
- Poor price transparency
- No clear safety verification
- Limited digital visibility for informal workers

## Vision

Build a simple, trusted, and location-aware platform where:

- Customers can discover, compare, and book service providers
- Service providers can create digital profiles, get bookings, and grow income

## User Types

### 1) Customers 🧔🏻‍♂️

Customers can:

- Sign up / log in
- Search by service category
- View nearby providers
- Compare provider details:
  - Rating
  - Reviews
  - Experience
  - Price range
- Book instantly or schedule for later
- Pay using cash or digital methods (via PayHere)
- Leave a review after service completion

### 2) Service Providers 👨🏻‍🔧

Service providers can:

- Create a professional profile
- Add skills, service areas, experience, and availability
- Set a price range
- Accept or reject bookings
- View earnings
- See customer ratings and feedback

## Tech Stack

- **Framework:** Next.js (App Router)
- **Auth & Database:** Firebase (Authentication + Firestore), client SDK
- **Server-side logic:** Next.js API Routes (`src/app/api/**`) using the
  `firebase-admin` SDK — **not** Firebase Cloud Functions (see
  [Architecture Note](#architecture-note-why-no-cloud-functions) below)
- **Payments:** PayHere
- **Hosting:** Vercel

## Architecture Note: why no Cloud Functions

This project runs on Firebase's free **Spark** plan. Cloud Functions
deployment (both 1st and 2nd gen) requires the **Blaze** (pay-as-you-go)
plan, so no Cloud Functions are deployed here.

Instead:

- Anything a user can safely do to their own data (e.g. completing
  role selection, raising a dispute on their own booking) is a **direct
  Firestore write from the client**, protected by `firestore.rules`.
- Anything that needs real server-side trust — accepting/rejecting/
  completing a booking, admin actions (verify provider, suspend user,
  resolve dispute), and PayHere payment hash generation + webhook
  verification — is handled by **Next.js API Routes** under
  `src/app/api/`, authenticated via a Firebase ID token
  (`Authorization: Bearer <token>`) and verified server-side.

If the project later moves to the Blaze plan, this logic could be
moved back into Cloud Functions, but there's no need to for an MVP.

## Development Environment Setup

### Prerequisites

- Node.js 18+ (verify: `node -v`)
- Git and GitHub account
- A [PayHere](https://www.payhere.lk/) account (sandbox is fine for
  development) — **not Stripe**
- Text editor: VS Code (recommended)

> **Note:** `firebase-tools` (Firebase CLI) is only needed if you want to
> deploy Firestore rules/indexes from the command line or use the local
> emulator. It is **not** needed to deploy Cloud Functions, since none are
> deployed in this project.

### Local Development Workflow

**1. Clone and Setup:**

```bash
cd c:\Users\WW\Desktop\Documents\Projects\BookMe
git clone <repo-url> # or initialize if starting fresh
cd web
npm install
```

**2. Environment Setup:**

Copy `.env.example` to `.env.local` and fill in every value below. All
four groups are required for the full app to work — see the table for
what breaks if a group is missing.

```dotenv
# --- Firebase client config (safe to expose in the browser) ---
# Firebase Console → Project Settings → General → Your apps → SDK setup
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# --- Firebase Admin (server-only — NEVER prefix with NEXT_PUBLIC_) ---
# Firebase Console → Project Settings → Service Accounts →
# Generate new private key
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
# Keep the quotes and \n sequences exactly as they appear in the
# downloaded JSON's "private_key" field.
FIREBASE_ADMIN_PRIVATE_KEY=""

# --- PayHere (server-only) ---
# PayHere Dashboard → Integrations. Sandbox and live mode use
# different credentials.
PAYHERE_MERCHANT_ID=
PAYHERE_MERCHANT_SECRET=
```

| Missing group          | What breaks                                                          |
| ---------------------- | -------------------------------------------------------------------- |
| Firebase client config | Nothing loads at all — sign in, search, everything needs this        |
| Firebase Admin         | Booking accept/reject/complete and all `/admin/*` actions fail (500) |
| PayHere                | Checkout/payment routes return a graceful "not configured" error     |

**3. Run Development Server:**

```bash
npm run dev
# Opens http://localhost:3000
```

**4. Firebase Emulator (optional, for local Firestore testing):**

```bash
firebase emulators:start
# In another terminal, run Next.js with emulator env:
FIREBASE_EMULATOR_HOST=localhost:8080 npm run dev
```

**5. Set up an admin user (one-time, local only):**

Custom claims (used to gate `/admin/*` API routes) aren't set through
the UI. Run this once per admin account:

```bash
npx dotenv -e .env.local -- npx tsx scripts/setAdminClaim.ts <firebase-uid>
```

Find a user's uid in Firebase Console → Authentication → Users, or in
Firestore under `users/{uid}`. After running this, the affected user
must sign out and back in for the new claim to take effect.

**6. Deploy Firestore rules and indexes:**

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

Do this whenever `firestore.rules` or `firestore.indexes.json`
changes. If a feature throws a `failed-precondition: query requires an
index` error at runtime, click the link in the error message to
create it directly in the Firebase Console, or add it to
`firestore.indexes.json` and redeploy.

**7. Deploy the app:**

```bash
# To staging/preview
vercel

# To production
vercel --prod
```

All env vars from step 2 must also be added in **Vercel → Project →
Settings → Environment Variables** (for both Production and Preview)
before deploying — Vercel does not read `.env.local`. Redeploy after
adding or changing any env var.

> **`FIREBASE_ADMIN_PRIVATE_KEY` on Vercel:** paste only the raw key
> content (starting with `-----BEGIN PRIVATE KEY-----`), with **no
> surrounding quotes** — Vercel's env var field doesn't strip quote
> characters the way a local `.env` loader does, and a stray leading
> `"` will break key parsing at runtime.

### Seed Dummy Provider Data

To quickly populate the homepage with sample providers:

1. Download a Firebase service account key JSON file and save it as:
   `scripts/serviceAccountKey.json`
2. Run:

```bash
npm run seed:dummy-providers
```

### Project Structure (high level)

```
src/
  app/
    api/            # Server-side routes (booking actions, admin actions,
                     # PayHere hash + webhook) — see Architecture Note
    admin/           # Admin UI pages
    auth/            # Sign in / sign up / role selection
    bookings/        # Booking UI pages
    contact/         # Contact page
    provider/        # Provider dashboard/bookings/earnings
    providers/       # Provider profile + public listing
    reviews/         # Review creation/listing
    search/          # Provider search
  components/        # Shared UI components (Header, cards, filters, etc.)
  context/           # AuthContext (Firebase auth state + role selection)
  lib/               # firebase.ts (client SDK), firebaseAdmin.ts (server
                     # SDK), apiAuth.ts (token verification), action
                     # helpers (adminActions, bookingActions, payhereActions)
  types/             # Shared TypeScript types
scripts/
  setAdminClaim.ts   # One-off: grant a user the `admin` custom claim
firestore.rules       # Firestore Security Rules
```

---
