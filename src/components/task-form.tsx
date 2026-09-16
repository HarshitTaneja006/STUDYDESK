"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { X, CalendarPlus, AlertCircle, Repeat } from "lucide-react";
import type { TaskResponse, TaskPriority, TaskRecurrence } from "@/lib/task-utils";
import { CATEGORIES, PRIORITY, RECURRENCE } from "@/lib/task-utils";
import { useToast } from "@/hooks/use-toast";

interface TaskFormProps {
  open: boolean;
  editingTask: TaskResponse | null;
  onClose: () => void;
  onSaved: () => void;
}

interface FormErrors {
  title?: string;
  description?: string;
  dueDate?: string;
}

const PRIORITY_META: Record<
  TaskPriority,
  { label: string; color: string; bg: string; border: string; emoji: string }
> = {
  high: {
    label: "High",
    color: "#a7342d",
    bg: "#f3d8d5",
    border: "#a7342d",
    emoji: "!!!",
  },
  medium: {
    label: "Medium",
    color: "#7a6e0d",
    bg: "#f5f0c6",
    border: "#8b8612",
    emoji: "!!",
  },
  low: {
    label: "Low",
    color: "#5e7a44",
    bg: "#d5dfc8",
    border: "#86a361",
    emoji: "!",
  },
};

const RECURRENCE_META: Record<
  TaskRecurrence,
  { label: string; emoji: string; hint: string }
> = {
  none: { label: "Once", emoji: "○", hint: "No repeat" },
  daily: { label: "Daily", emoji: "↻", hint: "Repeats every day" },
  weekly: { label: "Weekly", emoji: "↻", hint: "Repeats every week" },
  monthly: { label: "Monthly", emoji: "↻", hint: "Repeats every month" },
};

function toLocalInput(date: Date): string {
  // returns yyyy-MM-ddTHH:mm in local time
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function TaskForm({ open, editingTask, onClose, onSaved }: TaskFormProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [category, setCategory] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>("");
  const [recurrence, setRecurrence] = useState<TaskRecurrence>("none");
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      if (editingTask) {
        setTitle(editingTask.title);
        setDescription(editingTask.description || "");
        setPriority(editingTask.priority);
        setCategory(editingTask.category || "");
        setRecurrence(editingTask.recurrence || "none");
        setDueDate(
          editingTask.dueDate
            ? toLocalInput(new Date(editingTask.dueDate))
            : ""
        );
      } else {
        setTitle("");
        setDescription("");
        setPriority("medium");
        setCategory("");
        setDueDate("");
        setRecurrence("none");
      }
      setErrors({});
    }
  }, [open, editingTask]);

  // Escape closes modal; lock body scroll while open
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !submitting) {
        e.preventDefault();
        onClose();
      }
    },
    [onClose, submitting]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  function validate(): boolean {
    const e: FormErrors = {};
    const t = title.trim();
    if (t.length < 2) e.title = "Title must be at least 2 characters";
    else if (t.length > 120) e.title = "Title is too long (max 120)";
    if (description.length > 600)
      e.description = "Description too long (max 600)";
    if (dueDate) {
      const d = new Date(dueDate);
      if (Number.isNaN(d.getTime())) e.dueDate = "Invalid due date";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function quickDate(offset: number, hour = 9, minute = 0) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    d.setHours(hour, minute, 0, 0);
    setDueDate(toLocalInput(d));
    if (errors.dueDate) setErrors((prev) => ({ ...prev, dueDate: undefined }));
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        priority,
        category: category.trim(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        recurrence,
      };
      const url = editingTask
        ? `/api/tasks/${editingTask.id}`
        : "/api/tasks";
      const method = editingTask ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save task");
      }
      toast({
        title: editingTask ? "Task updated" : "Task created",
        description: editingTask
          ? `"${title.trim()}" has been saved.`
          : `"${title.trim()}" was added to your desk.`,
      });
      onSaved();
      onClose();
    } catch (e) {
      toast({
        title: "Could not save task",
        description: e instanceof Error ? e.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={editingTask ? "Edit task" : "Create task"}
      className="modal-backdrop"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,18,15,0.55)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 50,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div
        className="paper-pop"
        style={{
          width: "100%",
          maxWidth: "580px",
          maxHeight: "92vh",
          overflowY: "auto",
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="card"
          style={{
            padding: 0,
            margin: 0,
            background: "#fffdf7",
            border: "3px solid #41403e",
            boxShadow: "6px 6px 0 rgba(0,0,0,0.18)",
          }}
        >
          {/* Header bar */}
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
                fontSize: "1.5rem",
                margin: 0,
                color: "#1a1a1a",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                aria-hidden
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "28px",
                  height: "28px",
                  border: "2px solid #41403e",
                  background: "#fffdf7",
                  transform: "rotate(-3deg)",
                  fontSize: "1rem",
                }}
              >
                {editingTask ? "✎" : "+"}
              </span>
              {editingTask ? "Edit Task" : "New Task"}
            </h3>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close"
              style={{
                background: "transparent",
                border: "none",
                cursor: submitting ? "not-allowed" : "pointer",
                padding: "0.3rem",
                color: "#868e96",
                display: "flex",
                alignItems: "center",
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: "1.25rem" }}>
            <div className="form-group">
              <label
                htmlFor="tf-title"
                style={{
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "0.95rem",
                }}
              >
                Title <span style={{ color: "#a7342d" }}>*</span>
              </label>
              <input
                id="tf-title"
                type="text"
                placeholder="e.g. Submit Calculus Problem Set 5"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title)
                    setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                maxLength={120}
                autoFocus
                style={{ fontSize: "1rem" }}
              />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  minHeight: "1.1rem",
                }}
              >
                {errors.title ? (
                  <small
                    style={{
                      color: "#a7342d",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem",
                    }}
                  >
                    <AlertCircle size={12} /> {errors.title}
                  </small>
                ) : (
                  <small style={{ color: "#868e96" }}>
                    What needs to get done?
                  </small>
                )}
                <small style={{ color: "#c1bdb4" }}>
                  {title.length}/120
                </small>
              </div>
            </div>

            <div className="form-group">
              <label
                htmlFor="tf-desc"
                style={{
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "0.95rem",
                }}
              >
                Description
              </label>
              <textarea
                id="tf-desc"
                placeholder="Optional notes, instructions, links..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                maxLength={600}
                style={{ resize: "vertical", fontSize: "0.95rem" }}
              />
              {errors.description && (
                <small style={{ color: "#a7342d" }}>{errors.description}</small>
              )}
              <small
                style={{
                  display: "block",
                  color: "#c1bdb4",
                  textAlign: "right",
                }}
              >
                {description.length}/600
              </small>
            </div>

            {/* Priority - visual segmented control */}
            <div className="form-group">
              <label
                style={{
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "0.95rem",
                  display: "block",
                  marginBottom: "0.4rem",
                }}
              >
                Priority
              </label>
              <div
                role="group"
                aria-label="Choose priority"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "0.5rem",
                }}
              >
                {PRIORITY.map((p) => {
                  const meta = PRIORITY_META[p];
                  const active = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      aria-pressed={active}
                      style={{
                        padding: "0.55rem 0.5rem",
                        background: active ? meta.bg : "#fffdf7",
                        color: active ? meta.color : "#868e96",
                        border: `2px solid ${active ? meta.border : "#c1bdb4"}`,
                        cursor: "pointer",
                        fontFamily: "'Patrick Hand SC', cursive",
                        fontSize: "0.9rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.1rem",
                        boxShadow: active
                          ? `2px 2px 0 ${meta.border}40`
                          : "none",
                        transform: active ? "translate(-1px,-1px)" : "none",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <span style={{ fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                        {meta.emoji}
                      </span>
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="row">
              <div className="col sm-6">
                <div className="form-group">
                  <label
                    htmlFor="tf-cat"
                    style={{
                      fontFamily: "'Patrick Hand SC', cursive",
                      fontSize: "0.95rem",
                    }}
                  >
                    Category
                  </label>
                  <input
                    id="tf-cat"
                    type="text"
                    list="tf-cat-list"
                    placeholder="Homework, Exam..."
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                  <datalist id="tf-cat-list">
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
              <div className="col sm-6">
                <div className="form-group">
                  <label
                    htmlFor="tf-due"
                    style={{
                      fontFamily: "'Patrick Hand SC', cursive",
                      fontSize: "0.95rem",
                    }}
                  >
                    Due Date
                  </label>
                  <input
                    id="tf-due"
                    type="datetime-local"
                    value={dueDate}
                    onChange={(e) => {
                      setDueDate(e.target.value);
                      if (errors.dueDate)
                        setErrors((prev) => ({ ...prev, dueDate: undefined }));
                    }}
                  />
                  {errors.dueDate && (
                    <small style={{ color: "#a7342d" }}>{errors.dueDate}</small>
                  )}
                </div>
              </div>
            </div>

            {/* Quick date chips */}
            <div
              style={{
                display: "flex",
                gap: "0.4rem",
                flexWrap: "wrap",
                marginTop: "-0.25rem",
                marginBottom: "1rem",
              }}
            >
              {[
                { label: "Today", offset: 0, hour: 17 },
                { label: "Tomorrow", offset: 1, hour: 9 },
                { label: "In 3 days", offset: 3, hour: 9 },
                { label: "Next week", offset: 7, hour: 9 },
              ].map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => quickDate(q.offset, q.hour, 0)}
                  style={{
                    padding: "0.25rem 0.6rem",
                    background: "#f4f1ea",
                    color: "#41403e",
                    border: "1px dashed #868e96",
                    cursor: "pointer",
                    fontFamily: "'Neucha', cursive",
                    fontSize: "0.8rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <CalendarPlus size={11} /> {q.label}
                </button>
              ))}
              {dueDate && (
                <button
                  type="button"
                  onClick={() => setDueDate("")}
                  style={{
                    padding: "0.25rem 0.6rem",
                    background: "transparent",
                    color: "#a7342d",
                    border: "1px dashed #a7342d",
                    cursor: "pointer",
                    fontFamily: "'Neucha', cursive",
                    fontSize: "0.8rem",
                  }}
                >
                  Clear date
                </button>
              )}
            </div>

            {/* Recurrence picker */}
            <div className="form-group" style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginBottom: "0.4rem",
                }}
              >
                <Repeat size={15} /> Repeat
                {recurrence !== "none" && (
                  <small
                    style={{
                      fontFamily: "'Neucha', cursive",
                      fontSize: "0.78rem",
                      color: "#868e96",
                      fontWeight: 400,
                    }}
                  >
                    {RECURRENCE_META[recurrence].hint}
                    {dueDate
                      ? " · next due auto-advances on completion"
                      : " · set a due date to enable"}
                  </small>
                )}
              </label>
              <div
                role="group"
                aria-label="Recurrence"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.4rem",
                }}
              >
                {RECURRENCE.map((r) => {
                  const meta = RECURRENCE_META[r];
                  const active = recurrence === r;
                  const disabled = r !== "none" && !dueDate;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => !disabled && setRecurrence(r)}
                      disabled={disabled}
                      aria-pressed={active}
                      title={disabled ? "Set a due date first" : meta.hint}
                      style={{
                        padding: "0.45rem 0.3rem",
                        background: active
                          ? "#eef4fc"
                          : disabled
                            ? "#f4f1ea"
                            : "#fffdf7",
                        color: active
                          ? "#0b74d5"
                          : disabled
                            ? "#c1bdb4"
                            : "#41403e",
                        border: `2px solid ${
                          active ? "#0b74d5" : disabled ? "#e9e6dd" : "#c1bdb4"
                        }`,
                        cursor: disabled ? "not-allowed" : "pointer",
                        fontFamily: "'Patrick Hand SC', cursive",
                        fontSize: "0.82rem",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "0.1rem",
                        boxShadow: active ? "2px 2px 0 #0b74d540" : "none",
                        transform: active ? "translate(-1px,-1px)" : "none",
                        transition: "all 0.15s ease",
                        opacity: disabled ? 0.6 : 1,
                      }}
                    >
                      <span style={{ fontSize: "0.85rem" }}>{meta.emoji}</span>
                      {meta.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer actions */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "0.5rem",
                flexWrap: "wrap",
                paddingTop: "0.85rem",
                borderTop: "2px dashed #c1bdb4",
              }}
            >
              <small
                style={{
                  color: "#868e96",
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.8rem",
                }}
              >
                <kbd
                  style={{
                    background: "#f4f1ea",
                    border: "1px solid #868e96",
                    padding: "0 0.3rem",
                    fontSize: "0.75rem",
                    borderRadius: 0,
                  }}
                >
                  Esc
                </kbd>{" "}
                to close
              </small>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={submitting}
                  style={{
                    fontFamily: "'Patrick Hand SC', cursive",
                    fontSize: "0.95rem",
                    padding: "0.45rem 1rem",
                    background: "transparent",
                    color: "#41403e",
                    border: "2px solid #41403e",
                    cursor: submitting ? "not-allowed" : "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    fontFamily: "'Patrick Hand SC', cursive",
                    fontSize: "0.95rem",
                    padding: "0.45rem 1.25rem",
                    background: "#41403e",
                    color: "#fffdf7",
                    border: "2px solid #41403e",
                    cursor: submitting ? "wait" : "pointer",
                    boxShadow: submitting ? "none" : "2px 2px 0 rgba(0,0,0,0.25)",
                    transform: submitting ? "none" : "none",
                  }}
                >
                  {submitting
                    ? "Saving..."
                    : editingTask
                      ? "Save Changes"
                      : "Add Task"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
