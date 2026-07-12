# Book Me Web - 20-Day Implementation Plan (Next.js + Firebase)

**Project:** Book Me - Mobile App → Web Platform  
**Duration:** 20 days  
**Stack:** Next.js 14+ (TypeScript), Tailwind CSS, Firebase (Firestore + Auth + Cloud Functions + Storage)  
**Deployment:** Vercel (Next.js) + Firebase (Functions & Storage)  
**Payment Gateway:** Stripe (recommended) or PayHere

---

## Vision

Build a production-ready web platform that mirrors and extends the mobile app's functionality:

- **Customers:** discover, compare, and book service providers
- **Service Providers:** create profiles, manage bookings, grow income
- **Admins:** verify identities, handle disputes, moderate platform
- **Payments:** support both digital (Stripe) and cash-on-delivery options

**Target MVP Scope:** Full parity with mobile app plus web-specific features (SEO, public listings, admin panel).

---

## Architecture Overview

### Frontend (Next.js)

- **Framework:** Next.js 14 (App Router or Pages Router - your choice)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/UI components
- **State Management:** React Context API + React Hooks (Firebase hooks for real-time data)
- **Authentication:** Firebase Authentication (phone OTP + email)
- **Real-time Data:** Firestore hooks (`useDocument`, `useCollection`)

### Backend (Firebase)

- **Auth:** Firebase Authentication (phone + email)
- **Database:** Firestore (NoSQL)
- **Server Logic:** Cloud Functions (Node.js/TypeScript)
- **Storage:** Firebase Storage (photos, documents)
- **Webhooks:** Cloud Functions HTTP triggers for Stripe webhooks
- **Security:** Firestore Security Rules (role-based access)

### Infrastructure

- **Frontend Hosting:** Vercel (auto-deploy from GitHub)
- **Backend:** Firebase Project (dev + production)
- **CI/CD:** GitHub Actions (optional)
- **Monitoring:** Sentry (error tracking), Firebase Analytics

---

## Firestore Data Model (Final)

```
users/
  {userId}
    role: "customer" | "provider" | "admin"
    name: string
    email: string
    phone: string
    profilePhoto: string (Firebase Storage URL)
    createdAt: timestamp
    updatedAt: timestamp

providers/
  {providerId}
    userId: string (reference to users/{userId})
    skills: string[] (e.g., ["plumbing", "electrical"])
    serviceAreas: string[] (e.g., ["Colombo", "Galle"])
    experienceYears: number
    availability: {
      monday: { start: "09:00", end: "17:00", available: boolean }
      ... (repeats for each day)
    }
    priceMin: number
    priceMax: number
    ratingAvg: number (denormalized for performance)
    ratingCount: number
    nicVerified: boolean
    photoVerified: boolean
    nicDocUrl: string (Firebase Storage URL)
    totalEarnings: number (denormalized summary)
    createdAt: timestamp

bookings/
  {bookingId}
    customerId: string (reference to users/{userId})
    providerId: string (reference to providers/{providerId})
    category: string (e.g., "plumbing")
    date: string (YYYY-MM-DD)
    time: string (HH:MM)
    note: string (problem description)
    status: "pending" | "accepted" | "rejected" | "completed" | "cancelled"
    paymentMethod: "cash" | "digital"
    amount: number
    commissionAmount: number (5-15% calculated by Cloud Function)
    providerEarning: number (amount - commissionAmount)
    paymentId: string (Stripe payment ID, if digital)
    paymentStatus: "pending" | "completed" | "failed"
    createdAt: timestamp
    acceptedAt: timestamp (when provider accepts)
    completedAt: timestamp (when marked complete)

reviews/
  {reviewId}
    bookingId: string (reference to bookings/{bookingId})
    customerId: string
    providerId: string
    stars: number (1-5)
    comment: string
    createdAt: timestamp

payments/
  {paymentId}
    bookingId: string
    customerId: string
    providerId: string
    amount: number
    stripePaymentId: string
    status: "pending" | "completed" | "failed"
    createdAt: timestamp
```

---

## 20-Day Breakdown

### **Phase 1: Foundation (Days 0-3)**

#### Day 0: Prep & Kickoff

**Goal:** Set up repositories, environment, and Firebase projects.

**Tasks:**

1. Create `web/` folder in BookMe repo for Next.js app
2. Set up GitHub Actions (optional) or manual deployment flow
3. Create Firebase project in Firebase Console (dev + prod)
4. Document Firebase configuration and environment variables
5. Create `.env.example` and `.env.local` templates

**Deliverable:**

- Repo structure ready
- Firebase projects created (dev + staging + prod)
- Environment setup documented

**No coding required yet.**

---

#### Days 1-3: Project Foundation

**Goal:** Scaffold Next.js app, set up routing, styling, and Firebase initialization.

**Tasks:**

**Day 1: Next.js Scaffold**

```bash
cd c:\Users\WW\Desktop\Documents\Projects\BookMe
npx create-next-app@latest web --typescript --tailwind --eslint
cd web
npm install firebase react-firebase-hooks
```

**Configure environment variables** (`web/.env.local`):

```env
# Firebase (Dev)
NEXT_PUBLIC_FIREBASE_API_KEY_DEV=your_dev_api_key
NEXT_PUBLIC_FIREBASE_PROJECT_ID_DEV=your_dev_project_id
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_DEV=your_dev_sender_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_DEV=your_dev_storage_bucket
NEXT_PUBLIC_FIREBASE_APP_ID_DEV=your_dev_app_id

# Firebase (Prod) - for future
NEXT_PUBLIC_FIREBASE_API_KEY_PROD=your_prod_api_key
# ... (add other prod variables as needed)

# App config
NEXT_PUBLIC_APP_ENV=dev
NEXT_PUBLIC_APP_NAME=BookMe
```

**Create Firebase initialization** (`web/src/lib/firebase.ts`):

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_DEV,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_DEV,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_DEV,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_DEV,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_DEV,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

**Set up routing** (`web/src/app/_app.tsx`):

- Global layout with header, footer, sidebar
- Theme provider (Tailwind)
- Firebase provider context

**Day 2: Layout & Global Styles**

- Create base layout with navigation
- Set up Tailwind configuration (`tailwind.config.ts`)
- Create reusable UI components folder (`web/src/components/common/`)
- Create page structure (`web/src/app/` or `web/pages/`)

**Day 3: Localization & Theme**

- Set up i18n (next-i18next or simple translations JSON)
- Create theme constants (colors, spacing, typography)
- Build basic pages: Home, SignIn, SignUp, NotFound

**Deliverable:**

- Next.js app running locally (`npm run dev`)
- Firebase initialized and connected
- Basic routing and layout in place
- Global Tailwind styling working

---

### **Phase 2: Authentication & Roles (Days 4-6)**

**Goal:** Implement Firebase Auth with phone OTP, email fallback, and role-based routing.

#### Day 4: Firebase Auth Setup

**Tasks:**

1. Enable Firebase Authentication methods:
   - Phone number (reCAPTCHA required)
   - Email/Password
   - Google Sign-In (optional)

2. Create authentication hook (`web/src/hooks/useAuth.ts`):

```typescript
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export function useAuth() {
  const [user, loading, error] = useAuthState(auth);
  return { user, loading, error };
}
```

3. Create custom auth context for role management (`web/src/context/AuthContext.tsx`)

**Day 5: Auth Flows (SignUp, SignIn, Role Selection)**
**Pages to create:**

- `/auth/signin` — Phone OTP or email signin
- `/auth/signup` — Phone/email signup with OTP verification
- `/auth/role-selection` — Select customer or provider role
- `/onboarding/provider-profile` — Provider onboarding (first-time setup)
- `/onboarding/customer-profile` — Customer onboarding

**Authentication flow:**

1. User enters phone → Firebase sends OTP
2. User enters OTP → Firebase verifies & creates user
3. User selects role (customer/provider)
4. For providers: complete profile setup (skills, areas, price)
5. Redirect to role-appropriate home page

**Day 6: Protected Routes & Firestore Security Rules**
**Tasks:**

1. Create route protection wrapper:

```typescript
// web/src/components/ProtectedRoute.tsx
'use client';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <>{children}</>;
}
```

2. Set up Firestore Security Rules:

```firestore
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read their own document and all public provider profiles
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow create: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
    }

    // Providers collection (public read, owner write)
    match /providers/{providerId} {
      allow read: if true; // Public discovery
      allow create: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'provider';
      allow update: if request.auth.uid == resource.data.userId;
    }

    // Bookings (role-based access)
    match /bookings/{bookingId} {
      allow read: if request.auth.uid in resource.data.customerId || request.auth.uid in resource.data.providerId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.customerId;
      allow update: if request.auth.uid in [resource.data.customerId, resource.data.providerId];
    }

    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if request.auth.uid == request.resource.data.customerId;
    }
  }
}
```

**Deliverable:**

- Phone OTP signup/signin working
- Role selection flow
- Protected routes redirecting unauthenticated users
- Firestore rules blocking unauthorized writes

---

### **Phase 3: Provider Profiles (Days 7-9)**

**Goal:** Implement provider profile creation, editing, and photo uploads.

#### Day 7: Provider Profile Creation UI

**Pages:**

- `/providers/profile/edit` — Provider profile form
- `/providers/profile/view` — View own profile

**Form fields:**

- Skills (multi-select: plumbing, electrical, carpentry, cleaning, etc.)
- Service areas (multi-select: cities/regions)
- Experience (years: 1, 2, 3, 5+)
- Availability (weekly schedule)
- Price range (min/max)
- Bio/description (optional)
- Profile photo upload
- NIC document upload (for verification)

**Tasks:**

1. Create Firestore schema for providers collection
2. Build form UI component with Shadcn/UI
3. Implement image upload to Firebase Storage

#### Day 8: Photo & Document Upload

**Tasks:**

1. Set up Firebase Storage with proper permissions
2. Create upload handler with progress tracking
3. Create image preview component
4. Implement NIC document upload (PDF/JPG)

**Cloud Storage Rules:**

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /profile-photos/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid == userId && request.resource.size < 5 * 1024 * 1024;
    }

    match /nic-documents/{userId}/{allPaths=**} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId && request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

#### Day 9: View & Edit Profile

**Tasks:**

1. Implement profile view page (public)
2. Implement profile edit page (owner only)
3. Add edit/save functionality with Firestore updates

**Deliverable:**

- Provider can create profile with all fields
- Photos/documents upload to Firebase Storage
- Profile visible to customers
- Edit functionality working

---

### **Phase 4: Discovery & Search (Days 7-9, parallel)**

**Goal:** Implement provider discovery with filtering and geo-proximity.

#### Day 7-8: Discovery Page & Basic Filtering

**Pages:**

- `/` (Home/Discovery) — Main marketplace listing
- `/search` — Advanced search results

**Features:**

1. Display list of providers with:
   - Name, photo, rating, price range
   - Verification badges (NIC, photo verified)
   - Distance (if using geo)
2. Filters:
   - Category (service type)
   - Price range slider
   - Rating minimum
   - Availability

**Implementation:**

```typescript
// web/src/hooks/useProviders.ts
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function useProviders(filters?: {
  category?: string;
  priceMin?: number;
  priceMax?: number;
  ratingMin?: number;
}) {
  const q = query(
    collection(db, "providers"),
    where("skills", "array-contains", filters?.category || null),
    orderBy("ratingAvg", "desc"),
  );

  const [providers, loading, error] = useCollection(q);
  return { providers, loading, error };
}
```

#### Day 9: Geo-Proximity Search (Optional MVP)

**Tasks:**

1. Use browser geolocation API to get user's coordinates
2. Implement Firestore geo-query (using geohash or GeoFirestore library)
3. Sort providers by distance

**Library recommendation:** Use `geofire-common` or implement simple distance calculation:

```typescript
// web/src/lib/geo.ts
export function distanceBetweenCoordinates(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}
```

**Deliverable:**

- Provider list displays all providers with ratings and photos
- Filtering by category, price, rating working
- Geo-proximity (optional) showing distance to providers
- Search results paginated

---

### **Phase 5: Provider Detail & Booking (Days 10-11)**

**Goal:** Implement provider profile detail page and booking flow.

#### Day 10: Provider Detail Page

**Page:** `/providers/[id]` (dynamic route)

**Features:**

1. Provider info:
   - Full profile (skills, experience, price range)
   - Ratings and review summary
   - Availability calendar (UI only, non-interactive)
   - Verification badges
   - Photo gallery

2. Reviews section:
   - List recent reviews (max 5-10)
   - Show average rating breakdown (1⭐, 2⭐, etc.)

**Implementation:**

```typescript
// app/providers/[id]/page.tsx
import { ProviderDetail } from '@/components/providers/ProviderDetail';

export default function ProviderPage({ params }: { params: { id: string } }) {
  return <ProviderDetail providerId={params.id} />;
}
```

#### Day 11: Booking Flow

**Pages:**

- `/bookings/create/[providerId]` — Booking form
- `/bookings/confirmation` — Confirmation after creation
- `/bookings/history` — Customer's booking history

**Booking form fields:**

1. Select date (datepicker)
2. Select time (time input or predefined slots)
3. Add note/description
4. Select payment method (cash/digital)
5. Confirm button

**Tasks:**

1. Create booking form component
2. Write booking creation function (writes to `bookings` collection)
3. Show booking confirmation page
4. Link confirmation to provider dashboard notification

**Deliverable:**

- Customer can view provider detail
- Customer can create a booking
- Booking stored in Firestore
- Confirmation page shows booking ID and details

---

### **Phase 6: Cloud Functions (Day 12)**

**Goal:** Implement server-side booking logic and commission calculation.

#### Day 12: Cloud Functions Setup

**Setup:**

```bash
cd c:\Users\WW\Desktop\Documents\Projects\BookMe
firebase init functions
cd functions
npm install firebase-functions firebase-admin express cors
```

**Key Cloud Functions:**

1. **Accept/Reject Booking Function** (`functions/src/booking.ts`):

```typescript
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

const db = admin.firestore();

export const acceptBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new Error("Unauthorized");

  const { bookingId, providerId } = data;

  // Security: verify provider owns this booking
  const bookingRef = db.collection("bookings").doc(bookingId);
  const booking = await bookingRef.get();

  if (booking.data()?.providerId !== providerId) {
    throw new Error("Unauthorized");
  }

  // Transition booking state
  await bookingRef.update({
    status: "accepted",
    acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});

export const completeBooking = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new Error("Unauthorized");

  const { bookingId } = data;
  const bookingRef = db.collection("bookings").doc(bookingId);
  const booking = await bookingRef.get();

  await bookingRef.update({
    status: "completed",
    completedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});
```

2. **Commission Calculation Trigger** (Firestore trigger on booking creation):

```typescript
export const calculateCommission = functions.firestore
  .document("bookings/{bookingId}")
  .onCreate(async (snap, context) => {
    const booking = snap.data();
    const commissionRate = 0.1; // 10%
    const commission = booking.amount * commissionRate;

    await snap.ref.update({
      commissionAmount: commission,
      providerEarning: booking.amount - commission,
    });
  });
```

3. **Payment Webhook Handler** (for Stripe):

```typescript
export const handleStripeWebhook = functions.https.onRequest(
  async (req, res) => {
    const sig = req.headers["stripe-signature"] as string;
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret!);
    } catch (err) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as any;
      const bookingId = paymentIntent.metadata.bookingId;

      await db.collection("bookings").doc(bookingId).update({
        paymentStatus: "completed",
      });

      await db.collection("payments").add({
        bookingId,
        stripePaymentId: paymentIntent.id,
        amount: paymentIntent.amount / 100,
        status: "completed",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    res.json({ received: true });
  },
);
```

**Deploy:**

```bash
firebase deploy --only functions
```

**Deliverable:**

- Cloud Functions deployed
- Booking acceptance/rejection working
- Commission calculated on booking creation
- (Stripe integration pending Day 16)

---

### **Phase 7: Provider Dashboard (Day 13)**

**Goal:** Implement provider booking management interface.

**Pages:**

- `/provider/dashboard` — Main dashboard with stats
- `/provider/bookings` — Booking inbox (pending, accepted, completed)
- `/provider/earnings` — Earnings summary and history

#### Tasks:

1. **Dashboard Overview:**
   - Total bookings this month
   - Total earnings this month
   - Pending bookings count
   - Average rating

2. **Booking Inbox:**
   - List pending bookings (sortable by date)
   - Accept/Reject buttons (calls Cloud Function)
   - Mark as completed button
   - Link to customer details

3. **Earnings Page:**
   - Total earnings (cumulative)
   - Monthly breakdown (chart or table)
   - Commission deductions shown
   - Payout info (coming in Phase 2)

**Implementation:**

```typescript
// hooks/useProviderBookings.ts
export function useProviderBookings(providerId: string) {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "bookings"),
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBookings(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, [providerId]);

  return bookings;
}
```

**Deliverable:**

- Provider can view pending bookings
- Provider can accept/reject bookings (triggers Cloud Function)
- Provider can mark bookings complete
- Earnings dashboard shows commission breakdown

---

### **Phase 8: Reviews & Ratings (Day 14)**

**Goal:** Implement post-booking review flow and ratings aggregation.

**Pages:**

- `/reviews/create/[bookingId]` — Review creation form (appears after booking completion)
- `/reviews/list/[providerId]` — View all provider reviews

#### Tasks:

1. **Review Form:**
   - Star rating (1-5)
   - Text comment (optional)
   - Submit button

2. **Security (Firestore Rules):**
   - Review can only be created by booking's customer
   - Review can only be created if booking status is "completed"
   - One review per booking (prevent duplicates)

3. **Rating Aggregation:**
   - On review creation, trigger Cloud Function to:
     - Calculate `ratingAvg` (average of all reviews)
     - Update `ratingCount` (total reviews)
   - Denormalize these fields in provider document for fast queries

**Firestore Rule for Reviews:**

```firestore
match /reviews/{reviewId} {
  allow read: if true;
  allow create: if
    request.auth.uid == request.resource.data.customerId &&
    get(/databases/$(database)/documents/bookings/$(request.resource.data.bookingId)).data.status == 'completed';
}
```

**Cloud Function (Rating Aggregation):**

```typescript
export const aggregateRatings = functions.firestore
  .document("reviews/{reviewId}")
  .onCreate(async (snap, context) => {
    const review = snap.data();
    const { providerId } = review;

    // Get all reviews for this provider
    const reviewsSnapshot = await db
      .collection("reviews")
      .where("providerId", "==", providerId)
      .get();

    const ratings = reviewsSnapshot.docs.map((doc) => doc.data().stars);
    const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;

    // Update provider document
    await db.collection("providers").doc(providerId).update({
      ratingAvg: avgRating,
      ratingCount: ratings.length,
    });
  });
```

**Deliverable:**

- Customer can leave review after booking completion
- Ratings are aggregated and denormalized
- Provider profile shows average rating and count
- Reviews visible on provider detail page

---

### **Phase 9: Admin Panel (Day 15)**

**Goal:** Implement lightweight admin interface for verification and moderation.

**Pages:**

- `/admin/dashboard` — Admin stats overview
- `/admin/verifications` — NIC and photo verification queue
- `/admin/disputes` — Handle booking disputes
- `/admin/users` — User management (suspend/ban)

#### Tasks:

1. **Admin Role Setup:**
   - Set custom claims in Firebase for admins: `{ admin: true }`
   - Restrict access to `/admin/*` pages to users with admin claim

2. **Verification Queue:**
   - List providers pending NIC/photo verification
   - Admin can view uploaded documents
   - Approve/Reject with modal dialog
   - Cloud Function to set `nicVerified: true` / `photoVerified: true`

3. **Disputes:**
   - List flagged bookings or dispute tickets
   - Admin can view booking details and chat
   - Admin can refund payments via Cloud Function

**Cloud Function (Set Verification):**

```typescript
export const verifyProvider = functions.https.onCall(async (data, context) => {
  // Verify caller is admin
  const claims = await admin.auth().getIdTokenResult(context.auth!.uid);
  if (!claims.admin) throw new Error("Unauthorized");

  const { providerId, verificationType, approved } = data;

  if (verificationType === "nic") {
    await db.collection("providers").doc(providerId).update({
      nicVerified: approved,
    });
  } else if (verificationType === "photo") {
    await db.collection("providers").doc(providerId).update({
      photoVerified: approved,
    });
  }

  return { success: true };
});
```

**Deliverable:**

- Admin dashboard displays stats
- Verification queue shows pending providers
- Admin can approve/reject with updates to Firestore
- Basic dispute interface

---

### **Phase 10: Payments Integration (Day 16)**

**Goal:** Integrate Stripe (or PayHere) for digital payments.

#### Tasks:

1. **Stripe Setup:**
   - Create Stripe account
   - Add Stripe keys to Firebase environment variables
   - Install Stripe libraries: `npm install @stripe/react-stripe-js stripe`

2. **Payment Flow:**
   - On booking creation, if payment method is "digital":
     - Show Stripe payment form
     - Process payment via Stripe Payment Intent
     - On success: update booking `paymentStatus: "completed"`
     - On failure: show error and keep booking as draft

3. **Checkout Page** (`/payments/checkout/[bookingId]`):

```typescript
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';

export function CheckoutPage({ bookingId }: { bookingId: string }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm bookingId={bookingId} />
    </Elements>
  );
}

function CheckoutForm({ bookingId }: { bookingId: string }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cardElement = elements?.getElement(CardElement);

    // Create payment intent (via Cloud Function or backend)
    const { clientSecret } = await fetch('/api/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify({ bookingId }),
    }).then(res => res.json());

    // Confirm payment
    const result = await stripe?.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement! },
    });

    if (result?.paymentIntent?.status === 'succeeded') {
      // Update Firestore (handled by webhook)
      router.push(`/bookings/${bookingId}/confirmation`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit">Pay</button>
    </form>
  );
}
```

4. **Webhook Handler** (in Cloud Functions):
   - Already implemented in Phase 6
   - Stripe calls `/functions/handleStripeWebhook` on payment success
   - Function updates `bookings/{bookingId}` with payment status

**Deliverable:**

- Stripe integration working
- Customers can pay via card
- Payment webhooks updating Firestore
- Cash-on-delivery option still available

---

### **Phase 11: Notifications & Messaging (Day 17)**

**Goal:** Implement in-app notifications and prepare for future chat.

#### Tasks:

1. **In-App Notifications** (Firestore-based):
   - Create `notifications/` collection
   - Trigger notifications on key events:
     - Booking created → provider receives notification
     - Booking accepted → customer receives notification
     - Review posted → provider receives notification

2. **Notification Bell UI:**
   - Add notification bell icon in header
   - Show notification count
   - Dropdown list of recent notifications
   - Mark as read functionality

**Notification Schema:**

```
notifications/
  {notificationId}
    userId: string
    type: "booking_request" | "booking_accepted" | "review_posted" | "payment_received"
    title: string
    message: string
    relatedDocId: string (e.g., bookingId)
    relatedDocType: string (e.g., "booking")
    read: boolean
    createdAt: timestamp
```

**Cloud Function (Create Notification):**

```typescript
export const onBookingCreated = functions.firestore
  .document("bookings/{bookingId}")
  .onCreate(async (snap) => {
    const booking = snap.data();

    await admin.firestore().collection("notifications").add({
      userId: booking.providerId,
      type: "booking_request",
      title: "New Booking Request",
      message: `Customer has requested a booking`,
      relatedDocId: booking.id,
      relatedDocType: "booking",
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
```

3. **Optional: Firebase Cloud Messaging (FCM)**
   - Set up FCM for push notifications (optional for MVP)
   - Test on mobile browsers

**Deliverable:**

- Notifications appear when booking events occur
- Notification bell shows count
- Notifications dropdown functional
- (Full in-app chat deferred to Phase 2)

---

### **Phase 12: QA & Testing (Day 18)**

**Goal:** Comprehensive testing before release.

#### Tasks:

1. **Unit Tests:**
   - Test helper functions (geo calculation, commission logic)
   - Test Firebase hooks

2. **Integration Tests:**
   - Test auth flow end-to-end (signup → role selection → onboarding)
   - Test booking flow (search → select → create → confirm)
   - Test provider acceptance/rejection
   - Test review creation and rating aggregation

3. **Manual E2E Testing Checklist:**
   - [ ] Customer signup with phone OTP
   - [ ] Customer can search and filter providers
   - [ ] Customer can create booking and pay with Stripe
   - [ ] Provider receives notification and can accept
   - [ ] Customer receives notification on acceptance
   - [ ] Provider can complete booking
   - [ ] Customer can leave review
   - [ ] Admin can verify provider NIC
   - [ ] Cash-on-delivery option available
   - [ ] Mobile responsiveness (Tailwind breakpoints)

4. **Security Testing:**
   - Run Firebase Emulator Suite
   - Verify Firestore rules block unauthorized reads/writes
   - Test role-based access (customer can't access provider routes, etc.)

5. **Performance:**
   - Run Lighthouse audit (target: 80+ Perf score)
   - Check bundle size (`npm run build && npm run analyze`)
   - Test with slow network (Chrome DevTools throttling)

6. **Accessibility:**
   - Check color contrast
   - Test keyboard navigation
   - Verify form labels and ARIA attributes

**Deliverable:**

- Unit tests passing
- E2E checklist completed and signed off
- Lighthouse score 80+
- No critical Firestore rule violations

---

### **Phase 13: Performance, SEO & Deployment (Day 19)**

**Goal:** Optimize for search engines, performance, and prepare for production.

#### Tasks:

1. **Server-Side Rendering (SSR) / Static Generation (SSG):**
   - Use `getStaticProps` or `getServerSideProps` for provider pages
   - Pre-render popular provider profiles at build time
   - Ensure provider detail page is SEO-friendly (dynamic meta tags)

2. **SEO Optimization:**
   - Add metadata to all pages (title, description, keywords)
   - Create XML sitemap (`public/sitemap.xml`)
   - Add Open Graph tags for social sharing
   - Implement `next/head` for dynamic titles

**Example (Provider detail page):**

```typescript
import Head from 'next/head';

export default function ProviderPage({ provider }) {
  return (
    <>
      <Head>
        <title>{provider.name} - BookMe</title>
        <meta name="description" content={`${provider.name} - ${provider.skills.join(', ')}`} />
        <meta property="og:title" content={provider.name} />
        <meta property="og:image" content={provider.profilePhoto} />
      </Head>
      {/* Page content */}
    </>
  );
}
```

3. **Performance Optimization:**
   - Lazy load images with `next/image`
   - Code splitting and dynamic imports
   - Optimize CSS (Tailwind purging)
   - Compress assets

4. **Deployment Preparation:**

**Deploy to Vercel:**

```bash
# Connect GitHub repo to Vercel
# Set environment variables in Vercel dashboard
# Deploy automatically on push to main branch
```

**Vercel Environment Variables:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY_DEV=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID_DEV=...
# (add all Firebase keys for dev)
```

5. **Deploy Cloud Functions:**

```bash
firebase deploy --only functions
```

6. **Firebase Hosting (optional, for fallback):**

```bash
npm run build
firebase deploy --only hosting
```

**Deliverable:**

- App deployed to Vercel
- Cloud Functions deployed
- SEO metadata in place
- Lighthouse score 85+

---

### **Phase 14: Release & Post-Launch (Day 20)**

**Goal:** Final verification, go-live, and prepare support.

#### Tasks:

1. **Final Checks:**
   - [ ] All features from 20-day plan implemented
   - [ ] E2E tests passing
   - [ ] No critical bugs in QA
   - [ ] Staging environment mirrors production
   - [ ] Backups configured (Firebase automatic backups)

2. **Go-Live:**
   - [ ] Deploy to production Vercel project
   - [ ] Switch production Firebase credentials in environment
   - [ ] Verify all links point to production
   - [ ] Test signup flow with real Firebase project

3. **Post-Launch Monitoring:**
   - Set up Sentry for error tracking
   - Enable Google Analytics
   - Create support email (support@bookme.com or similar)
   - Document known limitations / future work

4. **Handoff Documentation:**
   - Create `/docs/DEPLOYMENT.md` with deployment steps
   - Create `/docs/ARCHITECTURE.md` with system overview
   - Create `/docs/TROUBLESHOOTING.md` with common issues
   - Create `/docs/FIREBASE_SETUP.md` with Firebase project setup

5. **Bug-Fix Window (Days 21-22, optional buffer):**
   - Monitor error logs
   - Address critical issues found in production
   - Small feature tweaks if needed

**Deliverable:**

- Website live at bookme.web domain
- Monitoring in place (Sentry + Analytics)
- Documentation complete
- Support process defined
- Ready for customer onboarding

---

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

---

## Key Decisions & Rationale

| Decision                                | Rationale                                                                            |
| --------------------------------------- | ------------------------------------------------------------------------------------ |
| **Next.js (not plain React)**           | SSR/SSG for SEO, built-in API routes, file-based routing, Vercel deployment          |
| **Firebase (not custom backend)**       | Faster iteration, built-in auth, real-time Firestore, pay-as-you-go pricing          |
| **Cloud Functions**                     | Server-side logic for secure booking transitions, commission logic, Stripe webhooks  |
| **Firestore (not Supabase/PostgreSQL)** | Simplicity, real-time subscriptions, scales with zero ops, geographic queries easier |
| **Tailwind CSS (not Material-UI)**      | Faster custom styling, smaller bundle, better dark mode support                      |
| **Phone OTP (not email-only)**          | Matches mobile app, common in emerging markets (Sri Lanka)                           |
| **Commission on booking creation**      | Transparent pricing, triggers Cloud Function for automatic calculation               |
| **Denormalized ratings**                | Fast queries for provider discovery without expensive aggregations                   |
| **Stripe (not PayHere first)**          | Global payment standard, better webhook security, easier testing                     |

---

## Risk Mitigations

| Risk                         | Mitigation                                                                        |
| ---------------------------- | --------------------------------------------------------------------------------- |
| **Firestore cost explosion** | Implement read/write limits, use batch operations, denormalize data strategically |
| **Geo-query performance**    | Use geohash denormalization or GeoFirestore library for radius queries            |
| **Phone OTP blockers**       | Provide email fallback, configure reCAPTCHA properly for web                      |
| **Marketplace cold-start**   | Plan initial provider onboarding incentives in parallel                           |
| **Payment failures**         | Implement robust error handling, retry logic, clear user messaging                |
| **Security rule mistakes**   | Test all rules in emulator before production, use least-privilege principle       |

---

## Future Enhancements (Post-MVP)

- [ ] In-app messaging (full chat, not just notifications)
- [ ] Live booking tracking with maps
- [ ] Advanced analytics and reporting
- [ ] Provider subscription plans
- [ ] Emergency booking (30-min response time)
- [ ] AI-based price estimation
- [ ] Referral program
- [ ] Service bundles/packages
- [ ] Skill certification badges
- [ ] Background checks for providers
- [ ] Mobile app parity (React Native or Flutter web)
- [ ] Multi-language support (Sinhala, Tamil)

---

## File Structure (Final)

```
BookMe/
├── web/                          # Next.js app
│   ├── public/                   # Static files
│   ├── src/
│   │   ├── app/                  # Next.js 14 App Router pages
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Home
│   │   │   ├── auth/
│   │   │   │   ├── signin/
│   │   │   │   ├── signup/
│   │   │   │   └── role-selection/
│   │   │   ├── providers/
│   │   │   │   ├── [id]/
│   │   │   │   └── profile/
│   │   │   ├── bookings/
│   │   │   ├── admin/
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── common/           # Shared UI components
│   │   │   ├── providers/
│   │   │   ├── bookings/
│   │   │   └── admin/
│   │   ├── hooks/                # Custom hooks (useAuth, useProviders, etc.)
│   │   ├── lib/
│   │   │   ├── firebase.ts       # Firebase initialization
│   │   │   ├── stripe.ts         # Stripe client
│   │   │   └── geo.ts            # Geo helpers
│   │   ├── context/              # React context
│   │   └── types/                # TypeScript types
│   ├── .env.example
│   ├── .env.local (gitignored)
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
├── functions/                    # Cloud Functions
│   ├── src/
│   │   ├── index.ts              # Main functions export
│   │   ├── booking.ts            # Booking functions
│   │   ├── payments.ts           # Stripe webhook
│   │   ├── notifications.ts      # Notification triggers
│   │   └── admin.ts              # Admin functions
│   ├── .env (gitignored)
│   └── package.json
├── docs/
│   ├── IMPLEMENTATION_PLAN_WEB.md (this file)
│   ├── DEPLOYMENT.md
│   ├── ARCHITECTURE.md
│   ├── FIREBASE_SETUP.md
│   └── TROUBLESHOOTING.md
├── README.md                     # Original mobile app brief
└── .gitignore                    # Include .env, node_modules, etc.
```

---

## References & Resources

- **Next.js Docs:** https://nextjs.org/docs
- **Firebase Docs:** https://firebase.google.com/docs
- **Tailwind CSS:** https://tailwindcss.com
- **Stripe Docs:** https://stripe.com/docs/web
- **Firestore Security Rules:** https://firebase.google.com/docs/rules
- **Cloud Functions:** https://firebase.google.com/docs/functions
- **Vercel Deployment:** https://vercel.com/docs

---

## Tracking Progress

Use the following checklist to track daily progress:

- [ ] Day 0: Firebase projects created
- [ ] Day 1-3: Next.js scaffold complete, Firebase initialized, basic pages ready
- [ ] Day 4-6: Phone OTP auth working, role selection, protected routes
- [ ] Day 7-9: Provider profiles complete, discovery page with filters, geo-proximity optional
- [ ] Day 10-11: Provider detail page, booking form, history
- [ ] Day 12: Cloud Functions deployed (booking state machine, commission logic)
- [ ] Day 13: Provider dashboard functional
- [ ] Day 14: Reviews and ratings aggregation working
- [ ] Day 15: Admin panel basic functionality
- [ ] Day 16: Stripe payments integrated
- [ ] Day 17: Notifications implemented
- [ ] Day 18: QA checklist passed
- [ ] Day 19: Deployed to Vercel, SEO optimized
- [ ] Day 20: Live and monitoring

---

**Version:** 1.0  
**Created:** 2024  
**Last Updated:** 2024  
**Owner:** BookMe Dev Team
