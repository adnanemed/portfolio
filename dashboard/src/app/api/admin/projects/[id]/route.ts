import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { projectPatchSchema } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET one project.
export async function GET(_req: Request, ctx: Ctx) {
  const { id } = ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const [row] = await db.select().from(projects).where(eq(projects.id, id));
  if (!row) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ project: row });
}

// PUT — partial update, merged over the existing row.
export async function PUT(req: Request, ctx: Ctx) {
  const { id } = ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "validation", fields: { body: "invalid JSON" } },
      { status: 400 },
    );
  }

  const parsed = projectPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const [existing] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, id));
  if (!existing) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const patch = parsed.data;

  // Featured slots: max 2 (app-level check per PLAN-v2 §2.5).
  if ((patch.featured ?? false) && !existing.featured) {
    const others = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.featured, true), ne(projects.id, id)));
    if (others.length >= 2) {
      return NextResponse.json(
        {
          error: "featured_limit",
          message:
            "Maximum 2 projets en vedette. Dé-featurez un projet d'abord.",
        },
        { status: 409 },
      );
    }
  }

  const [updated] = await db
    .update(projects)
    .set({
      slug: patch.slug ?? existing.slug,
      status: patch.status ?? existing.status,
      type: patch.type ?? existing.type,
      featured: patch.featured ?? existing.featured,
      orderIndex: patch.orderIndex ?? existing.orderIndex,
      nameFr: patch.nameFr ?? existing.nameFr,
      nameEn: patch.nameEn ?? existing.nameEn,
      sectorFr: patch.sectorFr ?? existing.sectorFr,
      sectorEn: patch.sectorEn ?? existing.sectorEn,
      summaryFr: patch.summaryFr ?? existing.summaryFr,
      summaryEn: patch.summaryEn ?? existing.summaryEn,
      problemFr: patch.problemFr ?? existing.problemFr,
      problemEn: patch.problemEn ?? existing.problemEn,
      solutionFr: patch.solutionFr ?? existing.solutionFr,
      solutionEn: patch.solutionEn ?? existing.solutionEn,
      featuresFr: patch.featuresFr ?? existing.featuresFr,
      featuresEn: patch.featuresEn ?? existing.featuresEn,
      tags: patch.tags ?? existing.tags,
      metrics: patch.metrics ?? existing.metrics,
      liveUrl: patch.liveUrl !== undefined ? patch.liveUrl : existing.liveUrl,
      iframeEmbeddable:
        patch.iframeEmbeddable ?? existing.iframeEmbeddable,
      fallbackScreenshots:
        patch.fallbackScreenshots ?? existing.fallbackScreenshots,
      architectureImage:
        patch.architectureImage !== undefined
          ? patch.architectureImage
          : existing.architectureImage,
      architectureCaptionFr:
        patch.architectureCaptionFr ?? existing.architectureCaptionFr,
      architectureCaptionEn:
        patch.architectureCaptionEn ?? existing.architectureCaptionEn,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();

  return NextResponse.json({ project: updated });
}

// DELETE one project.
export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const [deleted] = await db
    .delete(projects)
    .where(eq(projects.id, id))
    .returning({ id: projects.id });
  if (!deleted) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
