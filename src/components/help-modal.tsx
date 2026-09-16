"use client";

import { useEffect, useCallback } from "react";
import { X, Keyboard, Lightbulb } from "lucide-react";

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

const SHORTCUTS: { keys: string[]; label: string }[] = [
  { keys: ["N"], label: "Create new task" },
  { keys: ["/"], label: "Focus search bar" },
  { keys: ["V"], label: "Switch to list view" },
  { keys: ["C"], label: "Switch to calendar view" },
  { keys: ["B"], label: "Toggle bulk select mode" },
  { keys: ["A"], label: "Select all visible (in bulk mode)" },
  { keys: ["Esc"], label: "Close modal / clear focus" },
];

const TIPS: string[] = [
  "Click any task title to open the detail drawer with subtasks and full info.",
  "Use Quick Add Templates to instantly create common student tasks like problem sets or reading assignments.",
  "Set a recurrence (daily/weekly/monthly) on tasks with due dates — completing them auto-advances the due date.",
  "Enable browser notifications in the Tools menu to get alerts for tasks due within 24 hours.",
  "Export your tasks to CSV for backup, and import them on another device.",
  "Toggle dark mode with the sun/moon button for late-night studying.",
  "Use the calendar view to see all your due dates at a glance.",
  "Break big tasks into subtasks using the checklist in the detail drawer.",
];

export function HelpModal({ open, onClose }: HelpModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Help and keyboard shortcuts"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,18,15,0.55)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 70,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="paper-pop"
        style={{
          width: "100%",
          maxWidth: "520px",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fffdf7",
          border: "3px solid #41403e",
          boxShadow: "6px 6px 0 rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.85rem 1.25rem",
            borderBottom: "2px dashed #c1bdb4",
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.025) 6px, rgba(0,0,0,0.025) 12px)",
          }}
        >
          <h3
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "1.4rem",
              margin: 0,
              color: "#1a1a1a",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Keyboard size={22} /> Help & Shortcuts
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close help"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#868e96",
              padding: "0.3rem",
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.25rem" }}>
          {/* Shortcuts */}
          <h4
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "1rem",
              margin: "0 0 0.6rem",
              color: "#41403e",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Keyboard size={15} /> Keyboard Shortcuts
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "0 0 1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
            }}
          >
            {SHORTCUTS.map((s) => (
              <li
                key={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "0.6rem",
                  padding: "0.35rem 0.5rem",
                  borderBottom: "1px dashed #e9e6dd",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Neucha', cursive",
                    fontSize: "0.9rem",
                    color: "#41403e",
                  }}
                >
                  {s.label}
                </span>
                <span style={{ display: "inline-flex", gap: "0.2rem" }}>
                  {s.keys.map((k) => (
                    <kbd key={k}>{k}</kbd>
                  ))}
                </span>
              </li>
            ))}
          </ul>

          {/* Tips */}
          <h4
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "1rem",
              margin: "0 0 0.6rem",
              color: "#41403e",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Lightbulb size={15} /> Tips & Tricks
          </h4>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.45rem",
            }}
          >
            {TIPS.map((tip, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.88rem",
                  color: "#41403e",
                  lineHeight: 1.4,
                }}
              >
                <span
                  style={{
                    color: "#ddcd45",
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ★
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "0.6rem 1.25rem",
            borderTop: "2px dashed #c1bdb4",
            background: "#f9f7f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "'Neucha', cursive",
            fontSize: "0.8rem",
            color: "#868e96",
          }}
        >
          <span>Press <kbd>Esc</kbd> to close</span>
          <span>StudyDesk v5</span>
        </div>
      </div>
    </div>
  );
}
