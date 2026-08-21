/**
 * One-off script to grant yourself the `admin` custom claim, replacing
 * whatever previously set it (likely a Cloud Function or manual console
 * action). The Admin SDK works fine outside Cloud Functions — this is a
 * plain Node script, not deployed anywhere, so it doesn't need Blaze.
 *
 * Usage:
 *   npx tsx scripts/setAdminClaim.ts <uid>
 *
 * Requires the same FIREBASE_ADMIN_* env vars as lib/firebaseAdmin.ts —
 * run with `dotenv -e .env.local -- npx tsx scripts/setAdminClaim.ts <uid>`
 * or export them in your shell first.
 */
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

const uid = process.argv[2];
if (!uid) {
  console.error("Usage: npx tsx scripts/setAdminClaim.ts <uid>");
  process.exit(1);
}

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL!;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(
  /\\n/g,
  "\n",
);

const app = initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

getAuth(app)
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Set admin claim for uid: ${uid}`);
    console.log(
      "The user must sign out and back in (or call getIdToken(true)) to pick it up.",
    );
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to set admin claim:", err);
    process.exit(1);
  });
