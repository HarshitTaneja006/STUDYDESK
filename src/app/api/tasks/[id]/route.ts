import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { taskUpdateSchema, toTaskResponse, advanceDueDate } from "@/lib/task-utils";

export const dynamic = "force-dynamic";

// GET /api/tasks/:id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const task = await db.task.findUnique({
      where: { id },
      include: { subtasks: true },
    });
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ task: toTaskResponse(task) });
  } catch (e) {
    console.error("GET /api/tasks/:id error", e);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

// PUT /api/tasks/:id - update a task
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = taskUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.description !== undefined)
      data.description = parsed.data.description || null;
    if (parsed.data.priority !== undefined) data.priority = parsed.data.priority;
    if (parsed.data.status !== undefined) data.status = parsed.data.status;
    if (parsed.data.category !== undefined)
      data.category = parsed.data.category || null;
    if (parsed.data.dueDate !== undefined) {
      if (!parsed.data.dueDate) {
        data.dueDate = null;
      } else {
        const d = new Date(parsed.data.dueDate);
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json({ error: "Invalid due date" }, { status: 400 });
        }
        data.dueDate = d;
      }
    }
    if (parsed.data.recurrence !== undefined)
      data.recurrence = parsed.data.recurrence;

    // Recurrence auto-advance: when marking a recurring task as completed,
    // instead set it back to pending with the next due date and reset subtasks.
    if (
      parsed.data.status === "completed" &&
      existing.status !== "completed" &&
      existing.recurrence &&
      existing.recurrence !== "none" &&
      existing.dueDate
    ) {
      const nextDue = advanceDueDate(existing.dueDate, existing.recurrence);
      if (nextDue) {
        data.status = "pending";
        data.dueDate = nextDue;
        // reset subtasks for the new cycle
        await db.subtask.updateMany({
          where: { taskId: id },
          data: { done: false },
        });
      }
    }

    const updated = await db.task.update({
      where: { id },
      data,
      include: { subtasks: true },
    });
    return NextResponse.json({
      task: toTaskResponse(updated),
      recurrenceAdvanced:
        data.status === "pending" &&
        parsed.data.status === "completed" &&
        !!existing.recurrence &&
        existing.recurrence !== "none",
    });
  } catch (e) {
    console.error("PUT /api/tasks/:id error", e);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks/:id - delete a task
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existing = await db.task.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    await db.task.delete({ where: { id } });
    return NextResponse.json({ success: true, id });
  } catch (e) {
    console.error("DELETE /api/tasks/:id error", e);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
