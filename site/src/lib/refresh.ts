// Runtime refresh (plan §1.1, hybrid data flow step 2):
//   - fetch GET {API}/api/public/projects and /api/public/site
//   - if fetched content differs from the build snapshot, update the DOM:
//       · case studies → update text containers for the current project
//       · everywhere → WhatsApp links + socials from site settings
//   - if the API is unreachable → keep the static build HTML (graceful).
// (v8: the home case-index rows were replaced by media rows rendered from
// content.json at build time — the API refresh now only covers case pages.)
import { hashJson } from "./hash";
import { caseStudyView, type FetchedProject } from "./refresh-views";

function apiBase(): string {
  return (import.meta.env.PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
}

function currentLocale(): "fr" | "en" {
  return document.documentElement.lang.startsWith("en") ? "en" : "fr";
}

/* ---------- socials / WhatsApp ---------- */

function waHref(number: string, text: string): string {
  return `https://wa.me/${number.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;
}

function applySocials(socials: Record<string, string | null>): void {
  const locale = currentLocale();

  // Primary CTAs marked data-contact-cta: rebuild href from wa text
  const waText =
    document.querySelector<HTMLElement>("[data-contact-cta]")?.getAttribute("data-wa-text") ?? "";
  document.querySelectorAll<HTMLAnchorElement>("[data-contact-cta]").forEach((a) => {
    if (socials.whatsapp) {
      a.href = waHref(socials.whatsapp, waText);
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    } else if (socials.email) {
      a.href = `mailto:${socials.email}?subject=${encodeURIComponent(waText)}`;
    }
  });

  // Footer socials — update existing links, create missing ones
  const socialsWrap = document.querySelector<HTMLElement>("[data-socials]");
  if (socialsWrap) {
    (["instagram", "linkedin", "whatsapp", "email"] as const).forEach((key) => {
      const val = socials[key];
      const existing = socialsWrap.querySelector<HTMLAnchorElement>(`[data-social="${key}"]`);
      if (!val) {
        if (existing) existing.remove();
        return;
      }
      const href =
        key === "email"
          ? `mailto:${val}`
          : key === "whatsapp"
            ? waHref(val, waText)
            : val;
      if (existing) {
        existing.href = href;
      } else {
        const a = document.createElement("a");
        a.href = href;
        a.setAttribute("data-social", key);
        if (href.startsWith("http")) {
          a.target = "_blank";
          a.rel = "noopener noreferrer";
        }
        if (key === "email") a.setAttribute("data-public-email", "");
        a.textContent = key.charAt(0).toUpperCase() + key.slice(1) + " ↗";
        socialsWrap.appendChild(a);
      }
    });
  }

  // Floating WhatsApp button — create if it appears later
  if (socials.whatsapp && !document.querySelector("[data-wa-float]")) {
    const a = document.createElement("a");
    a.className = "wa-float show";
    a.href = waHref(socials.whatsapp, locale === "fr" ? "Bonjour StackLab, je veux discuter d'un projet." : "Hello StackLab, I'd like to discuss a project.");
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.setAttribute("data-wa-float", "");
    a.textContent = locale === "fr" ? "Discuter sur WhatsApp" : "Chat on WhatsApp";
    document.body.appendChild(a);
  }
}

/* ---------- case study DOM updates ---------- */

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function updateCaseStudy(p: FetchedProject, locale: "fr" | "en"): void {
  const pick = (fr: unknown, en: unknown) => String((locale === "fr" ? fr : en) ?? "");
  const set = (key: string, value: string) => {
    document.querySelectorAll<HTMLElement>(`[data-cs="${key}"]`).forEach((el) => {
      el.textContent = value;
    });
  };

  set("name", pick(p.nameFr, p.nameEn));
  set("sector", pick(p.sectorFr, p.sectorEn));
  set("summary", pick(p.summaryFr, p.summaryEn));
  set("problem", pick(p.problemFr, p.problemEn));
  set("solution", pick(p.solutionFr, p.solutionEn));
  set("arch-caption", pick(p.architectureCaptionFr, p.architectureCaptionEn));

  const metrics = Array.isArray(p.metrics) ? (p.metrics as { labelFr: string; labelEn: string; value: string; suffix?: string }[]) : [];
  const first = metrics[0];
  if (first) {
    set("metric-value", first.value + (first.suffix ?? ""));
    set("metric-label", locale === "fr" ? first.labelFr : first.labelEn);
  }
  const metricsWrap = document.querySelector<HTMLElement>('[data-cs="metrics"]');
  if (metricsWrap && metrics.length) {
    metricsWrap.innerHTML = metrics
      .map(
        (m) =>
          `<div><div class="v">${esc(m.value)}${esc(m.suffix ?? "")}</div><div class="l">${esc(locale === "fr" ? m.labelFr : m.labelEn)}</div></div>`
      )
      .join("");
  }

  const features = Array.isArray(p.featuresFr) || Array.isArray(p.featuresEn)
    ? ((locale === "fr" ? p.featuresFr : p.featuresEn) as { title: string; body: string }[])
    : [];
  const featuresWrap = document.querySelector<HTMLElement>('[data-cs="features"]');
  if (featuresWrap && Array.isArray(features) && features.length) {
    featuresWrap.innerHTML = features
      .map(
        (f) =>
          `<div class="feat-row"><span class="ft">${esc(f.title)}</span><span class="fd">${esc(f.body)}</span></div>`
      )
      .join("");
  }

  // Meta badges (Démo / Produit propre)
  const badge = document.querySelector<HTMLElement>('[data-cs="type-badge"]');
  if (badge && typeof p.type === "string") {
    if (p.type === "demo" || p.type === "own") {
      badge.textContent = locale === "fr" ? (p.type === "demo" ? "Démo" : "Produit propre") : p.type === "demo" ? "Demo" : "Own product";
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }
}

/* ---------- main ---------- */

export function initRefresh(): void {
  const base = apiBase();
  if (!base) return;
  const locale = currentLocale();

  Promise.allSettled([
    fetch(base + "/api/public/projects").then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    fetch(base + "/api/public/site").then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
  ]).then(([projRes, siteRes]) => {
    try {
      if (projRes.status === "fulfilled" && Array.isArray(projRes.value?.projects)) {
        const fetched = projRes.value.projects as FetchedProject[];

        // Case-study page: single project diff
        const csRoot = document.querySelector<HTMLElement>("[data-cs-hash]");
        if (csRoot) {
          const slug = csRoot.getAttribute("data-cs-hash")?.split(":")[0];
          const snapshotHash = csRoot.getAttribute("data-cs-hash")?.split(":")[1];
          const mine = fetched.find((p) => p.slug === slug);
          if (mine && snapshotHash && hashJson(caseStudyView(mine)) !== snapshotHash) {
            updateCaseStudy(mine, locale);
          }
        }
      }

      if (siteRes.status === "fulfilled" && siteRes.value?.socials) {
        applySocials(siteRes.value.socials as Record<string, string | null>);
      }
    } catch {
      /* never break the static page */
    }
  });
}
