// Shared renderer for the home case index — used at build time (Astro
// component) and at runtime (refresh.ts re-render from the live API).
// Plain TS, no content.json import, so it can ship to the client.
import type { Locale, Project } from "./site";

export type CaseIndexStrings = {
  demoBadge: string;
  ownBadge: string;
  r1Note: string;
  studyLink: string;
};

const TAG_EN: Record<string, string> = {
  "Prise de RDV en ligne": "Online booking",
  "Tableau de bord": "Dashboard",
  "Tableau de bord temps réel": "Realtime dashboard",
  "Paiement/Contrats PDF": "Payments / PDF contracts",
  "Démo": "Demo",
  "Commande en ligne": "Online ordering",
  "Plan 2D interactif": "Interactive 2D floor plan",
  "Plats cuisinés": "Ready-to-eat meals",
  "Catalogue en ligne": "Online catalogue",
  "Recherche par référence": "Reference search",
  "Industrie": "Industry",
  "Maroc": "Morocco",
  "Extension navigateur": "Browser extension",
  "IA": "AI",
  "Produit": "Product",
  "E-commerce": "E-commerce",
};

function tagLabel(tag: string, locale: Locale): string {
  return locale === "en" ? (TAG_EN[tag] ?? tag) : tag;
}

function badgeFor(p: Project, s: CaseIndexStrings): string {
  if (p.type === "demo") return `<span class="demo-badge">${s.demoBadge}</span>`;
  if (p.type === "own") return `<span class="demo-badge">${s.ownBadge}</span>`;
  return "";
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function caseRowHtml(p: Project, i: number, locale: Locale, s: CaseIndexStrings): string {
  const n = String(i + 1).padStart(2, "0");
  const name = locale === "fr" ? p.nameFr : p.nameEn;
  const sector = locale === "fr" ? p.sectorFr : p.sectorEn;
  const tags = p.tags.map((t) => escapeHtml(tagLabel(t, locale))).join(" · ");
  const href = p.liveUrl ?? "#contact";
  const external = p.liveUrl ? ' target="_blank" rel="noopener noreferrer"' : "";
  const described = p.liveUrl ? "" : ' aria-describedby="r1-note"';
  return (
    `<a class="case sr in" data-case-row="${escapeHtml(p.slug)}" href="${href}"${external}${described}>` +
    `<span class="n">${n}</span>` +
    `<span><span class="name">${escapeHtml(name)}${badgeFor(p, s)}</span>` +
    `<div class="tags">${tags}</div></span>` +
    `<span class="sector">${escapeHtml(sector)}</span>` +
    `<span class="arrow" aria-hidden="true">↗</span>` +
    `</a>`
  );
}

export function caseIndexHtml(projects: Project[], locale: Locale, s: CaseIndexStrings): string {
  return (
    projects.map((p, i) => caseRowHtml(p, i, locale, s)).join("") +
    (projects.some((p) => p.liveUrlWithheld)
      ? `<p class="sr in" id="r1-note" style="margin-top: 1rem; font-family: var(--mono); font-size: .72rem; color: var(--muted);">${escapeHtml(s.r1Note)}</p>`
      : "")
  );
}
