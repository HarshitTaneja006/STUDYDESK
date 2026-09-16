"use client";

import { Check, Trash2, X, ListChecks } from "lucide-react";

interface BulkActionBarProps {
  selectedCount: number;
  onClear: () => void;
  onComplete: () => void;
  onPending: () => void;
  onDelete: () => void;
  busy?: boolean;
}

export function BulkActionBar({
  selectedCount,
  onClear,
  onComplete,
  onPending,
  onDelete,
  busy,
}: BulkActionBarProps) {
  if (selectedCount === 0) return null;
  return (
    <div
      className="slide-down"
      role="region"
      aria-label="Bulk actions"
      style={{
        position: "sticky",
        top: "58px",
        zIndex: 20,
        marginBottom: "0.85rem",
        border: "2px solid #0b74d5",
        background: "#eef4fc",
        boxShadow: "3px 3px 0 rgba(11,116,213,0.35)",
        padding: "0.6rem 0.85rem",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          fontFamily: "'Patrick Hand SC', cursive",
          fontSize: "1rem",
          color: "#0b74d5",
        }}
      >
        <ListChecks size={18} />
        {selectedCount} selected
      </span>

      <div
        style={{
          display: "flex",
          gap: "0.4rem",
          flexWrap: "wrap",
          marginLeft: "auto",
        }}
      >
        <button
          type="button"
          onClick={onComplete}
          disabled={busy}
          title="Mark selected as completed"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            fontFamily: "'Patrick Hand SC', cursive",
            fontSize: "0.85rem",
            padding: "0.35rem 0.7rem",
            background: "#86a361",
            color: "#fffdf7",
            border: "2px solid #5e7a44",
            cursor: busy ? "wait" : "pointer",
          }}
        >
          <Check size={14} /> Complete
        </button>
        <button
          type="button"
          onClick={onPending}
          disabled={busy}
          title="Mark selected as pending"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            fontFamily: "'Patrick Hand SC', cursive",
            fontSize: "0.85rem",
            padding: "0.35rem 0.7rem",
            background: "#ddcd45",
            color: "#5a5308",
            border: "2px solid #8b8612",
            cursor: busy ? "wait" : "pointer",
          }}
        >
          ↺ Pending
        </button>
        <button
          type="button"
          onClick={onDelete}
          disabled={busy}
          title="Delete selected tasks"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            fontFamily: "'Patrick Hand SC', cursive",
            fontSize: "0.85rem",
            padding: "0.35rem 0.7rem",
            background: "#a7342d",
            color: "#fffdf7",
            border: "2px solid #7a2118",
            cursor: busy ? "wait" : "pointer",
          }}
        >
          <Trash2 size={14} /> Delete
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={busy}
          aria-label="Clear selection"
          title="Clear selection"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
            background: "transparent",
            color: "#0b74d5",
            border: "2px solid #0b74d5",
            cursor: busy ? "wait" : "pointer",
            padding: 0,
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
