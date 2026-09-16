"use client";

import { useState } from "react";
import { Zap, X, ChevronDown } from "lucide-react";
import { TASK_TEMPLATES, type TaskTemplate } from "@/lib/task-templates";
import { useToast } from "@/hooks/use-toast";
import type { TaskResponse } from "@/lib/task-utils";

interface QuickAddTemplatesProps {
  onCreated: () => void;
  onCreatedTask?: (task: TaskResponse) => void;
}

export function QuickAddTemplates({ onCreated }: QuickAddTemplatesProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function applyTemplate(tpl: TaskTemplate) {
    setBusy(tpl.id);
    try {
      const payload: Record<string, unknown> = {
        title: tpl.title,
        description: tpl.description,
        priority: tpl.priority,
        category: tpl.category,
        recurrence: "none",
      };
      if (tpl.dueInHours !== null) {
        const d = new Date();
        d.setHours(d.getHours() + tpl.dueInHours);
        // Default to a sensible time of day
        d.setMinutes(0, 0, 0);
        if (tpl.dueInHours <= 24) d.setHours(17, 0, 0, 0); // 5 PM for same-day
        else d.setHours(9, 0, 0, 0); // 9 AM for future days
        payload.dueDate = d.toISOString();
      } else {
        payload.dueDate = null;
      }

      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to create task");
      }
      toast({
        title: `${tpl.emoji} Template added`,
        description: `"${tpl.title}" created${tpl.dueInHours ? ` (due in ${tpl.dueInHours}h)` : ""}.`,
      });
      onCreated();
    } catch (e) {
      toast({
        title: "Could not add template",
        description: e instanceof Error ? e.message : "Unknown error",
        // @ts-expect-error custom variant
        variant: "destructive",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div
      style={{
        marginBottom: "1rem",
        border: "2px solid #41403e",
        background: "#fffdf7",
        boxShadow: "2px 2px 0 rgba(0,0,0,0.10)",
        overflow: "hidden",
      }}
    >
      {/* Header row (collapsible) */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.6rem 0.85rem",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontFamily: "'Patrick Hand SC', cursive",
          fontSize: "1rem",
          color: "#41403e",
        }}
      >
        <Zap size={16} color="#ddcd45" />
        <span style={{ flex: 1, textAlign: "left" }}>Quick Add Templates</span>
        <small
          style={{
            fontFamily: "'Neucha', cursive",
            fontSize: "0.78rem",
            color: "#868e96",
          }}
        >
          {TASK_TEMPLATES.length} presets
        </small>
        <ChevronDown
          size={16}
          style={{
            transition: "transform 0.2s ease",
            transform: expanded ? "rotate(180deg)" : "rotate(0)",
          }}
        />
      </button>

      {/* Template chips */}
      {expanded && (
        <div
          className="fade-in"
          style={{
            padding: "0 0.85rem 0.75rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 140px), 1fr))",
            gap: "0.45rem",
          }}
        >
          {TASK_TEMPLATES.map((tpl) => (
            <button
              key={tpl.id}
              type="button"
              onClick={() => applyTemplate(tpl)}
              disabled={busy !== null}
              title={`${tpl.title} — ${tpl.description.slice(0, 60)}...`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "0.2rem",
                padding: "0.5rem 0.6rem",
                background: busy === tpl.id ? "#f4f1ea" : "#fffdf7",
                color: "#41403e",
                border: "2px solid #c1bdb4",
                cursor: busy !== null ? "wait" : "pointer",
                fontFamily: "'Neucha', cursive",
                fontSize: "0.85rem",
                textAlign: "left",
                transition: "all 0.15s ease",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (busy === null) {
                  e.currentTarget.style.borderColor = "#41403e";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow = "2px 2px 0 rgba(0,0,0,0.12)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#c1bdb4";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <span style={{ fontSize: "1.1rem", lineHeight: 1 }}>{tpl.emoji}</span>
              <span style={{ fontWeight: 600, lineHeight: 1.2 }}>{tpl.label}</span>
              {tpl.dueInHours !== null && (
                <small
                  style={{
                    fontSize: "0.72rem",
                    color: "#868e96",
                  }}
                >
                  +{tpl.dueInHours}h
                </small>
              )}
              {busy === tpl.id && (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(244,241,234,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "'Patrick Hand SC', cursive",
                    fontSize: "0.8rem",
                    color: "#41403e",
                  }}
                >
                  Adding...
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
