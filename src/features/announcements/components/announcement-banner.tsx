"use client";

import { useEffect, useState } from "react";
import { trpc } from "@/trpc/client";

const DISMISSED_KEY = "bux_dismissed_announcements";

type AnnouncementType = "info" | "success" | "warning" | "critical";

export function AnnouncementBanner() {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const { data: announcements } = trpc.announcement.getActive.useQuery();

  useEffect(() => {
    const stored = localStorage.getItem(DISMISSED_KEY);
    if (stored) {
      setDismissedIds(JSON.parse(stored));
    }
  }, []);

  const dismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(updated));
  };

  const visibleAnnouncements = announcements?.filter(
    (a) => !dismissedIds.includes(a.id)
  );

  if (!visibleAnnouncements?.length) return null;

  const getTypeStyles = (type: AnnouncementType) => {
    switch (type) {
      case "info":
        return "bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400";
      case "success":
        return "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400";
      case "critical":
        return "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400";
      default:
        return "bg-muted border-border text-foreground";
    }
  };

  return (
    <div className="space-y-2 mb-6">
      {visibleAnnouncements.map((announcement) => (
        <div
          key={announcement.id}
          className={`relative rounded-lg border px-4 py-3 ${getTypeStyles(announcement.type as AnnouncementType)}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium">{announcement.title}</p>
              <p className="text-sm opacity-90">{announcement.message}</p>
            </div>
            <button
              onClick={() => dismiss(announcement.id)}
              className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
              aria-label="Dismiss"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
