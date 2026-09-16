import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subtaskCreateSchema, toSubtaskResponse } from "@/lib/task-utils";

export const dynamic = "force-dynamic";

// GET /api/tasks/:id/subtasks - list subtasks for a task
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await db.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    const subtasks = await db.subtask.findMany({
      where: { taskId: id },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ subtasks: subtasks.map(toSubtaskResponse) });
  } catch (e) {
    console.error("GET /api/tasks/:id/subtasks error", e);
    return NextResponse.json({ error: "Failed to fetch subtasks" }, { status: 500 });
  }
}

// POST /api/tasks/:id/subtasks - create a subtask
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = subtaskCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const task = await db.task.findUnique({ where: { id } });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    const sub = await db.subtask.create({
      data: { title: parsed.data.title, taskId: id },
    });
    return NextResponse.json({ subtask: toSubtaskResponse(sub) }, { status: 201 });
  } catch (e) {
    console.error("POST /api/tasks/:id/subtasks error", e);
    return NextResponse.json({ error: "Failed to create subtask" }, { status: 500 });
  }
}
