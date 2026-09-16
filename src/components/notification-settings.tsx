"use client";

import { useSyncExternalStore } from "react";
import { Bell, BellOff, BellRing, CheckCircle2, AlertCircle } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import type { TaskResponse } from "@/lib/task-utils";

interface NotificationSettingsProps {
  tasks: TaskResponse[];
}

// SSR-safe mounted check without setState-in-effect
const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function NotificationSettings({ tasks }: NotificationSettingsProps) {
  const { permission, enabled, toggleEnabled, dueSoonCount, overdueCount } =
    useNotifications(tasks);
  const mounted = useMounted();

  if (!mounted) return null;

  // Unsupported browser
  if (permission === "unsupported") {
    return (
      <div
        style={{
          padding: "0.5rem 0.7rem",
          border: "1px dashed #868e96",
          fontFamily: "'Neucha', cursive",
          fontSize: "0.8rem",
          color: "#868e96",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <BellOff size={14} /> Notifications not supported in this browser
      </div>
    );
  }

  const summary =
    dueSoonCount + overdueCount > 0
      ? `${dueSoonCount} due soon${overdueCount > 0 ? `, ${overdueCount} overdue` : ""}`
      : "All caught up";

  return (
    <button
      type="button"
      onClick={() => toggleEnabled(!enabled)}
      aria-pressed={enabled}
      title={
        enabled
          ? "Notifications enabled — click to disable"
          : "Enable browser notifications for due-soon tasks"
      }
      style={{
        width: "100%",
        textAlign: "left",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.5rem 0.6rem",
        background: enabled ? "#eef4fc" : "transparent",
        border: "none",
        cursor: "pointer",
        fontFamily: "'Neucha', cursive",
        fontSize: "0.9rem",
        color: enabled ? "#0b74d5" : "#41403e",
      }}
    >
      {enabled ? <BellRing size={15} /> : <Bell size={15} />}
      <span style={{ flex: 1 }}>
        Notifications
        <small
          style={{
            display: "block",
            fontSize: "0.78rem",
            color: enabled ? "#0b74d5" : "#868e96",
            marginTop: "0.1rem",
          }}
        >
          {enabled
            ? permission === "granted"
              ? summary
              : "Click to grant permission"
            : "Get alerts for due-soon tasks"}
        </small>
      </span>
      {enabled && permission === "granted" && (
        <CheckCircle2 size={14} style={{ color: "#86a361" }} />
      )}
      {enabled && permission === "denied" && (
        <AlertCircle size={14} style={{ color: "#a7342d" }} />
      )}
    </button>
  );
}
