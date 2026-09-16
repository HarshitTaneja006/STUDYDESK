import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

export const dynamic = "force-dynamic";

// POST /api/tasks/bulk - bulk update status or delete
// body: { ids: string[], action: "complete" | "pending" | "delete" }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const schema = z.object({
      ids: z.array(z.string().min(1)).min(1, "At least one id required").max(200, "Max 200 ids per batch"),
      action: z.enum(["complete", "pending", "delete"]),
    });
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const { ids, action } = parsed.data;

    if (action === "delete") {
      const r = await db.task.deleteMany({ where: { id: { in: ids } } });
      return NextResponse.json({ action, deleted: r.count, ids });
    }

    const newStatus = action === "complete" ? "completed" : "pending";
    const r = await db.task.updateMany({
      where: { id: { in: ids } },
      data: { status: newStatus },
    });
    return NextResponse.json({ action, updated: r.count, ids });
  } catch (e) {
    console.error("POST /api/tasks/bulk error", e);
    return NextResponse.json({ error: "Bulk action failed" }, { status: 500 });
  }
}
