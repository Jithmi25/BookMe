// Server-only. Never import this from a "use client" file — it holds a
// service account credential and must never end up in the browser bundle.
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin credentials. Set FIREBASE_ADMIN_PROJECT_ID, " +
        "FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY.",
    );
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

const adminApp = getAdminApp();
export const adminDb = getFirestore(adminApp);
// Note: firebase-admin/auth is intentionally NOT used here — token
// verification is done manually in lib/apiAuth.ts via `jose`, to avoid a
// Turbopack/Vercel bundling issue with firebase-admin/auth's dependency
// chain (jwks-rsa -> jose ESM require() failure). Firestore is unaffected.
