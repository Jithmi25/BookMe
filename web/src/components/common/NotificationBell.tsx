"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

export function NotificationBell() {
  const { user } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } =
    useNotifications(user?.uid);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        aria-label="Notifications"
        onClick={() => setOpen((s) => !s)}
        className="relative p-2"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M15 17H9l-1 2h8l-1-2z" fill="currentColor" />
          <path
            d="M18 8a6 6 0 10-12 0v5l-2 2v1h18v-1l-2-2V8z"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <strong>Notifications</strong>
            <button
              onClick={() => markAllRead()}
              className="text-sm text-blue-600"
            >
              Mark all read
            </button>
          </div>
          <div className="max-h-64 overflow-auto">
            {notifications.length === 0 && (
              <div className="p-3 text-sm text-gray-500">No notifications</div>
            )}
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3 hover:bg-gray-50 cursor-pointer ${n.read ? "opacity-70" : ""}`}
                onClick={() => markRead(n.id)}
              >
                <div className="text-sm font-medium">{n.title}</div>
                <div className="text-xs text-gray-600">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">
                  {n.createdAt?.toDate
                    ? n.createdAt.toDate().toLocaleString()
                    : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
