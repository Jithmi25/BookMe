"use client";
import { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type NotificationItem = {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedDocId?: string;
  relatedDocType?: string;
  read?: boolean;
  createdAt?: any;
};

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map(
          (d) => ({ id: d.id, ...(d.data() as any) }) as NotificationItem,
        ),
      );
    });

    return () => unsub();
  }, [userId]);

  const markRead = useCallback(async (id: string) => {
    try {
      const ref = doc(db, "notifications", id);
      await updateDoc(ref, { read: true });
    } catch (err) {
      console.error("markRead error", err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      const unread = notifications.filter((n) => !n.read).slice(0, 50);
      await Promise.all(
        unread.map((n) =>
          updateDoc(doc(db, "notifications", n.id), { read: true }),
        ),
      );
    } catch (err) {
      console.error("markAllRead error", err);
    }
  }, [notifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, unreadCount, markRead, markAllRead };
}
