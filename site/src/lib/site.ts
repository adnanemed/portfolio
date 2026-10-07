// Site-wide constants + content access (build-time snapshot).
import content from "@/content/content.json";

export type ProjectMetric = { labelFr: string; labelEn: string; value: string; suffix: string };
export type ProjectFeature = { title: string; body: string };
/** Case-study "how it works" flow map (section 06). */
export type FlowStep = {
  titleFr: string;
  titleEn: string;
  bodyFr: string;
  bodyEn: string;
  tech?: string;
};
export type FlowPhase = { labelFr: string; labelEn: string; steps: FlowStep[] };
export type FlowDetailed = { phases: FlowPhase[] };
export type Project = {
  slug: string;
  nameFr: string;
  nameEn: string;
  sectorFr: string;
  sectorEn: string;
  type: "client" | "demo" | "own";
  featured: boolean;
  summaryFr: string;
  summaryEn: string;
  problemFr: string;
  problemEn: string;
  solutionFr: string;
  solutionEn: string;
  tags: string[];
  metrics: ProjectMetric[];
  /** v8 recolor: accent extracted from the project's own live site. */
  accent: string | null;
  liveUrl: string | null;
  liveUrlWithheld: boolean;
  iframeEmbeddable: boolean;
  architectureImage: string | null;
  architectureCaptionFr: string | null;
  architectureCaptionEn: string | null;
  fallbackScreenshots: string[];
  featuresFr: ProjectFeature[];
  featuresEn: ProjectFeature[];
  /** Home "flow map" (FIX 2) + live-demo navigator (FIX 3). */
  flowIntroFr?: string | null;
  flowIntroEn?: string | null;
  flowStepsFr?: string[];
  flowStepsEn?: string[];
  flowDetailed?: FlowDetailed | null;
  previewCaptionFr?: string | null;
  previewCaptionEn?: string | null;
  orderIndex: number;
};

export type Locale = "fr" | "en";
export const LOCALES: Locale[] = ["fr", "en"];

/** Public site URL (canonical/sitemap). Swap-friendly via env (plan R4). */
export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL || "https://stacklab-site.vercel.app").replace(/\/+$/, "");

/** Dashboard base URL — public endpoints only, no secrets on the site. */
export const API_BASE_URL = (
  import.meta.env.PUBLIC_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:3000" : "https://stacklab-admin.vercel.app")
).replace(/\/+$/, "");

/** Optional build-time WhatsApp fallback if the API is unreachable. */
export const WHATSAPP_FALLBACK = import.meta.env.PUBLIC_WHATSAPP_FALLBACK || "";

export const SOCIALS = content.socials as {
  whatsapp: string | null;
  instagram: string | null;
  linkedin: string | null;
  email: string | null;
};

export const projects: Project[] = content.projects as Project[];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function projectByLocale(p: Project, locale: Locale) {
  return {
    name: locale === "fr" ? p.nameFr : p.nameEn,
    sector: locale === "fr" ? p.sectorFr : p.sectorEn,
    summary: locale === "fr" ? p.summaryFr : p.summaryEn,
    problem: locale === "fr" ? p.problemFr : p.problemEn,
    solution: locale === "fr" ? p.solutionFr : p.solutionEn,
    features: locale === "fr" ? p.featuresFr : p.featuresEn,
    archCaption: locale === "fr" ? p.architectureCaptionFr : p.architectureCaptionEn,
  };
}

/** Locale-prefixed path: FR lives at root, EN under /en/ */
export function localePath(path: string, locale: Locale): string {
  return locale === "fr" ? path : `/en${path === "/" ? "/" : path}`;
}

/** Case-study URL for a project in a locale. */
export function projectPath(p: Project, locale: Locale): string {
  return locale === "fr" ? `/projets/${p.slug}/` : `/en/projects/${p.slug}/`;
}

/** WhatsApp deep link from an international number (digits only). */
export function waLink(number: string, text: string): string {
  const digits = number.replace(/[^\d]/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/** Primary contact href: WhatsApp → mailto → form anchor. */
export function primaryContactHref(text: string): { href: string; external: boolean } {
  const wa = SOCIALS.whatsapp || WHATSAPP_FALLBACK;
  if (wa) return { href: waLink(wa, text), external: true };
  if (SOCIALS.email) return { href: `mailto:${SOCIALS.email}?subject=${encodeURIComponent(text)}`, external: false };
  return { href: "#contact", external: false };
}
