# Firebase Setup (Dev + Prod)

This document defines Firebase project setup and environment mapping for BookMe Web.

## 1) Create Firebase Projects

Create two projects in Firebase Console:

- `bookme-dev` (development)
- `bookme-prod` (production)

Optional:

- `bookme-staging` (staging/QA)

For each project, enable:

- Authentication: Email/Password and Phone
- Firestore Database (production mode with rules)
- Storage
- Cloud Functions (Blaze plan required)

## 2) Create Web Apps in Each Project

In each Firebase project:

1. Go to Project settings.
2. Add app -> Web.
3. Register app (e.g., `bookme-web-dev`, `bookme-web-prod`).
4. Copy SDK config values into environment variables.

## 3) Environment Variable Mapping

`web/.env.local` should contain all variables below:

- `NEXT_PUBLIC_APP_ENV` (`dev` or `prod`)
- `NEXT_PUBLIC_FIREBASE_API_KEY_DEV`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_DEV`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID_DEV`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_DEV`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_DEV`
- `NEXT_PUBLIC_FIREBASE_APP_ID_DEV`
- `NEXT_PUBLIC_FIREBASE_API_KEY_PROD`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_PROD`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID_PROD`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_PROD`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_PROD`
- `NEXT_PUBLIC_FIREBASE_APP_ID_PROD`

Optional for payments:

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## 4) Firebase CLI Setup

From repository root:

```bash
npm install -g firebase-tools
firebase login
firebase projects:list
```

Map local aliases:

```bash
firebase use --add
# Alias suggestion:
# dev  -> bookme-dev
# prod -> bookme-prod
```

## 5) Security Baseline (Day 0)

Before real usage, ensure:

- Firestore rules deny unsafe global writes.
- Storage rules restrict writes to authenticated owners.
- Authentication domains include localhost and deployed domain.

## 6) Verification Checklist

- [ ] `bookme-dev` project created
- [ ] `bookme-prod` project created
- [ ] Web app registered in each project
- [ ] Environment values copied into `web/.env.local`
- [ ] Firebase CLI aliases configured (`dev`, `prod`)
