"use client";

import { useState } from "react";
import { Check, Plus, Trash2, ListChecks } from "lucide-react";
import type { SubtaskResponse } from "@/lib/task-utils";
import { useToast } from "@/hooks/use-toast";

interface SubtaskListProps {
  taskId: string;
  subtasks: SubtaskResponse[];
  onChanged: () => void;
}

export function SubtaskList({ taskId, subtasks, onChanged }: SubtaskListProps) {
  const { toast } = useToast();
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function addSubtask(e: React.FormEvent) {
    e.preventDefault();
    const t = newTitle.trim();
    if (!t) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: t }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add subtask");
      }
      setNewTitle("");
      onChanged();
    } catch (e) {
      toast({
        title: "Could not add subtask",
        description: e instanceof Error ? e.message : "Unknown error",
        // @ts-expect-error custom variant
        variant: "destructive",
      });
    } finally {
      setAdding(false);
    }
  }

  async function toggleDone(sub: SubtaskResponse) {
    setBusyId(sub.id);
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks/${sub.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ done: !sub.done }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update");
      }
      onChanged();
    } catch (e) {
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Unknown error",
        // @ts-expect-error custom variant
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function deleteSub(sub: SubtaskResponse) {
    setBusyId(sub.id);
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks/${sub.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete");
      }
      onChanged();
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Unknown error",
        // @ts-expect-error custom variant
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  }

  const done = subtasks.filter((s) => s.done).length;
  const total = subtasks.length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.5rem",
          fontFamily: "'Patrick Hand SC', cursive",
          fontSize: "1rem",
          color: "#41403e",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <ListChecks size={16} /> Checklist
        </span>
        {total > 0 && (
          <span
            style={{
              fontSize: "0.85rem",
              color: total === done ? "#5e7a44" : "#868e96",
            }}
          >
            {done}/{total} done
          </span>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div
          style={{
            height: "8px",
            border: "1.5px solid #41403e",
            background: "#f4f1ea",
            marginBottom: "0.6rem",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(done / total) * 100}%`,
              background: "#86a361",
              transition: "width 0.3s ease",
            }}
          />
        </div>
      )}

      {/* Subtask list */}
      <ul
        style={{
          listStyle: "none",
          padding: 0,
          margin: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
        }}
      >
        {subtasks.map((sub) => (
          <li
            key={sub.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.35rem 0.4rem",
              border: "1px dashed #c1bdb4",
              background: sub.done ? "#f4f1ea" : "#fffdf7",
            }}
          >
            <button
              type="button"
              onClick={() => toggleDone(sub)}
              disabled={busyId === sub.id}
              aria-label={sub.done ? "Mark as not done" : "Mark as done"}
              style={{
                flexShrink: 0,
                width: "20px",
                height: "20px",
                border: `2px solid ${sub.done ? "#86a361" : "#868e96"}`,
                background: sub.done ? "#86a361" : "transparent",
                cursor: busyId === sub.id ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                padding: 0,
              }}
            >
              {sub.done && <Check size={12} strokeWidth={3} className="dot-pop" />}
            </button>
            <span
              style={{
                flex: 1,
                fontFamily: "'Neucha', cursive",
                fontSize: "0.92rem",
                color: sub.done ? "#868e96" : "#1a1a1a",
                textDecoration: sub.done ? "line-through" : "none",
                wordBreak: "break-word",
              }}
            >
              {sub.title}
            </span>
            <button
              type="button"
              onClick={() => deleteSub(sub)}
              disabled={busyId === sub.id}
              aria-label="Delete subtask"
              style={{
                background: "transparent",
                border: "none",
                color: "#a7342d",
                cursor: busyId === sub.id ? "wait" : "pointer",
                padding: "0.2rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Trash2 size={13} />
            </button>
          </li>
        ))}
      </ul>

      {/* Add subtask */}
      <form
        onSubmit={addSubtask}
        style={{ display: "flex", gap: "0.4rem", marginTop: "0.5rem" }}
      >
        <input
          type="text"
          placeholder="Add a step..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          maxLength={160}
          disabled={adding}
          aria-label="New subtask"
          style={{
            flex: 1,
            fontFamily: "'Neucha', cursive",
            fontSize: "0.9rem",
          }}
        />
        <button
          type="submit"
          disabled={adding || !newTitle.trim()}
          aria-label="Add subtask"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            background: "#41403e",
            color: "#fffdf7",
            border: "2px solid #41403e",
            cursor: adding || !newTitle.trim() ? "not-allowed" : "pointer",
            padding: 0,
          }}
        >
          <Plus size={16} />
        </button>
      </form>
    </div>
  );
}
