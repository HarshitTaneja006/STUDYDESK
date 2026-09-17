"use client";

import { useEffect, useState, useCallback } from "react";
import {
  X,
  Calendar,
  Tag,
  AlertCircle,
  Clock,
  Edit,
  Check,
  Repeat,
} from "lucide-react";
import type { TaskResponse } from "@/lib/task-utils";
import { SubtaskList } from "@/components/subtask-list";
import { useToast } from "@/hooks/use-toast";

interface TaskDetailProps {
  task: TaskResponse | null;
  open: boolean;
  onClose: () => void;
  onEdit: (task: TaskResponse) => void;
  onChanged: () => void;
}

const PRIORITY_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  high: { label: "High", color: "#a7342d", bg: "#f3d8d5" },
  medium: { label: "Medium", color: "#5a5308", bg: "#f5f0c6" },
  low: { label: "Low", color: "#3a4d28", bg: "#d5dfc8" },
};

function formatDueDate(due: string | null) {
  if (!due) return null;
  const d = new Date(due);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const isToday = d >= startOfToday && d <= endOfToday;
  const isOverdue = diffMs < 0 && !isToday;
  const isSoon = !isOverdue && diffMs > 0 && diffMs < 24 * 60 * 60 * 1000;
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  let text: string;
  if (isToday) text = `Today, ${time}`;
  else if (diffDays === 1 || (diffDays === 0 && !isToday)) text = `Tomorrow, ${time}`;
  else if (diffDays === -1) text = `Yesterday, ${time}`;
  else if (diffDays > 1 && diffDays <= 6)
    text = `${d.toLocaleDateString([], { weekday: "short" })}, ${time}`;
  else text = `${d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })}, ${time}`;
  return { text, isOverdue, isToday, isSoon, date: d };
}

export function TaskDetail({
  task,
  open,
  onClose,
  onEdit,
  onChanged,
}: TaskDetailProps) {
  const { toast } = useToast();
  const [current, setCurrent] = useState<TaskResponse | null>(task);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    setCurrent(task);
  }, [task]);

  // Escape closes drawer
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, handleKeyDown]);

  if (!open || !current) return null;

  const prio = PRIORITY_META[current.priority] || PRIORITY_META.medium;
  const due = formatDueDate(current.dueDate);
  const isCompleted = current.status === "completed";

  async function toggleComplete() {
    if (!current) return;
    setToggling(true);
    try {
      const newStatus = isCompleted ? "pending" : "completed";
      const res = await fetch(`/api/tasks/${current.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update");
      }
      const data = await res.json();
      setCurrent(data.task);
      if (data.recurrenceAdvanced) {
        toast({
          title: "Recurring task advanced",
          description: `"${current.title}" due date moved to next ${current.recurrence} cycle. Subtasks reset.`,
        });
      } else {
        toast({
          title: newStatus === "completed" ? "Nice work!" : "Marked pending",
          description:
            newStatus === "completed"
              ? `"${current.title}" is done.`
              : `"${current.title}" moved back to pending.`,
        });
      }
      onChanged();
    } catch (e) {
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setToggling(false);
    }
  }

  function handleSubtasksChanged() {
    // refetch task to update subtask progress
    if (!current) return;
    fetch(`/api/tasks/${current.id}`)
      .then((r) => r.json())
      .then((d) => setCurrent(d.task))
      .catch(() => {});
    onChanged();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Task details: ${current.title}`}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(20,18,15,0.5)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="slide-in-right"
        style={{
          position: "relative",
          width: "min(100%, 460px)",
          height: "100%",
          background: "#fffdf7",
          borderLeft: "3px solid #41403e",
          boxShadow: "-6px 0 12px rgba(0,0,0,0.18)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Priority strip header */}
        <div
          aria-hidden
          style={{
            height: "6px",
            background: isCompleted ? "#cdcccb" : prio.color,
            flexShrink: 0,
          }}
        />

        {/* Header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.65rem 1rem",
            borderBottom: "2px dashed #c1bdb4",
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.025) 6px, rgba(0,0,0,0.025) 12px)",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "0.95rem",
              color: "#868e96",
            }}
          >
            Task Details
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
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

        {/* Body (scrollable) */}
        <div
          className="paper-scroll"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.1rem",
          }}
        >
          {/* Title + completed indicator */}
          <div>
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "flex-start",
                marginBottom: "0.4rem",
              }}
            >
              <button
                type="button"
                onClick={toggleComplete}
                disabled={toggling}
                aria-label={
                  isCompleted ? "Mark as pending" : "Mark as completed"
                }
                style={{
                  flexShrink: 0,
                  width: "26px",
                  height: "26px",
                  marginTop: "2px",
                  border: `2px solid ${isCompleted ? "#86a361" : prio.color}`,
                  background: isCompleted ? "#86a361" : "transparent",
                  cursor: toggling ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  padding: 0,
                }}
              >
                {isCompleted && <Check size={15} strokeWidth={3} className="dot-pop" />}
              </button>
              <h2
                style={{
                  margin: 0,
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "1.5rem",
                  lineHeight: 1.25,
                  color: isCompleted ? "#868e96" : "#1a1a1a",
                  textDecoration: isCompleted ? "line-through" : "none",
                  textDecorationThickness: isCompleted ? "2px" : undefined,
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                  flex: 1,
                }}
              >
                {current.title}
              </h2>
            </div>
          </div>

          {/* Meta chips */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.45rem",
            }}
          >
            <span
              style={{
                fontFamily: "'Patrick Hand SC', cursive",
                fontSize: "0.82rem",
                padding: "0.18rem 0.6rem",
                background: prio.bg,
                color: prio.color,
                border: `1px solid ${prio.color}`,
                fontWeight: 700,
              }}
            >
              {prio.label} priority
            </span>
            {current.category && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.85rem",
                  padding: "0.18rem 0.6rem",
                  background: "#f4f1ea",
                  color: "#41403e",
                  border: "1px solid #868e96",
                  fontWeight: 600,
                }}
              >
                <Tag size={13} /> {current.category}
              </span>
            )}
            <span
              style={{
                fontFamily: "'Neucha', cursive",
                fontSize: "0.85rem",
                padding: "0.18rem 0.6rem",
                background: isCompleted ? "#e6eedb" : "#fbf6d8",
                color: isCompleted ? "#3a4d28" : "#5a5308",
                border: `1px solid ${isCompleted ? "#86a361" : "#8b8612"}`,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {current.status}
            </span>
          </div>

          {/* Due date */}
          {due && (
            <div
              style={{
                padding: "0.6rem 0.8rem",
                border: "2px solid #41403e",
                background: due.isOverdue && !isCompleted ? "#f3d8d5" : "#fffdf7",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {due.isOverdue && !isCompleted ? (
                <AlertCircle size={18} color="#a7342d" />
              ) : due.isSoon && !isCompleted ? (
                <Clock size={18} color="#a7342d" />
              ) : (
                <Calendar size={18} color="#41403e" />
              )}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'Patrick Hand SC', cursive",
                    fontSize: "0.95rem",
                    color:
                      due.isOverdue && !isCompleted
                        ? "#a7342d"
                        : "#41403e",
                    fontWeight: 700,
                  }}
                >
                  {due.text}
                </div>
                <small
                  style={{
                    fontFamily: "'Neucha', cursive",
                    fontSize: "0.78rem",
                    color: "#868e96",
                  }}
                >
                  {due.date.toLocaleDateString([], {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  {due.isOverdue && !isCompleted && " · OVERDUE"}
                  {due.isToday && " · due today"}
                </small>
              </div>
              {current.recurrence && current.recurrence !== "none" && (
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.25rem 0.5rem",
                    background: "#eef4fc",
                    border: "1px solid #0b74d5",
                    color: "#0b74d5",
                    fontFamily: "'Neucha', cursive",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    textTransform: "capitalize",
                  }}
                  title={`Repeats ${current.recurrence}. Completing this task auto-advances the due date.`}
                >
                  <Repeat size={12} />
                  {current.recurrence}
                </span>
              )}
            </div>
          )}

          {/* Recurrence note when no due date but recurrence set (edge case) */}
          {current.recurrence && current.recurrence !== "none" && !due && (
            <div
              style={{
                padding: "0.5rem 0.7rem",
                border: "1px dashed #868e96",
                background: "#f9f7f0",
                fontFamily: "'Neucha', cursive",
                fontSize: "0.82rem",
                color: "#868e96",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Repeat size={14} />
              Set as {current.recurrence} recurring - add a due date to enable auto-advance.
            </div>
          )}

          {/* Description */}
          {current.description ? (
            <div>
              <h4
                style={{
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "0.95rem",
                  margin: "0 0 0.35rem",
                  color: "#868e96",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Description
              </h4>
              <p
                style={{
                  margin: 0,
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                  color: "#1a1a1a",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  padding: "0.6rem 0.8rem",
                  border: "1px dashed #c1bdb4",
                  background: "#f9f7f0",
                }}
              >
                {current.description}
              </p>
            </div>
          ) : (
            <p
              style={{
                margin: 0,
                fontFamily: "'Neucha', cursive",
                fontSize: "0.88rem",
                color: "#a8a5a0",
                fontStyle: "italic",
              }}
            >
              No description provided.
            </p>
          )}

          {/* Subtasks */}
          <div
            style={{
              padding: "0.75rem 0.8rem",
              border: "2px solid #41403e",
              background: "#fffdf7",
            }}
          >
            <SubtaskList
              taskId={current.id}
              subtasks={current.subtasks || []}
              onChanged={handleSubtasksChanged}
            />
          </div>

          {/* Timestamps */}
          <div
            style={{
              fontFamily: "'Neucha', cursive",
              fontSize: "0.78rem",
              color: "#a8a5a0",
              display: "flex",
              flexDirection: "column",
              gap: "0.15rem",
              paddingTop: "0.5rem",
              borderTop: "1px dashed #c1bdb4",
            }}
          >
            <span>
              Created:{" "}
              {new Date(current.createdAt).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
            <span>
              Updated:{" "}
              {new Date(current.updatedAt).toLocaleString([], {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: "0.75rem 1rem",
            borderTop: "2px dashed #c1bdb4",
            display: "flex",
            gap: "0.5rem",
            flexShrink: 0,
            background: "#f9f7f0",
          }}
        >
          <button
            type="button"
            onClick={() => onEdit(current)}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "0.95rem",
              padding: "0.5rem",
              background: "transparent",
              color: "#41403e",
              border: "2px solid #41403e",
              cursor: "pointer",
            }}
          >
            <Edit size={15} /> Edit
          </button>
          <button
            type="button"
            onClick={toggleComplete}
            disabled={toggling}
            style={{
              flex: 1,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "0.95rem",
              padding: "0.5rem",
              background: isCompleted ? "#ddcd45" : "#86a361",
              color: isCompleted ? "#5a5308" : "#fffdf7",
              border: `2px solid ${isCompleted ? "#8b8612" : "#5e7a44"}`,
              cursor: toggling ? "wait" : "pointer",
            }}
          >
            <Check size={15} /> {isCompleted ? "Reopen" : "Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}
