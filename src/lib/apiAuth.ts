import { NextRequest } from "next/server";
import type { DecodedIdToken } from "firebase-admin/auth";
import { adminAuth } from "@/lib/firebaseAdmin";

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
 * in a Next.js API route nothing verifies the caller for you, so every
 * route that needs a signed-in user must call this first.
 */
export async function requireAuth(req: NextRequest): Promise<DecodedIdToken> {
  const authHeader = req.headers.get("authorization") ?? "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) {
    throw new ApiAuthError(401, "Sign in required");
  }
  try {
    return await adminAuth.verifyIdToken(match[1]);
  } catch {
    throw new ApiAuthError(401, "Invalid or expired session");
  }
}

/** Same as requireAuth, but additionally requires the `admin` custom claim. */
export async function requireAdmin(req: NextRequest): Promise<DecodedIdToken> {
  const decoded = await requireAuth(req);
  if (decoded.admin !== true) {
    throw new ApiAuthError(403, "Admin access required");
  }
  return decoded;
}
