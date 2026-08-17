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
- Pay using cash or digital methods
- Leave a review after service completion

### 2) Service Providers 👨🏻‍🔧

Service providers can:

- Create a professional profile
- Add skills, service areas, experience, and availability
- Set a price range
- Accept or reject bookings
- View earnings
- See customer ratings and feedback

## Development Environment Setup

### Prerequisites

- Node.js 18+ (verify: `node -v`)
- Firebase CLI (install: `npm install -g firebase-tools`)
- Git and GitHub account
- Stripe account (for payments) or PayHere account
- Text editor: VS Code (recommended)

### Local Development Workflow

**1. Clone and Setup:**

```bash
cd c:\Users\WW\Desktop\Documents\Projects\BookMe
git clone <repo-url> # or initialize if starting fresh
cd web
npm install
```

**2. Environment Setup:**

```bash
# Copy example env file
cp .env.example .env.local

# Add your Firebase dev keys to .env.local
# NEXT_PUBLIC_FIREBASE_API_KEY_DEV=...
# etc.
```

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

**5. Deploy:**

```bash
# To staging/dev
vercel --prod=false

# To production
vercel --prod
```

### Seed Dummy Provider Data

To quickly populate the homepage with sample providers:

1. Download a Firebase service account key JSON file and save it as:
   `scripts/serviceAccountKey.json`
2. Run:

```bash
npm run seed:dummy-providers
```

---
