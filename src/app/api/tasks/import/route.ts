import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseCSV, PRIORITY, STATUS, RECURRENCE } from "@/lib/task-utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

const MAX_CSV_BYTES = 500_000;
const MAX_CSV_ROWS = 2000;

const importSchema = z.object({
  csv: z
    .string()
    .min(1, "CSV content required")
    .max(MAX_CSV_BYTES, "CSV too large (max 500KB)"),
  mode: z.enum(["merge", "replace"]).default("merge"),
});

// POST /api/tasks/import - import tasks from CSV
// body: { csv: string, mode: "merge" | "replace" }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = importSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const rows = parseCSV(parsed.data.csv);
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "No rows found in CSV (must include header + at least 1 row)" },
        { status: 400 }
      );
    }
    if (rows.length > MAX_CSV_ROWS) {
      return NextResponse.json(
        { error: `Too many rows (max ${MAX_CSV_ROWS})` },
        { status: 400 }
      );
    }

    // If replace mode: wipe existing tasks first
    if (parsed.data.mode === "replace") {
      await db.task.deleteMany({});
    }

    let imported = 0;
    let skipped = 0;
    const errors: { row: number; error: string }[] = [];

    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      const title = (r.title || "").trim();
      if (title.length < 2) {
        skipped++;
        errors.push({ row: i + 2, error: "Title too short" });
        continue;
      }
      const priority = PRIORITY.includes(r.priority as never)
        ? r.priority
        : "medium";
      const status = STATUS.includes(r.status as never) ? r.status : "pending";
      const recurrence = RECURRENCE.includes(r.recurrence as never)
        ? r.recurrence
        : "none";
      const category = (r.category || "").trim() || null;
      let dueDate: Date | null = null;
      if (r.dueDate) {
        const d = new Date(r.dueDate);
        if (!Number.isNaN(d.getTime())) dueDate = d;
      }
      try {
        await db.task.create({
          data: {
            title: title.slice(0, 120),
            description: (r.description || "").trim().slice(0, 600) || null,
            priority,
            status,
            category: category ? category.slice(0, 40) : null,
            dueDate,
            recurrence,
          },
        });
        imported++;
      } catch (e) {
        skipped++;
        errors.push({
          row: i + 2,
          error: e instanceof Error ? e.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      imported,
      skipped,
      total: rows.length,
      errors: errors.slice(0, 20),
    });
  } catch (e) {
    console.error("POST /api/tasks/import error", e);
    return NextResponse.json({ error: "Failed to import tasks" }, { status: 500 });
  }
}
