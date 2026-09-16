"use client";

import { useState } from "react";
import { Check, Edit, Trash2, Calendar, Tag, AlertCircle, Clock, ListChecks, Repeat } from "lucide-react";
import type { TaskResponse } from "@/lib/task-utils";
import { useToast } from "@/hooks/use-toast";

interface TaskCardProps {
  task: TaskResponse;
  onEdit: (task: TaskResponse) => void;
  onChanged: () => void;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onOpenDetail?: (task: TaskResponse) => void;
  onTaskCompleted?: (task: TaskResponse, originX: number, originY: number) => void;
}

const PRIORITY_STYLE: Record<
  string,
  { label: string; stripe: string; chipBg: string; chipText: string; chipBorder: string }
> = {
  high: {
    label: "High",
    stripe: "#a7342d",
    chipBg: "#f3d8d5",
    chipText: "#7a2118",
    chipBorder: "#a7342d",
  },
  medium: {
    label: "Medium",
    stripe: "#8b8612",
    chipBg: "#f5f0c6",
    chipText: "#5a5308",
    chipBorder: "#8b8612",
  },
  low: {
    label: "Low",
    stripe: "#5e7a44",
    chipBg: "#d5dfc8",
    chipText: "#3a4d28",
    chipBorder: "#5e7a44",
  },
};

function formatDueDate(due: string | null): {
  text: string;
  overdue: boolean;
  today: boolean;
  soon: boolean;
} {
  if (!due) return { text: "", overdue: false, today: false, soon: false };
  const d = new Date(due);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  const isToday = d >= startOfToday && d <= endOfToday;
  const isOverdue = diffMs < 0 && !isToday;
  // "soon" = within 24h, not overdue
  const isSoon = !isOverdue && diffMs > 0 && diffMs < 24 * 60 * 60 * 1000;

  let text: string;
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (isToday) text = `Today, ${time}`;
  else if (diffDays === 1 || (diffDays === 0 && !isToday))
    text = `Tomorrow, ${time}`;
  else if (diffDays === -1) text = `Yesterday, ${time}`;
  else if (diffDays > 1 && diffDays <= 6)
    text = `${d.toLocaleDateString([], { weekday: "short" })}, ${time}`;
  else text = `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${time}`;

  return { text, overdue: isOverdue, today: isToday, soon: isSoon };
}

export function TaskCard({
  task,
  onEdit,
  onChanged,
  selectable = false,
  selected = false,
  onToggleSelect,
  onOpenDetail,
  onTaskCompleted,
}: TaskCardProps) {
  const { toast } = useToast();
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const isCompleted = task.status === "completed";
  const prio = PRIORITY_STYLE[task.priority] || PRIORITY_STYLE.medium;
  const due = formatDueDate(task.dueDate);

  async function toggleComplete(e?: React.MouseEvent) {
    setToggling(true);
    try {
      const newStatus = isCompleted ? "pending" : "completed";
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to update status");
      }
      const data = await res.json();
      if (data.recurrenceAdvanced) {
        toast({
          title: "Recurring task advanced",
          description: `"${task.title}" due date moved to next ${task.recurrence} cycle.`,
        });
      } else {
        toast({
          title: newStatus === "completed" ? "Nice work!" : "Marked pending",
          description:
            newStatus === "completed"
              ? `"${task.title}" is done.`
              : `"${task.title}" moved back to pending.`,
        });
        // Fire confetti on actual completion (not reopen)
        if (newStatus === "completed" && onTaskCompleted) {
          const rect = e?.currentTarget?.getBoundingClientRect();
          if (rect) {
            onTaskCompleted(task, rect.left + rect.width / 2, rect.top + rect.height / 2);
          } else {
            onTaskCompleted(task, window.innerWidth / 2, window.innerHeight / 3);
          }
        }
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
      setToggling(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to delete task");
      }
      toast({
        title: "Task deleted",
        description: `"${task.title}" was removed from your desk.`,
      });
      onChanged();
    } catch (e) {
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Unknown error",
        // @ts-expect-error custom variant
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <article
      className={`paper-pop task-card-hover ${isCompleted ? "task-completed" : ""} ${selected ? "task-selected" : ""} ${due.overdue && !isCompleted ? "task-overdue" : ""}`}
      style={{
        position: "relative",
        margin: 0,
        display: "flex",
      }}
    >
      {/* Priority left stripe */}
      <div
        aria-hidden
        style={{
          width: "6px",
          flexShrink: 0,
          background: isCompleted ? "#cdcccb" : prio.stripe,
          borderRight: "1px solid rgba(0,0,0,0.15)",
        }}
      />
      <div
        style={{
          flex: 1,
          minWidth: 0,
          borderTop: `2px solid ${selected ? "#0b74d5" : isCompleted ? "#cdcccb" : "#41403e"}`,
          borderRight: `2px solid ${selected ? "#0b74d5" : isCompleted ? "#cdcccb" : "#41403e"}`,
          borderBottom: `2px solid ${selected ? "#0b74d5" : isCompleted ? "#cdcccb" : "#41403e"}`,
          borderLeft: "none",
          background: isCompleted
            ? "#f2efe8"
            : selected
              ? "#eef4fc"
              : "#fffdf7",
          padding: "0.9rem 0.95rem",
          boxShadow: selected
            ? "3px 3px 0 #0b74d5"
            : "2px 3px 0 rgba(0,0,0,0.10)",
          opacity: isCompleted ? 0.85 : 1,
          transition: "box-shadow 0.15s ease, transform 0.15s ease",
        }}
      >
        {/* Top row: select / checkbox + title + actions */}
        <div style={{ display: "flex", gap: "0.55rem", alignItems: "flex-start" }}>
          {selectable && (
            <button
              type="button"
              onClick={() => onToggleSelect?.(task.id)}
              aria-label={selected ? "Deselect task" : "Select task"}
              aria-pressed={selected}
              title={selected ? "Deselect" : "Select"}
              style={{
                flexShrink: 0,
                width: "22px",
                height: "22px",
                marginTop: "3px",
                border: `2px solid ${selected ? "#0b74d5" : "#868e96"}`,
                background: selected ? "#0b74d5" : "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                padding: 0,
              }}
            >
              {selected && <Check size={14} strokeWidth={3} className="dot-pop" />}
            </button>
          )}

          <button
            type="button"
            onClick={(e) => toggleComplete(e)}
            disabled={toggling}
            aria-label={isCompleted ? "Mark as pending" : "Mark as completed"}
            title={isCompleted ? "Mark as pending" : "Mark as completed"}
            style={{
              flexShrink: 0,
              width: "26px",
              height: "26px",
              marginTop: "1px",
              border: `2px solid ${isCompleted ? "#86a361" : prio.stripe}`,
              background: isCompleted ? "#86a361" : "transparent",
              cursor: toggling ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              padding: 0,
              transition: "background 0.2s ease, transform 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (!isCompleted && !toggling)
                e.currentTarget.style.background = `${prio.stripe}22`;
            }}
            onMouseLeave={(e) => {
              if (!isCompleted) e.currentTarget.style.background = "transparent";
            }}
          >
            {isCompleted && <Check size={16} strokeWidth={3} className="dot-pop" />}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <h4
              onClick={() => onOpenDetail?.(task)}
              style={{
                margin: 0,
                fontFamily: "'Patrick Hand SC', cursive",
                fontSize: "1.2rem",
                lineHeight: 1.25,
                color: isCompleted ? "#868e96" : "#1a1a1a",
                textDecoration: isCompleted ? "line-through" : "none",
                textDecorationThickness: isCompleted ? "2px" : undefined,
                wordBreak: "break-word",
                overflowWrap: "break-word",
                wordWrap: "break-word",
                hyphens: "auto",
                WebkitHyphens: "auto",
                MozHyphens: "auto",
                cursor: onOpenDetail ? "pointer" : "default",
              }}
              title={onOpenDetail ? "Click to view details" : undefined}
            >
              {task.title}
            </h4>
            {task.description && (
              <p
                style={{
                  margin: "0.35rem 0 0",
                  fontSize: "0.9rem",
                  color: isCompleted ? "#a8a5a0" : "#555",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  overflowWrap: "break-word",
                  lineHeight: 1.4,
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {task.description}
              </p>
            )}
            {/* Subtask progress mini-bar */}
            {task.subtaskProgress && task.subtaskProgress.total > 0 && (
              <div
                style={{
                  marginTop: "0.45rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.78rem",
                  color: "#41403e",
                }}
              >
                <ListChecks size={13} color="#41403e" />
                <div
                  style={{
                    flex: 1,
                    height: "6px",
                    border: "1.5px solid #41403e",
                    background: "#f4f1ea",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${
                        (task.subtaskProgress.done / task.subtaskProgress.total) * 100
                      }%`,
                      background:
                        task.subtaskProgress.done === task.subtaskProgress.total
                          ? "#86a361"
                          : "#0b74d5",
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
                <span
                  style={{
                    color:
                      task.subtaskProgress.done === task.subtaskProgress.total
                        ? "#5e7a44"
                        : "#41403e",
                    fontWeight: 600,
                  }}
                >
                  {task.subtaskProgress.done}/{task.subtaskProgress.total}
                </span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.15rem", flexShrink: 0 }}>
            <button
              type="button"
              className="card-action-btn"
              onClick={() => onEdit(task)}
              aria-label="Edit task"
              title="Edit"
              style={{
                background: "transparent",
                color: "#41403e",
                padding: "0.3rem",
                minWidth: "28px",
                height: "28px",
                border: "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f4f1ea")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Edit size={15} />
            </button>
            <button
              type="button"
              className="card-action-btn"
              onClick={() => setConfirmingDelete(true)}
              disabled={deleting}
              aria-label="Delete task"
              title="Delete"
              style={{
                background: confirmingDelete ? "#a7342d" : "transparent",
                color: confirmingDelete ? "#fffdf7" : "#a7342d",
                padding: "0.3rem",
                minWidth: "28px",
                height: "28px",
                border: "none",
                cursor: deleting ? "wait" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!confirmingDelete)
                  e.currentTarget.style.background = "#f3d8d5";
              }}
              onMouseLeave={(e) => {
                if (!confirmingDelete)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              {deleting ? "..." : <Trash2 size={15} />}
            </button>
          </div>
        </div>

        {/* Delete confirmation overlay */}
        {confirmingDelete && (
          <div
            className="fade-in"
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255,253,247,0.97)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              padding: "0.75rem",
              zIndex: 5,
              border: "2px solid #a7342d",
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: "'Neucha', cursive",
                fontSize: "0.85rem",
                color: "#a7342d",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              Delete this task?
            </p>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                style={{
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "0.82rem",
                  padding: "0.3rem 0.7rem",
                  background: "transparent",
                  color: "#41403e",
                  border: "2px solid #41403e",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "0.82rem",
                  padding: "0.3rem 0.7rem",
                  background: "#a7342d",
                  color: "#fffdf7",
                  border: "2px solid #7a2118",
                  cursor: deleting ? "wait" : "pointer",
                }}
              >
                {deleting ? "..." : "Delete"}
              </button>
            </div>
          </div>
        )}

        {/* Meta row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.35rem 0.7rem",
            marginTop: "0.65rem",
            fontSize: "0.82rem",
            alignItems: "center",
          }}
        >
          <span
            style={{
              textTransform: "capitalize",
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "0.78rem",
              padding: "0.1rem 0.5rem",
              background: prio.chipBg,
              color: prio.chipText,
              border: `1px solid ${prio.chipBorder}`,
              fontWeight: 700,
            }}
          >
            {prio.label}
          </span>

          {task.category && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#41403e",
                fontFamily: "'Neucha', cursive",
                fontWeight: 600,
              }}
            >
              <Tag size={13} />
              {task.category}
            </span>
          )}

          {task.dueDate && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                color:
                  due.overdue && !isCompleted
                    ? "#a7342d"
                    : due.today
                      ? "#8b6a0d"
                      : "#41403e",
                fontWeight: due.overdue && !isCompleted ? 700 : 600,
                fontFamily: "'Neucha', cursive",
                position: "relative",
              }}
            >
              {due.overdue && !isCompleted ? (
                <AlertCircle size={13} />
              ) : due.soon && !isCompleted ? (
                <Clock size={13} />
              ) : (
                <Calendar size={13} />
              )}
              {due.text}
              {due.overdue && !isCompleted && (
                <span style={{ color: "#a7342d", fontWeight: 700 }}>
                  {" "}· overdue
                </span>
              )}
              {due.soon && !due.overdue && !isCompleted && !due.today && (
                <span
                  aria-hidden
                  className="pulse-dot"
                  style={{
                    display: "inline-block",
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "#a7342d",
                    marginLeft: "0.2rem",
                  }}
                />
              )}
            </span>
          )}

          {task.recurrence && task.recurrence !== "none" && (
            <span
              title={`Repeats ${task.recurrence} · next due auto-advances on completion`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                color: "#0b74d5",
                fontFamily: "'Neucha', cursive",
                fontWeight: 600,
                padding: "0.05rem 0.4rem",
                background: "#eef4fc",
                border: "1px solid #0b74d5",
                textTransform: "capitalize",
                fontSize: "0.76rem",
              }}
            >
              <Repeat size={11} />
              {task.recurrence}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
