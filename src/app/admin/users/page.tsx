"use client";

import { useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { AdminRoute } from "@/components/AdminRoute";
import { setUserSuspended } from "@/lib/adminActions";
import { AppUser } from "@/types/user";

function UserRow({ user }: { user: AppUser }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    setBusy(true);
    setError(null);
    try {
      await setUserSuspended(user.uid, !user.suspended);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-white p-4">
      <div>
        <p className="font-semibold text-foreground">{user.name}</p>
        <p className="text-sm text-foreground/60">
          {user.email ?? user.phone ?? "No contact info"} ·{" "}
          {user.role ?? "no role"}
        </p>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
      <div className="flex items-center gap-3">
        {user.suspended && (
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
            Suspended
          </span>
        )}
        <button
          type="button"
          disabled={busy}
          onClick={handleToggle}
          className={`rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60 ${
            user.suspended
              ? "bg-brand text-white"
              : "border border-border text-foreground hover:bg-brand-soft/40"
          }`}
        >
          {busy ? "..." : user.suspended ? "Unsuspend" : "Suspend"}
        </button>
      </div>
    </div>
  );
}

function UsersContent() {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const [snapshot, loading] = useCollection(q);

  const users = (snapshot?.docs.map((d) => ({
    uid: d.id,
    ...d.data(),
  })) ?? []) as AppUser[];

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-semibold text-foreground">Users</h1>

      <div className="mt-6 space-y-3">
        {loading && (
          <p className="text-center text-foreground/60">Loading...</p>
        )}
        {!loading && users.length === 0 && (
          <p className="text-center text-foreground/60">No users yet.</p>
        )}
        {users.map((user) => (
          <UserRow key={user.uid} user={user} />
        ))}
      </div>
    </main>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminRoute>
      <UsersContent />
    </AdminRoute>
  );
}
