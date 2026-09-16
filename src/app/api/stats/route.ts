import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { TaskStats } from "@/lib/task-utils";

export const dynamic = "force-dynamic";

// GET /api/stats - dashboard statistics
export async function GET(_req: NextRequest) {
  try {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    const [
      total,
      pending,
      completed,
      overdue,
      dueToday,
      dueThisWeek,
      highPriority,
      priorityGroups,
      categoryGroups,
    ] = await Promise.all([
      db.task.count(),
      db.task.count({ where: { status: "pending" } }),
      db.task.count({ where: { status: "completed" } }),
      db.task.count({
        where: {
          status: "pending",
          dueDate: { lt: startOfToday },
        },
      }),
      db.task.count({
        where: {
          dueDate: { gte: startOfToday, lte: endOfToday },
        },
      }),
      db.task.count({
        where: {
          dueDate: { gte: startOfWeek, lte: endOfWeek },
          status: "pending",
        },
      }),
      db.task.count({
        where: { priority: "high", status: "pending" },
      }),
      db.task.groupBy({
        by: ["priority"],
        _count: { _all: true },
      }),
      db.task.groupBy({
        by: ["category"],
        _count: { _all: true },
      }),
    ]);

    const stats: TaskStats = {
      total,
      pending,
      completed,
      overdue,
      dueToday,
      dueThisWeek,
      highPriority,
      byPriority: priorityGroups.map((g) => ({
        priority: g.priority,
        count: g._count._all,
      })),
      byCategory: categoryGroups
        .filter((g) => g.category)
        .map((g) => ({ category: g.category as string, count: g._count._all })),
      completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    };

    return NextResponse.json({ stats });
  } catch (e) {
    console.error("GET /api/stats error", e);
    return NextResponse.json(
      { error: "Failed to compute stats", detail: String(e) },
      { status: 500 }
    );
  }
}
