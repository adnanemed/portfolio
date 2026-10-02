// Build/verify helper: check every local asset referenced by the built
// HTML in dist/ exists in dist/ (catches broken image/logo/og links).
// Run: pnpm check-assets
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const RE = /(?:src|href)="(\/[^"#?]+?\.(?:webp|png|svg|jpg|jpeg|ico|xml|txt))"/g;

async function* walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}

let htmlCount = 0;
const refs = new Set();
for await (const file of walk(dist)) {
  if (!/\.(html|xml|txt)$/.test(file)) continue;
  htmlCount += /\.html$/.test(file) ? 1 : 0;
  const content = await fs.readFile(file, "utf8");
  for (const m of content.matchAll(RE)) refs.add(m[1]);
}

let missing = 0;
for (const ref of [...refs].sort()) {
  const target = path.join(dist, decodeURIComponent(ref));
  const ok = await fs
    .access(target)
    .then(() => true)
    .catch(() => false);
  if (!ok) {
    console.log("MISSING:", ref);
    missing++;
  }
}

// assets in dist not referenced by any HTML (informational)
const assetFiles = [];
for await (const file of walk(path.join(dist))) {
  if (/\.(webp|png|svg|jpg|jpeg|ico)$/.test(file)) {
    assetFiles.push("/" + path.relative(dist, file).replace(/\\/g, "/"));
  }
}
const unreferenced = assetFiles.filter((a) => !refs.has(a));

console.log(`html pages: ${htmlCount}, asset refs: ${refs.size}, missing: ${missing}`);
if (unreferenced.length) {
  console.log("not referenced in HTML (ok if intentional):");
  unreferenced.forEach((u) => console.log("  -", u));
}
process.exit(missing ? 1 : 0);
