import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  PRIORITY,
  STATUS,
  taskCreateSchema,
  toTaskResponse,
} from "@/lib/task-utils";

export const dynamic = "force-dynamic";

function parseDueDate(value: unknown): Date | null {
  if (value === undefined || value === null || value === "") return null;
  const d = new Date(value as string);
  return Number.isNaN(d.getTime()) ? null : d;
}

// GET /api/tasks - list tasks with optional filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // pending | completed | all
    const priority = searchParams.get("priority"); // low | medium | high | all
    const category = searchParams.get("category"); // specific or all
    const search = searchParams.get("search"); // search title/description
    const sort = searchParams.get("sort") || "due"; // due | priority | created
    const dir = searchParams.get("dir") === "desc" ? "desc" : "asc"; // asc | desc
    const oppositeDir = dir === "asc" ? "desc" : "asc";

    const where: {
      status?: string;
      priority?: string;
      category?: string;
      OR?: Array<{ title?: { contains: string }; description?: { contains: string } }>;
    } = {};

    if (status && status !== "all") {
      if (!(STATUS as readonly string[]).includes(status)) {
        return NextResponse.json({ error: "Invalid status filter" }, { status: 400 });
      }
      where.status = status;
    }
    if (priority && priority !== "all") {
      if (!(PRIORITY as readonly string[]).includes(priority)) {
        return NextResponse.json({ error: "Invalid priority filter" }, { status: 400 });
      }
      where.priority = priority;
    }
    if (category && category !== "all" && category !== "") {
      if (category.length > 40) {
        return NextResponse.json({ error: "Invalid category filter" }, { status: 400 });
      }
      where.category = category;
    }
    if (search && search.trim()) {
      const q = search.trim().slice(0, 100);
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
      ];
    }

    // Primary + secondary order. For dueDate asc, nulls come last in SQLite by default.
    let primary: Record<string, "asc" | "desc"> = { createdAt: "desc" };
    let secondary: Record<string, "asc" | "desc"> = { createdAt: oppositeDir };
    if (sort === "due") {
      primary = { dueDate: dir };
      secondary = { createdAt: dir === "asc" ? "desc" : "asc" };
    } else if (sort === "priority") {
      // priority is text low/medium/high; asc -> high first when desc
      primary = { priority: dir };
      secondary = { createdAt: dir === "asc" ? "desc" : "asc" };
    } else if (sort === "created") {
      primary = { createdAt: dir };
      secondary = { updatedAt: dir };
    }

    const tasks = await db.task.findMany({
      where,
      orderBy: [primary, secondary],
      include: { subtasks: true },
    });

    // For due-date sorting, SQLite puts NULLs first when asc. Reorder so NULLs go last.
    if (sort === "due") {
      tasks.sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1; // a goes after
        if (!b.dueDate) return -1; // b goes after
        const cmp = a.dueDate.getTime() - b.dueDate.getTime();
        return dir === "asc" ? cmp : -cmp;
      });
    }

    return NextResponse.json({ tasks: tasks.map(toTaskResponse) });
  } catch (e) {
    console.error("GET /api/tasks error", e);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

// POST /api/tasks - create a task
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = taskCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { title, description, priority, category, dueDate, recurrence } = parsed.data;

    const due = parseDueDate(dueDate);
    if (dueDate && due === null) {
      return NextResponse.json({ error: "Invalid due date" }, { status: 400 });
    }

    const task = await db.task.create({
      data: {
        title,
        description: description || null,
        priority,
        category: category || null,
        dueDate: due,
        recurrence: recurrence || "none",
      },
      include: { subtasks: true },
    });

    return NextResponse.json({ task: toTaskResponse(task) }, { status: 201 });
  } catch (e) {
    console.error("POST /api/tasks error", e);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
