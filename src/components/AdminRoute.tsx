"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useIsAdmin } from "@/hooks/useIsAdmin";

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading: authLoading } = useAuthContext();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const router = useRouter();

  const loading = authLoading || adminLoading;

  useEffect(() => {
    if (loading) return;
    if (!firebaseUser) {
      router.push("/auth/signin");
      return;
    }
    if (!isAdmin) {
      router.push("/");
    }
  }, [loading, firebaseUser, isAdmin, router]);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!firebaseUser || !isAdmin) return null;

  return <>{children}</>;
}
