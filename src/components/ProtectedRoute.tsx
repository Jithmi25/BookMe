"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { UserRole } from "@/types/user";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * If provided, only users whose appUser.role is in this list may view the
   * page — everyone else is redirected home. Omit to allow any signed-in,
   * role-selected user through.
   */
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { firebaseUser, appUser, loading } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Not signed in at all
    if (!firebaseUser) {
      router.push("/auth/signin");
      return;
    }

    // Signed in, but hasn't finished picking a role yet
    if (!appUser?.role) {
      router.push("/auth/role-selection");
      return;
    }

    // Suspended by an admin — block everything behind ProtectedRoute
    if (appUser.suspended) {
      router.push("/suspended");
      return;
    }

    // Signed in with a role, but not one this page allows
    if (allowedRoles && !allowedRoles.includes(appUser.role)) {
      if (appUser.role === "provider") {
        router.push("/provider/dashboard");
      } else if (appUser.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    }
  }, [loading, firebaseUser, appUser, allowedRoles, router]);

  if (loading) return <div>Loading...</div>;
  if (!firebaseUser || !appUser?.role) return null;
  if (appUser.suspended) return null;
  if (allowedRoles && !allowedRoles.includes(appUser.role)) return null;

  return <>{children}</>;
}
