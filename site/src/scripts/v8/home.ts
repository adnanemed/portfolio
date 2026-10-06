// v8 — home orchestrator. Everything here is progressive enhancement:
// without it (reduced motion, no JS) every section stays fully visible and
// readable. Three.js is imported dynamically and only on tier-2 devices.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { detectTier } from "./tier";
import { initGallery, type GalleryData } from "./gallery";

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ---------- Lenis smooth scroll (wheel only — native touch scroll untouched) ---------- */
function initLenis(): void {
  void (async () => {
    try {
      const { default: Lenis } = await import("lenis");
      const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } catch {
      /* native scroll */
    }
  })();
}

/* ---------- Hero entrance ---------- */
function heroEntrance(): void {
  const items = document.querySelectorAll("[data-v8-hero]");
  if (!items.length) return;
  gsap.timeline({ delay: 0.15 }).to(items, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1 });
  const inner = document.querySelector(".hero3d__inner");
  if (inner) {
    gsap.to(inner, {
      yPercent: -10,
      autoAlpha: 0.25,
      ease: "none",
      scrollTrigger: { trigger: ".hero3d", start: "top top", end: "bottom top", scrub: true },
    });
  }
}

/* ---------- Generic reveals ---------- */
function initReveals(): void {
  const els = document.querySelectorAll(".v8-reveal");
  if (!els.length) return;
  ScrollTrigger.batch(els, {
    start: "top 86%",
    once: true,
    onEnter: (batch) =>
      gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.09, overwrite: true }),
  });
}

/* ---------- F2 — tilt 3D temps réel (lerp, zéro shift de layout) ---------- */
function initTilt(): void {
  if (reduced || !finePointer) return;
  document.querySelectorAll<HTMLElement>("[data-tilt]").forEach((card) => {
    const inner = card.querySelector<HTMLElement>(".v8tilt");
    if (!inner) return;
    let trx = 0, trY = 0, rx = 0, ry = 0, raf: number | null = null;
    const step = () => {
      rx += (trx - rx) * 0.12;
      ry += (trY - ry) * 0.12;
      inner.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      if (Math.abs(trx - rx) > 0.05 || Math.abs(trY - ry) > 0.05) raf = requestAnimationFrame(step);
      else {
        raf = null;
        inner.style.willChange = "auto";
      }
    };
    const kick = () => {
      if (!raf) {
        inner.style.willChange = "transform";
        raf = requestAnimationFrame(step);
      }
    };
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      trY = ((e.clientX - r.left) / r.width - 0.5) * 9;
      trx = -((e.clientY - r.top) / r.height - 0.5) * 7;
      kick();
    });
    card.addEventListener("pointerleave", () => {
      trx = 0;
      trY = 0;
      kick();
    });
  });
}

/* ---------- Séquences case studies (pin scrub desktop) ----------
   Utilisée par la home (historique) et par les pages /projets/[slug].
   Les phases peuvent avoir ou non des headlines mot-à-mot : les tweens
   ne sont créés que sur des cibles présentes. */
function buildCase(section: HTMLElement): void {
  const phases = [...section.querySelectorAll<HTMLElement>("[data-v8-phase]")];
  if (phases.length < 3) return;
  const kicker = section.querySelector<HTMLElement>(".v8case__kicker");
  gsap.set(phases.slice(1), { autoAlpha: 0 });
  const ir = { immediateRender: true };
  const words = (el: HTMLElement) => el.querySelectorAll(".v8case__headline .w");
  const items = (el: HTMLElement) => el.querySelectorAll("[data-v8-cs-item]");

  const tl = gsap.timeline({
    scrollTrigger: { trigger: section, start: "top 62%", end: "+=280%", scrub: 1, pin: true, anticipatePin: 1 },
  });

  if (kicker) tl.from(kicker, { autoAlpha: 0, y: 16, duration: 0.5, ...ir }, 0);

  const enter = (idx: number, position: string | number) => {
    const w = words(phases[idx]);
    if (w.length) {
      tl.from(w, { autoAlpha: 0, y: 36, stagger: 0.05, duration: 0.6, ...ir }, position);
      tl.from(items(phases[idx]), { autoAlpha: 0, y: 28, stagger: 0.12, duration: 0.6, ...ir }, "<0.15");
    } else {
      const it = items(phases[idx]);
      if (it.length) tl.from(it, { autoAlpha: 0, y: 28, stagger: 0.12, duration: 0.6, ...ir }, position);
    }
  };

  enter(0, 0.1);
  tl.to({}, { duration: 0.7 })
    .to(phases[0], { autoAlpha: 0, y: -36, duration: 0.55 })
    .to(phases[1], { autoAlpha: 1, duration: 0.25 }, "<0.2");
  enter(1, "<0.1");
  tl.to({}, { duration: 0.9 })
    .to(phases[1], { autoAlpha: 0, y: -36, duration: 0.55 })
    .to(phases[2], { autoAlpha: 1, duration: 0.25 }, "<0.2");
  enter(2, "<0.1");
  tl.to({}, { duration: 0.8 });
}

/* ---------- Conversation Forge (accent projet, effet typewriter) ---------- */
function initChat(): void {
  const panel = document.querySelector<HTMLElement>("[data-v8-chat-panel]");
  if (!panel) return;
  const steps = [...panel.querySelectorAll<HTMLElement>("[data-v8-chat]")];
  const rows = [...panel.querySelectorAll<HTMLElement>(".v8card__row")];
  const typed = panel.querySelector<HTMLElement>("[data-v8-typed]");
  if (reduced) return; // tout visible statiquement (CSS ne cache pas)
  gsap.set(steps, { autoAlpha: 0, y: 18 });
  gsap.set(rows, { autoAlpha: 0, y: 12 });
  if (typed) typed.textContent = "";
  ScrollTrigger.create({
    trigger: panel,
    start: "top 72%",
    once: true,
    onEnter: () => {
      const typeIn = (el: HTMLElement | null) => {
        if (!el) return;
        const txt = el.getAttribute("data-text") ?? "";
        let i = 0;
        const id = setInterval(() => {
          i += 1;
          el.textContent = txt.slice(0, i);
          if (i >= txt.length) clearInterval(id);
        }, 26);
      };
      const tl = gsap.timeline();
      tl.to(steps[0], { autoAlpha: 1, y: 0, duration: 0.4 })
        .add(() => typeIn(typed), "<")
        .to(steps[1], { autoAlpha: 1, y: 0, duration: 0.45 }, "+=1.4")
        .to(steps[2], { autoAlpha: 1, y: 0, duration: 0.4, ease: "back.out(1.6)" }, "+=0.3")
        .to(steps[3], { autoAlpha: 1, scale: 1, y: 0, duration: 0.6, ease: "back.out(1.4)" }, "+=0.35")
        .to(rows, { autoAlpha: 1, y: 0, stagger: 0.09, duration: 0.4 }, "-=0.2");
    },
  });
}

/* ---------- Parallaxe de sortie du terminal + misc ---------- */
function initMisc(): void {
  window.addEventListener("load", () => ScrollTrigger.refresh());
}

/* ---------- Bootstrap ---------- */
function init(): void {
  if (!reduced) {
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add("fx");
  } else {
    document.documentElement.classList.add("no-motion");
  }
  if (!reduced) {
    initLenis();
    heroEntrance();
    initReveals();
    const mm = gsap.matchMedia();
    mm.add(
      { desktop: "(min-width: 900px)", mobile: "(max-width: 899.98px)" },
      (ctx) => {
        if (ctx.conditions?.desktop) {
          document.querySelectorAll<HTMLElement>("[data-v8-case]").forEach(buildCase);
        } else {
          ScrollTrigger.batch("[data-v8-cs-item]", {
            start: "top 90%",
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, overwrite: true }),
          });
        }
      }
    );
  }
  initTilt();
  initChat();
  initMisc();

  const tier = detectTier();

  // F1 + F4 scènes Three.js — import dynamique : three.js n'entre dans le
  // bundle initial QUE sur les appareils tier 2 (desktop GPU).
  if (tier >= 2) {
    void import("./scenes")
      .then((m) => {
        m.initHomeScenes();
        const badge = document.getElementById("v8fps");
        if (badge) badge.hidden = false;
      })
      .catch(() => {
        /* fallbacks CSS déjà en place */
      });
  }

  // F3 galerie : logique DOM toujours active, GL seulement si tier 2
  const dataEl = document.querySelector<HTMLScriptElement>("[data-gallery-data]");
  if (dataEl) {
    try {
      const data = JSON.parse(dataEl.textContent ?? "{}") as GalleryData;
      initGallery(data, tier);
    } catch {
      /* galerie statique */
    }
  }
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
else init();
