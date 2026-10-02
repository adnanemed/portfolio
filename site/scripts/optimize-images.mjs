// One-off asset pipeline (P6):
//  - minify logo SVG -> public/logo-stacklab.svg
//  - screenshots PNG -> public/projects/<slug>/<name>.webp (q80, max 1600w, target <=300KB)
//  - architecture diagrams -> public/diagrams/<slug>.webp
//  - generate public/og-image.png (1200x630) from a typographic SVG
// Run: pnpm optimize-images  (idempotent)
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repo = path.resolve(root, "..");
const shotsDir = path.join(repo, "docs", "content-drafts", "assets", "screenshots");
const assetsDir = path.join(repo, "docs", "content-drafts", "assets");

const SHOT_MAP = {
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
const DIAGRAMS = ["saveur-charme", "lahyani", "auradrive"];

async function webp(inputPath, outPath, { maxWidth = 1600, targetBytes = 300 * 1024 } = {}) {
  const img = sharp(inputPath).rotate();
  const meta = await img.metadata();
  const width = Math.min(meta.width || maxWidth, maxWidth);
  let q = 80;
  let buf;
  for (;;) {
    buf = await img
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: q, effort: 4 })
      .toBuffer();
    if (buf.length <= targetBytes || q <= 55) break;
    q -= 10;
  }
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, buf);
  return { out: path.relative(root, outPath), bytes: buf.length, width, q };
}

async function main() {
  const results = [];

  // 1. Logo — the SVG is two embedded base64 PNGs wrapped in vector chrome.
  //    Re-encode the embedded rasters as palette PNGs (722KB -> ~257KB,
  //    pixel-verified <0.3% delta) and rewrite the data URIs.
  const logoIn = path.join(repo, "logo-stacklab.svg");
  const logoOut = path.join(root, "public", "logo-stacklab.svg");
  let logoSvg = await fs.readFile(logoIn, "utf8");
  let idx = 0;
  for (;;) {
    const i = logoSvg.indexOf("base64,", idx);
    if (i < 0) break;
    const j = logoSvg.indexOf('"', i);
    const buf = Buffer.from(logoSvg.slice(i + 7, j), "base64");
    const png = await sharp(buf)
      .png({ palette: true, quality: 90, colors: 256, compressionLevel: 9 })
      .toBuffer();
    const pb = png.toString("base64");
    logoSvg = logoSvg.slice(0, i) + "base64," + pb + logoSvg.slice(j);
    idx = i + 7 + pb.length;
  }
  await fs.mkdir(path.join(root, "public"), { recursive: true });
  await fs.writeFile(logoOut, logoSvg);
  console.log(`logo: ${(logoSvg.length / 1024).toFixed(0)} KB (from 722 KB)`);

  // 2. Screenshots
  for (const [slug, names] of Object.entries(SHOT_MAP)) {
    for (const name of names) {
      const r = await webp(
        path.join(shotsDir, `${name}.png`),
        path.join(root, "public", "projects", slug, `${name}.webp`)
      );
      results.push(r);
    }
  }

  // 3. Diagrams
  for (const slug of DIAGRAMS) {
    const r = await webp(
      path.join(assetsDir, `${slug}-architecture.png`),
      path.join(root, "public", "diagrams", `${slug}.webp`),
      { maxWidth: 1600 }
    );
    results.push(r);
  }

  // 4. OG image (1200x630) — typographic, no faces, no personal names
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <rect width="1200" height="630" fill="#0a0a0a"/>
    <rect x="0" y="598" width="1200" height="2" fill="#262626"/>
    <rect x="60" y="96" width="64" height="64" rx="14" fill="#f6f6f6"/>
    <text x="70" y="146" font-family="Segoe UI, Arial, sans-serif" font-size="46" font-weight="700" fill="#0a0a0a">S</text>
    <text x="150" y="140" font-family="Segoe UI, Arial, sans-serif" font-size="54" font-weight="700" fill="#f6f6f6" letter-spacing="-1">StackLab</text>
    <text x="152" y="180" font-family="Consolas, monospace" font-size="17" fill="#9a9a9a" letter-spacing="4">STUDIO DE DEVELOPPEMENT — CASABLANCA</text>
    <text x="60" y="330" font-family="Segoe UI, Arial, sans-serif" font-size="58" font-weight="700" fill="#f6f6f6">Sites web qui attirent vos clients,</text>
    <text x="60" y="400" font-family="Segoe UI, Arial, sans-serif" font-size="58" font-weight="700" fill="#f6f6f6">tableaux de bord qui gerent votre activite.</text>
    <text x="60" y="478" font-family="Georgia, serif" font-style="italic" font-size="34" fill="#9a9a9a">La demo d'abord, le projet ensuite.</text>
    <text x="60" y="566" font-family="Consolas, monospace" font-size="16" fill="#9a9a9a" letter-spacing="2">6 PROJETS — 5 SECTEURS — 2 PRODUITS PROPRES — FR/EN</text>
  </svg>`;
  const ogBuf = await sharp(Buffer.from(ogSvg)).png({ compressionLevel: 9 }).toBuffer();
  await fs.writeFile(path.join(root, "public", "og-image.png"), ogBuf);
  results.push({ out: "public/og-image.png", bytes: ogBuf.length });

  for (const r of results) {
    console.log(`${r.out}  ${(r.bytes / 1024).toFixed(0)} KB${r.q ? ` (q${r.q}, ${r.width}w)` : ""}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
