import { useEffect, useState } from "react";
import { useAuthContext } from "@/context/AuthContext";

/**
 * Checks the `admin` custom claim on the caller's ID token. Deliberately
 * does NOT check appUser.role — the Firestore users/{uid}.role field is
 * client-writable (any signed-in user could in principle set their own
 * role to "admin" via a direct Firestore write), so it must never be
 * trusted for authorization. Custom claims can only be set server-side
 * (via scripts/setAdminClaim.js or the setUserSuspended-style Cloud
 * Functions), which is what makes them safe to gate access on.
 */
export function useIsAdmin() {
  const { firebaseUser } = useAuthContext();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseUser) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }
    firebaseUser
      .getIdTokenResult()
      .then((result) => {
        setIsAdmin(result.claims.admin === true);
        setLoading(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setLoading(false);
      });
  }, [firebaseUser]);

  return { isAdmin, loading };
}
