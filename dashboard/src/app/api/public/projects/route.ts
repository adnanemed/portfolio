import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { corsHeaders, preflightResponse } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL = "s-maxage=300, stale-while-revalidate=86400";

export function OPTIONS(req: Request) {
  return preflightResponse(req);
}

// GET /api/public/projects — published (or all) orderIndex asc, edge-cached.
export async function GET(req: Request) {
  let rows = await db
    .select()
    .from(projects)
    .where(eq(projects.status, "published"))
    .orderBy(asc(projects.orderIndex));

  if (!rows || rows.length === 0) {
    rows = await db
      .select()
      .from(projects)
      .orderBy(asc(projects.orderIndex));
  }

  const body = {
    projects: rows.map((p) => ({
      slug: p.slug,
      nameFr: p.nameFr,
      nameEn: p.nameEn,
      sectorFr: p.sectorFr,
      sectorEn: p.sectorEn,
      type: p.type as "client" | "demo" | "own",
      featured: p.featured,
      summaryFr: p.summaryFr,
      summaryEn: p.summaryEn,
      problemFr: p.problemFr,
      problemEn: p.problemEn,
      solutionFr: p.solutionFr,
      solutionEn: p.solutionEn,
      featuresFr: p.featuresFr,
      featuresEn: p.featuresEn,
      tags: p.tags,
      metrics: (p.metrics || []).map((m) => ({
        labelFr: m.labelFr,
        labelEn: m.labelEn,
        value: m.value,
        suffix: m.suffix ?? "",
      })),
      liveUrl: p.liveUrl,
      iframeEmbeddable: p.iframeEmbeddable,
      fallbackScreenshots: p.fallbackScreenshots || [],
      architectureImage: p.architectureImage,
      architectureCaptionFr: p.architectureCaptionFr,
      architectureCaptionEn: p.architectureCaptionEn,
      orderIndex: p.orderIndex,
    })),
  };

  return NextResponse.json(body, {
    headers: {
      "Cache-Control": CACHE_CONTROL,
      ...corsHeaders(req),
    },
  });
}
