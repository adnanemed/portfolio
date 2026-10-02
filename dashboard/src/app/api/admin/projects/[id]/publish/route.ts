import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { publishMissing } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

/**
 * POST /api/admin/projects/[id]/publish
 * Body: { "publish": boolean } (default true — publish).
 * Publish only when the completeness checklist passes, else
 * 422 { error: "incomplete", missing: [...] }.
 */
export async function POST(req: Request, ctx: Ctx) {
  const { id } = ctx.params;

  let publish = true;
  try {
    const body = (await req.json()) as { publish?: unknown };
    if (body && typeof body.publish === "boolean") publish = body.publish;
  } catch {
    // empty body = publish
  }

  const [row] = await db.select().from(projects).where(eq(projects.id, id));
  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  if (!publish) {
    const [updated] = await db
      .update(projects)
      .set({ status: "draft", publishedAt: null, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return NextResponse.json({ project: updated });
  }

  const missing = publishMissing(row);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "incomplete", missing },
      { status: 422 },
    );
  }

  const [updated] = await db
    .update(projects)
    .set({
      status: "published",
      publishedAt: row.publishedAt ?? new Date(),
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  return NextResponse.json({ project: updated });
}
