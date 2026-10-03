// Build-time content snapshot generator (P6).
// Reads docs/content-drafts/<slug>.json (owner-validated drafts) and maps
// them to the public API shape consumed by the site (plan §2.4, public fields
// only — no `confirmed`, no `source`, no `evidence`).
// Run: pnpm generate-content   → writes src/content/content.json
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = path.resolve(root, "..");
const draftsDir = path.join(repo, "docs", "content-drafts");

const SCREENSHOT_MAP = {
  lahyani: ["lahyani-hero", "lahyani-booking"],
  auradrive: ["auradrive-hero", "auradrive-catalog", "auradrive-admin"],
  kfresh: ["kfresh-hero", "kfresh-shop"],
  sigmaparts: ["sigmaparts-hero"],
  "saveur-charme": [
    "saveur-charme-hero",
    "saveur-charme-menu",
    "saveur-charme-admin",
    "saveur-charme-admin-menu",
  ],
  promptifyapp: ["promptifyapp-hero"],
};

const DIAGRAM_SLUGS = new Set(["saveur-charme", "lahyani", "auradrive"]);

// PromptifyApp live link is withheld (risk R1: client footer carries a
// personal handle — plan §6). The case-study shows screenshots + a private
// demo CTA until the owner flips this switch.
const LIVE_URL_WITHHELD = new Set(["promptifyapp"]);

function stripPrivate(metrics = []) {
  return metrics.map(({ labelFr, labelEn, value, suffix }) => ({
    labelFr,
    labelEn,
    value,
    suffix: suffix ?? "",
  }));
}

function localScreenshots(slug) {
  return (SCREENSHOT_MAP[slug] || []).map(
    (name) => `/projects/${slug}/${name}.webp`
  );
}

function localDiagram(slug) {
  return DIAGRAM_SLUGS.has(slug) ? `/diagrams/${slug}.webp` : null;
}

async function main() {
  const files = (await fs.readdir(draftsDir)).filter((f) => f.endsWith(".json"));
  const projects = [];
  for (const file of files) {
    const d = JSON.parse(await fs.readFile(path.join(draftsDir, file), "utf8"));
    const withheld = LIVE_URL_WITHHELD.has(d.slug);
    projects.push({
      slug: d.slug,
      nameFr: d.nameFr,
      nameEn: d.nameEn,
      sectorFr: d.sectorFr,
      sectorEn: d.sectorEn,
      type: d.type, // "client" | "demo" | "own"
      featured: Boolean(d.featured),
      summaryFr: d.summaryFr,
      summaryEn: d.summaryEn,
      problemFr: d.problemFr,
      problemEn: d.problemEn,
      solutionFr: d.solutionFr,
      solutionEn: d.solutionEn,
      tags: d.tags ?? [],
      metrics: stripPrivate(d.metrics),
      // R1: live URL withheld → null on the public surface
      liveUrl: withheld ? null : d.liveUrl,
      liveUrlWithheld: withheld,
      iframeEmbeddable: Boolean(d.iframeEmbeddable),
      architectureImage: localDiagram(d.slug),
      architectureCaptionFr: d.architectureCaptionFr ?? null,
      architectureCaptionEn: d.architectureCaptionEn ?? null,
      fallbackScreenshots: localScreenshots(d.slug),
      featuresFr: d.featuresFr ?? [],
      featuresEn: d.featuresEn ?? [],
      // Home "flow map" + live-demo navigator (FIX 2 / FIX 3)
      flowIntroFr: d.flowIntroFr ?? null,
      flowIntroEn: d.flowIntroEn ?? null,
      flowStepsFr: d.flowStepsFr ?? [],
      flowStepsEn: d.flowStepsEn ?? [],
      previewCaptionFr: d.previewCaptionFr ?? null,
      previewCaptionEn: d.previewCaptionEn ?? null,
      orderIndex: d.orderIndex ?? 99,
    });
  }
  projects.sort((a, b) => a.orderIndex - b.orderIndex);

  const content = {
    generatedAt: new Date().toISOString(),
    source: "docs/content-drafts (owner-validated via dashboard export)",
    socials: {
      whatsapp: null,
      instagram: null,
      linkedin: null,
      email: null,
    },
    projects,
  };

  const outPath = path.join(root, "src", "content", "content.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(content, null, 2) + "\n");
  console.log(
    `content.json: ${projects.length} projects → ${path.relative(root, outPath)}`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
