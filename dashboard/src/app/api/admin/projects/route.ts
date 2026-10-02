import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import {
  projectInputSchema,
  projectRowFromInput,
} from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/projects — full list, drafts included, ordered.
export async function GET() {
  const rows = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.orderIndex), asc(projects.createdAt));
  return NextResponse.json({ projects: rows });
}

// POST /api/admin/projects — create.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "validation", fields: { body: "invalid JSON" } },
      { status: 400 },
    );
  }

  const parsed = projectInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const row = projectRowFromInput(parsed.data);
  try {
    const [created] = await db.insert(projects).values(row).returning();
    return NextResponse.json({ project: created }, { status: 201 });
  } catch (err) {
    const message = String(err);
    if (message.includes("unique") || message.includes("duplicate")) {
      return NextResponse.json(
        { error: "validation", fields: { slug: "already exists" } },
        { status: 409 },
      );
    }
    throw err;
  }
}
