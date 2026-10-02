import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, siteSettings } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/export — content.json snapshot for the Astro site build.
 * Shape consumed by site/src/content/content.json (PLAN-v2 §1.1 flux 1).
 * Only published projects, orderIndex asc.
 */
export async function GET() {
  const rows = await db
    .select()
    .from(projects)
    .where(eq(projects.status, "published"))
    .orderBy(asc(projects.orderIndex));

  const [settings] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));

  const snapshot = {
    generatedAt: new Date().toISOString(),
    site: {
      socials: {
        whatsapp: settings?.whatsappNumber ?? null,
        instagram: settings?.instagramUrl ?? null,
        linkedin: settings?.linkedinUrl ?? null,
        email: settings?.publicEmail ?? null,
      },
    },
    projects: rows.map((p) => ({
      slug: p.slug,
      type: p.type,
      featured: p.featured,
      orderIndex: p.orderIndex,
      nameFr: p.nameFr,
      nameEn: p.nameEn,
      sectorFr: p.sectorFr,
      sectorEn: p.sectorEn,
      summaryFr: p.summaryFr,
      summaryEn: p.summaryEn,
      problemFr: p.problemFr,
      problemEn: p.problemEn,
      solutionFr: p.solutionFr,
      solutionEn: p.solutionEn,
      featuresFr: p.featuresFr,
      featuresEn: p.featuresEn,
      tags: p.tags,
      metrics: p.metrics.map((m) => ({
        labelFr: m.labelFr,
        labelEn: m.labelEn,
        value: m.value,
        suffix: m.suffix ?? "",
      })),
      liveUrl: p.liveUrl,
      iframeEmbeddable: p.iframeEmbeddable,
      fallbackScreenshots: p.fallbackScreenshots,
      architectureImage: p.architectureImage,
      architectureCaptionFr: p.architectureCaptionFr,
      architectureCaptionEn: p.architectureCaptionEn,
      publishedAt: p.publishedAt?.toISOString() ?? null,
    })),
  };

  return new NextResponse(JSON.stringify(snapshot, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="content.json"',
      "Cache-Control": "no-store",
    },
  });
}
