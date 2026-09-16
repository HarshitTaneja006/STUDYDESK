import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { tasksToCSV, toTaskResponse } from "@/lib/task-utils";

export const dynamic = "force-dynamic";

// GET /api/tasks/export - download all tasks as CSV
export async function GET() {
  try {
    const tasks = await db.task.findMany({
      orderBy: { createdAt: "desc" },
      include: { subtasks: true },
    });
    const csv = tasksToCSV(tasks.map(toTaskResponse));
    const dateStr = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="studydesk-tasks-${dateStr}.csv"`,
      },
    });
  } catch (e) {
    console.error("GET /api/tasks/export error", e);
    return NextResponse.json({ error: "Failed to export tasks" }, { status: 500 });
  }
}
