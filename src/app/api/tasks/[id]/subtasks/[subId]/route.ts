import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { subtaskUpdateSchema, toSubtaskResponse } from "@/lib/task-utils";

export const dynamic = "force-dynamic";

// PUT /api/tasks/:id/subtasks/:subId - update a subtask
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  try {
    const { id, subId } = await params;
    const body = await req.json();
    const parsed = subtaskUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const existing = await db.subtask.findUnique({
      where: { id: subId },
    });
    if (!existing || existing.taskId !== id) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }
    const data: Record<string, unknown> = {};
    if (parsed.data.title !== undefined) data.title = parsed.data.title;
    if (parsed.data.done !== undefined) data.done = parsed.data.done;
    const updated = await db.subtask.update({ where: { id: subId }, data });
    return NextResponse.json({ subtask: toSubtaskResponse(updated) });
  } catch (e) {
    console.error("PUT /api/tasks/:id/subtasks/:subId error", e);
    return NextResponse.json(
      { error: "Failed to update subtask", detail: String(e) },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/:id/subtasks/:subId - delete a subtask
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; subId: string }> }
) {
  try {
    const { id, subId } = await params;
    const existing = await db.subtask.findUnique({ where: { id: subId } });
    if (!existing || existing.taskId !== id) {
      return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
    }
    await db.subtask.delete({ where: { id: subId } });
    return NextResponse.json({ success: true, id: subId });
  } catch (e) {
    console.error("DELETE /api/tasks/:id/subtasks/:subId error", e);
    return NextResponse.json(
      { error: "Failed to delete subtask", detail: String(e) },
      { status: 500 }
    );
  }
}
