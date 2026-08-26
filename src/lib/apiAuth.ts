import { NextRequest } from "next/server";
import { jwtVerify, createRemoteJWKSet } from "jose";

const PROJECT_ID = process.env.FIREBASE_ADMIN_PROJECT_ID!;
function getProjectId(): string {
  return (
    process.env.FIREBASE_ADMIN_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.FIREBASE_PROJECT_ID ||
    process.env.GCP_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    "bookme-dev-cfc43"
  );
}

// Google's public keys for verifying Firebase ID tokens (RS256-signed JWTs).
// This replaces firebase-admin/auth's verifyIdToken() specifically to avoid
// a Turbopack bundling issue: firebase-admin/auth pulls in jwks-rsa, which
// requires the ESM-only `jose` package via require(), which Turbopack can't
// resolve on Vercel ("ERR_REQUIRE_ESM"). Importing `jose` directly here
// sidesteps that broken chain entirely — same verification, no bundler
// conflict. Firestore access (adminDb in firebaseAdmin.ts) is unaffected
// and still uses firebase-admin normally.
const JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/[email protected]",
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

export interface VerifiedUser {
  uid: string;
  admin?: boolean;
  [key: string]: unknown;
}

export class ApiAuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Verifies the Firebase ID token sent as `Authorization: Bearer <token>`.
 * This is the replacement for Cloud Functions' automatic `request.auth` —
 * nothing verifies the caller for you in a Next.js API route, so every
 * route that needs a signed-in user must call this first.
 */
export async function requireAuth(req: NextRequest): Promise<VerifiedUser> {
  const authHeader = req.headers.get("authorization") ?? "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    throw new ApiAuthError(401, "Sign in required");
  }

  const projectId = getProjectId();

  try {
    const { payload } = await jwtVerify(match[1], JWKS, {
      issuer: `https://securetoken.google.com/${PROJECT_ID}`,
      audience: PROJECT_ID,
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
    });

    if (!payload.sub) {
      throw new Error("Token missing subject claim");
    }

    return { uid: payload.sub, ...payload } as VerifiedUser;
  } catch {
  } catch (err) {
    console.error("requireAuth token verification error:", err);
    throw new ApiAuthError(401, "Invalid or expired session");
  }
}

/** Same as requireAuth, but additionally requires the `admin` custom claim. */
export async function requireAdmin(req: NextRequest): Promise<VerifiedUser> {
  const decoded = await requireAuth(req);
  if (decoded.admin !== true) {
    throw new ApiAuthError(403, "Admin access required");
  }
  return decoded;
}
