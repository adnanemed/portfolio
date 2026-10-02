/**
 * Zod validation schemas + publish-completeness checklist (PLAN-v2 §2.5).
 */
import { z } from "zod";
import type { NewProject, Project } from "@/db/schema";

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(200),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(4000),
  locale: z.enum(["fr", "en"]).default("fr"),
  website: z.string().max(0).optional(), // honeypot — must be empty/absent
  // startedAt upper bound is checked against request time in the route
  // (a zod .max(Date.now()) would freeze at module-load).
  startedAt: z.number().int().nonnegative(),
});

export type ContactInput = z.infer<typeof contactSchema>;

const metricSchema = z.object({
  labelFr: z.string().min(1).max(200),
  labelEn: z.string().min(1).max(200),
  value: z.string().min(1).max(100),
  suffix: z.string().max(20).optional(),
  confirmed: z.boolean(),
});

const featureSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
});

export const projectInputSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "slug must be lowercase kebab-case"),
  status: z.enum(["draft", "published"]).optional(),
  type: z.enum(["client", "demo", "own"]).optional(),
  featured: z.boolean().optional(),
  orderIndex: z.number().int().min(0).max(9999).optional(),

  nameFr: z.string().trim().min(1).max(200),
  nameEn: z.string().trim().min(1).max(200),
  sectorFr: z.string().trim().min(1).max(200),
  sectorEn: z.string().trim().min(1).max(200),
  summaryFr: z.string().max(2000).optional(),
  summaryEn: z.string().max(2000).optional(),
  problemFr: z.string().max(4000).optional(),
  problemEn: z.string().max(4000).optional(),
  solutionFr: z.string().max(4000).optional(),
  solutionEn: z.string().max(4000).optional(),

  featuresFr: z.array(featureSchema).max(20).optional(),
  featuresEn: z.array(featureSchema).max(20).optional(),
  tags: z.array(z.string().trim().min(1).max(50)).max(15).optional(),
  metrics: z.array(metricSchema).max(10).optional(),

  liveUrl: z.string().url().max(500).nullable().optional(),
  iframeEmbeddable: z.boolean().optional(),
  fallbackScreenshots: z.array(z.string().url().max(500)).max(10).optional(),
  architectureImage: z.string().url().max(500).nullable().optional(),
  architectureCaptionFr: z.string().max(1000).optional(),
  architectureCaptionEn: z.string().max(1000).optional(),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

/** For PUT: same shape but every field optional (partial update). */
export const projectPatchSchema = projectInputSchema.partial();

/**
 * Publish checklist per PLAN-v2 §2.5: all content fields filled, ≥4 features,
 * ≥3 tags, ≥1 metric, liveUrl, and EVERY metric confirmed.
 */
export function publishMissing(project: Project): string[] {
  const missing: string[] = [];
  const req = (
    label: string,
    value: string | null | undefined,
  ) => {
    if (!value || value.trim().length === 0) missing.push(label);
  };
  req("summaryFr", project.summaryFr);
  req("summaryEn", project.summaryEn);
  req("problemFr", project.problemFr);
  req("problemEn", project.problemEn);
  req("solutionFr", project.solutionFr);
  req("solutionEn", project.solutionEn);
  if (project.featuresFr.length < 4) missing.push("featuresFr (≥ 4)");
  if (project.featuresEn.length < 4) missing.push("featuresEn (≥ 4)");
  if (project.tags.length < 3) missing.push("tags (≥ 3)");
  if (project.metrics.length < 1) missing.push("metrics (≥ 1)");
  if (project.metrics.some((m) => !m.confirmed)) {
    missing.push("métriques non confirmées");
  }
  req("liveUrl", project.liveUrl);
  return missing;
}

/** Build a DB row from validated input (create). */
export function projectRowFromInput(input: ProjectInput): NewProject {
  return {
    slug: input.slug,
    status: input.status ?? "draft",
    type: input.type ?? "client",
    featured: input.featured ?? false,
    orderIndex: input.orderIndex ?? 0,
    nameFr: input.nameFr,
    nameEn: input.nameEn,
    sectorFr: input.sectorFr,
    sectorEn: input.sectorEn,
    summaryFr: input.summaryFr ?? "",
    summaryEn: input.summaryEn ?? "",
    problemFr: input.problemFr ?? "",
    problemEn: input.problemEn ?? "",
    solutionFr: input.solutionFr ?? "",
    solutionEn: input.solutionEn ?? "",
    featuresFr: input.featuresFr ?? [],
    featuresEn: input.featuresEn ?? [],
    tags: input.tags ?? [],
    metrics: input.metrics ?? [],
    liveUrl: input.liveUrl ?? null,
    iframeEmbeddable: input.iframeEmbeddable ?? false,
    fallbackScreenshots: input.fallbackScreenshots ?? [],
    architectureImage: input.architectureImage ?? null,
    architectureCaptionFr: input.architectureCaptionFr ?? "",
    architectureCaptionEn: input.architectureCaptionEn ?? "",
  };
}
