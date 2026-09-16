import { z } from "zod";

export const PRIORITY = ["low", "medium", "high"] as const;
export const STATUS = ["pending", "completed"] as const;
export const RECURRENCE = ["none", "daily", "weekly", "monthly"] as const;
export const CATEGORIES = [
  "Homework",
  "Exam",
  "Project",
  "Personal",
  "Reading",
  "Other",
] as const;

export const taskCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title is too long (max 120 characters)"),
  description: z
    .string()
    .trim()
    .max(600, "Description is too long (max 600 characters)")
    .optional()
    .or(z.literal("")),
  priority: z.enum(PRIORITY).default("medium"),
  category: z.string().trim().max(40, "Category is too long").optional().or(z.literal("")),
  dueDate: z
    .string()
    .optional()
    .nullable()
    .refine(
      (v) => {
        if (v === undefined || v === null || v === "") return true;
        return !Number.isNaN(new Date(v).getTime());
      },
      { message: "Invalid due date" }
    ),
  recurrence: z.enum(RECURRENCE).optional(),
});

export const taskUpdateSchema = taskCreateSchema.partial().extend({
  status: z.enum(STATUS).optional(),
});

export const subtaskCreateSchema = z.object({
  title: z.string().trim().min(1, "Subtask title required").max(160, "Too long"),
});

export const subtaskUpdateSchema = z.object({
  title: z.string().trim().min(1).max(160).optional(),
  done: z.boolean().optional(),
});

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;

export type TaskPriority = (typeof PRIORITY)[number];
export type TaskStatus = (typeof STATUS)[number];
export type TaskRecurrence = (typeof RECURRENCE)[number];

export interface SubtaskResponse {
  id: string;
  title: string;
  done: boolean;
  taskId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: string | null;
  dueDate: string | null;
  recurrence: TaskRecurrence;
  createdAt: string;
  updatedAt: string;
  subtasks?: SubtaskResponse[];
  subtaskProgress?: { done: number; total: number };
}

export interface TaskStats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  highPriority: number;
  byPriority: { priority: string; count: number }[];
  byCategory: { category: string; count: number }[];
  completionRate: number;
}

export function toSubtaskResponse(s: {
  id: string;
  title: string;
  done: boolean;
  taskId: string;
  createdAt: Date;
  updatedAt: Date;
}): SubtaskResponse {
  return {
    id: s.id,
    title: s.title,
    done: s.done,
    taskId: s.taskId,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function toTaskResponse(t: {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  status: string;
  category: string | null;
  dueDate: Date | null;
  recurrence?: string;
  createdAt: Date;
  updatedAt: Date;
  subtasks?: Array<{
    id: string;
    title: string;
    done: boolean;
    taskId: string;
    createdAt: Date;
    updatedAt: Date;
  }>;
}): TaskResponse {
  const subtasks = t.subtasks
    ? t.subtasks.map(toSubtaskResponse).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    : [];
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority as TaskPriority,
    status: t.status as TaskStatus,
    category: t.category,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    recurrence: (t.recurrence as TaskRecurrence) || "none",
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    subtasks,
    subtaskProgress: {
      done: subtasks.filter((s) => s.done).length,
      total: subtasks.length,
    },
  };
}

// ---- Recurrence utilities ----

/** Advances a due date based on recurrence rule. Returns new date or null. */
export function advanceDueDate(
  dueDate: Date | null,
  recurrence: string
): Date | null {
  if (!dueDate || recurrence === "none") return null;
  const next = new Date(dueDate);
  switch (recurrence) {
    case "daily":
      next.setDate(next.getDate() + 1);
      break;
    case "weekly":
      next.setDate(next.getDate() + 7);
      break;
    case "monthly":
      next.setMonth(next.getMonth() + 1);
      break;
    default:
      return null;
  }
  return next;
}

// ---- CSV utilities ----

function csvEscape(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  const needsQuote = /[",\n\r]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return needsQuote ? `"${escaped}"` : escaped;
}

export function tasksToCSV(tasks: TaskResponse[]): string {
  const headers = [
    "id",
    "title",
    "description",
    "priority",
    "status",
    "category",
    "dueDate",
    "recurrence",
    "createdAt",
    "updatedAt",
  ];
  const lines = [headers.join(",")];
  for (const t of tasks) {
    const row = [
      t.id,
      t.title,
      t.description || "",
      t.priority,
      t.status,
      t.category || "",
      t.dueDate || "",
      t.recurrence || "none",
      t.createdAt,
      t.updatedAt,
    ];
    lines.push(row.map((v) => csvEscape(String(v))).join(","));
  }
  return lines.join("\n");
}

// Parse CSV respecting quoted fields. Returns array of row objects keyed by header.
export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let current: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        current.push(field);
        field = "";
      } else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        current.push(field);
        field = "";
        rows.push(current);
        current = [];
      } else {
        field += ch;
      }
    }
  }
  // last field
  if (field.length > 0 || current.length > 0) {
    current.push(field);
    rows.push(current);
  }
  // remove trailing empty rows
  const trimmed = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (trimmed.length === 0) return [];
  const header = trimmed[0];
  return trimmed.slice(1).map((r) => {
    const obj: Record<string, string> = {};
    header.forEach((h, idx) => {
      obj[h.trim()] = (r[idx] ?? "").trim();
    });
    return obj;
  });
}
