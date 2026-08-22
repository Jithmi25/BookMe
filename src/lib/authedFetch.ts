import { auth } from "@/lib/firebase";

export const runtime = "nodejs";

/**
 * POSTs JSON to one of our /api/* route handlers with the current user's
 * Firebase ID token attached, mirroring what httpsCallable used to do
 * automatically. Throws with the server's error message on failure.
 */
export async function authedFetch<T = { success: true }>(
  path: string,
  body: unknown,
): Promise<T> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Sign in required");
  }
  const token = await user.getIdToken();

  const res = await fetch(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}
