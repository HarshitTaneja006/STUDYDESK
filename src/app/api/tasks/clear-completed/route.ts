import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// DELETE /api/tasks/clear-completed - delete all completed tasks
export async function DELETE(_req: NextRequest) {
  try {
    const r = await db.task.deleteMany({ where: { status: "completed" } });
    return NextResponse.json({ deleted: r.count });
  } catch (e) {
    console.error("DELETE /api/tasks/clear-completed error", e);
    return NextResponse.json({ error: "Failed to clear completed tasks" }, { status: 500 });
  }
}
