/**
 * Idempotent seed: inserts the 6 projects from docs/content-drafts/*.json
 * as status="draft" with every metric confirmed=false, plus the
 * site_settings singleton (all socials null, notifyEmail from env).
 *
 * Run: pnpm --dir dashboard seed
 */
import "dotenv/config";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { projects, siteSettings, type NewProject } from "../src/db/schema";

type DraftMetric = {
  labelFr: string;
  labelEn: string;
  value: string;
  suffix?: string;
  confirmed?: boolean;
};

type Draft = {
  slug: string;
  nameFr: string;
  nameEn: string;
  sectorFr: string;
  sectorEn: string;
  type: string;
  featured?: boolean;
  summaryFr: string;
  summaryEn: string;
  problemFr: string;
  problemEn: string;
  solutionFr: string;
  solutionEn: string;
  featuresFr: { title: string; body: string }[];
  featuresEn: { title: string; body: string }[];
  tags: string[];
  metrics: DraftMetric[];
  liveUrl: string | null;
  iframeEmbeddable?: boolean;
  architectureImage: string | null;
  architectureCaptionFr: string | null;
  architectureCaptionEn: string | null;
  fallbackScreenshots: string[];
  orderIndex: number;
};

const DRAFTS_DIR = path.resolve(
  import.meta.dirname ?? ".",
  "../../docs/content-drafts",
);

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");
// prepare:false → required behind Neon pgBouncer.
const client = postgres(url, { prepare: false, max: 1 });
const db = drizzle(client);

function normalizeMetric(m: DraftMetric) {
  // Only the schema fields are stored; mining metadata (source, confidence)
  // stays in the drafts. Everything seeds as confirmed=false (locked rule n°7).
  return {
    labelFr: m.labelFr,
    labelEn: m.labelEn,
    value: m.value,
    suffix: m.suffix ?? "",
    confirmed: false,
  };
}

async function main() {
  const files = readdirSync(DRAFTS_DIR).filter((f) => f.endsWith(".json"));
  console.log(`Found ${files.length} content drafts in ${DRAFTS_DIR}`);

  const rows: NewProject[] = files.map((file) => {
    const d = JSON.parse(
      readFileSync(path.join(DRAFTS_DIR, file), "utf8"),
    ) as Draft;
    return {
      slug: d.slug,
      status: "draft" as const,
      type: d.type ?? "client",
      featured: d.featured ?? false,
      orderIndex: d.orderIndex ?? 0,
      nameFr: d.nameFr,
      nameEn: d.nameEn,
      sectorFr: d.sectorFr,
      sectorEn: d.sectorEn,
      summaryFr: d.summaryFr ?? "",
      summaryEn: d.summaryEn ?? "",
      problemFr: d.problemFr ?? "",
      problemEn: d.problemEn ?? "",
      solutionFr: d.solutionFr ?? "",
      solutionEn: d.solutionEn ?? "",
      featuresFr: d.featuresFr ?? [],
      featuresEn: d.featuresEn ?? [],
      tags: d.tags ?? [],
      metrics: (d.metrics ?? []).map(normalizeMetric),
      liveUrl: d.liveUrl ?? null,
      iframeEmbeddable: d.iframeEmbeddable ?? false,
      fallbackScreenshots: d.fallbackScreenshots ?? [],
      architectureImage: d.architectureImage ?? null,
      architectureCaptionFr: d.architectureCaptionFr ?? "",
      architectureCaptionEn: d.architectureCaptionEn ?? "",
    };
  });

  const inserted = await db
    .insert(projects)
    .values(rows)
    .onConflictDoNothing({ target: projects.slug })
    .returning({ slug: projects.slug });

  console.log(
    `Projects inserted: ${inserted.map((r) => r.slug).join(", ") || "none (already seeded)"}`,
  );

  await db
    .insert(siteSettings)
    .values({
      id: 1,
      whatsappNumber: null,
      instagramUrl: null,
      linkedinUrl: null,
      publicEmail: null,
      notifyEmail: process.env.CONTACT_EMAIL_TO || null,
    })
    .onConflictDoNothing({ target: siteSettings.id });

  console.log("site_settings singleton ready (socials null, notifyEmail set)");
  await client.end();
}

main().catch(async (err) => {
  console.error("Seed failed:", err);
  await client.end().catch(() => {});
  process.exit(1);
});
