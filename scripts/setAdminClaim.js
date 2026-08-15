/**
 * Run this locally (never deploy it, never expose it as a Cloud Function)
 * to grant the first admin(s) their custom claim. There is no self-service
 * way to become an admin — that's intentional. A callable function that let
 * a signed-in user grant themselves `{ admin: true }` would let anyone
 * become an admin.
 *
 * Setup:
 *   1. Firebase Console → Project settings → Service accounts →
 *      "Generate new private key" → save as serviceAccountKey.json
 *      (in this scripts/ folder — make sure it's gitignored, never commit it)
 *   2. npm install firebase-admin --save-dev   (in project root, or wherever
 *      you run this from)
 *   3. node scripts/setAdminClaim.js someone@example.com
 *
 * The affected user must sign out and back in (or call
 * getIdTokenResult(true) to force a refresh) before the claim takes effect
 * client-side — custom claims only appear in a freshly issued ID token.
 */

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/setAdminClaim.js <email>");
    process.exit(1);
  }

  const user = await admin.auth().getUserByEmail(email);
  await admin.auth().setCustomUserClaims(user.uid, { admin: true });
  console.log(`Granted admin claim to ${email} (uid: ${user.uid})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
