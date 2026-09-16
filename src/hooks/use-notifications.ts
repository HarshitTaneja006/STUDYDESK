"use client";

import { useCallback, useEffect, useState } from "react";
import type { TaskResponse } from "@/lib/task-utils";

type Permission = "default" | "granted" | "denied" | "unsupported";

const STORAGE_KEY = "studydesk:notif-enabled";
const LAST_CHECK_KEY = "studydesk:notif-last-check";

/** Returns tasks due within the next `hours` (default 24h), excluding completed. */
function filterDueSoon(tasks: TaskResponse[], hours = 24): TaskResponse[] {
  const now = Date.now();
  const horizon = now + hours * 60 * 60 * 1000;
  return tasks.filter((t) => {
    if (t.status === "completed" || !t.dueDate) return false;
    const due = new Date(t.dueDate).getTime();
    // Due in the future, within the horizon, and not already past (overdue handled separately)
    return due > now && due <= horizon;
  });
}

function filterOverdue(tasks: TaskResponse[]): TaskResponse[] {
  const now = Date.now();
  return tasks.filter((t) => {
    if (t.status === "completed" || !t.dueDate) return false;
    return new Date(t.dueDate).getTime() < now;
  });
}

function getInitialPermission(): Permission {
  if (typeof window === "undefined") return "default";
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission as Permission;
}

function getInitialEnabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function useNotifications(tasks: TaskResponse[]) {
  // Lazy init avoids setState-in-effect lint errors and is SSR-safe.
  const [permission, setPermission] = useState<Permission>(getInitialPermission);
  const [enabled, setEnabled] = useState<boolean>(getInitialEnabled);

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    const result = await Notification.requestPermission();
    setPermission(result as Permission);
    return result;
  }, []);

  const toggleEnabled = useCallback(
    async (next: boolean) => {
      if (next && permission !== "granted") {
        const result = await requestPermission();
        if (result !== "granted") return; // don't enable if not granted
      }
      setEnabled(next);
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
    },
    [permission, requestPermission]
  );

  // Check for due-soon / overdue tasks and fire notifications
  useEffect(() => {
    if (!enabled || permission !== "granted") return;
    if (typeof window === "undefined" || !("Notification" in window)) return;

    const now = Date.now();

    const dueSoon = filterDueSoon(tasks, 24);
    const overdue = filterOverdue(tasks);

    // Only notify about tasks we haven't notified about yet.
    // We track notified task IDs in localStorage to avoid duplicates.
    const notifiedKey = "studydesk:notified-ids";
    let notifiedIds: Set<string> = new Set();
    try {
      const raw = window.localStorage.getItem(notifiedKey);
      if (raw) notifiedIds = new Set(JSON.parse(raw));
    } catch {
      // ignore
    }

    const newNotifications: { id: string; title: string; body: string }[] = [];

    for (const t of dueSoon) {
      if (notifiedIds.has(t.id)) continue;
      const due = new Date(t.dueDate!).getTime();
      const hoursLeft = Math.round((due - now) / (60 * 60 * 1000));
      newNotifications.push({
        id: t.id,
        title: "Task due soon",
        body: `"${t.title}" is due in ${hoursLeft}h${t.category ? ` (${t.category})` : ""}.`,
      });
      notifiedIds.add(t.id);
    }

    for (const t of overdue) {
      if (notifiedIds.has(t.id + ":overdue")) continue;
      newNotifications.push({
        id: t.id + ":overdue",
        title: "Task overdue",
        body: `"${t.title}" was due and is still pending. Tap to view.`,
      });
      notifiedIds.add(t.id + ":overdue");
    }

    // Fire notifications
    for (const n of newNotifications) {
      try {
        new Notification(n.title, {
          body: n.body,
          icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
          tag: n.id,
        });
      } catch {
        // ignore
      }
    }

    // Persist notified IDs (keep last 200 to avoid unbounded growth)
    if (newNotifications.length > 0) {
      try {
        const arr = Array.from(notifiedIds).slice(-200);
        window.localStorage.setItem(notifiedKey, JSON.stringify(arr));
        window.localStorage.setItem(LAST_CHECK_KEY, String(now));
      } catch {
        // ignore
      }
    }
  }, [enabled, permission, tasks]);

  return {
    permission,
    enabled,
    requestPermission,
    toggleEnabled,
    dueSoonCount: filterDueSoon(tasks, 24).length,
    overdueCount: filterOverdue(tasks).length,
  };
}
