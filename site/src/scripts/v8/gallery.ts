// v8 — galerie captures d'une case study : flèches + compteur + clavier,
// transition shader liquide monochrome (uAccent = accent du projet).
// Le rendu GL n'est attaché que si le tier device vaut 2 (import dynamique
// de three.js). Fallback : <img> + wipe CSS. Aucun onglet : les captures
// sont celles d'UN projet.
import type { GalleryGL } from "./scenes";

export type GalleryShot = { url: string; caption: string };
export type GalleryData = {
  name: string;
  accent: string;
  shots: GalleryShot[];
  labels: { prev: string; next: string; regionAria: string; hintWebgl: string; hintFallback: string };
};

export function initGallery(data: GalleryData, tier: number): void {
  const vp = document.querySelector<HTMLElement>("#galViewport");
  const img = document.querySelector<HTMLImageElement>("#galImg");
  const canvas = document.querySelector<HTMLCanvasElement>("#galCanvas");
  const count = document.querySelector<HTMLElement>("#galCount");
  const hint = document.querySelector<HTMLElement>("#galHint");
  if (!vp || !img || !count || !data.shots.length) return;

  let s = 0;
  let mode: "img" | "gl" = "img";
  let busy = false;
  let gl: GalleryGL | null = null;

  const applyUI = () => {
    count.textContent = `${s + 1} / ${data.shots.length}`;
    if (mode === "img") {
      const shot = data.shots[s];
      if (img.getAttribute("src") !== shot.url) {
        img.src = shot.url;
        img.alt = shot.caption;
        vp.classList.remove("gal--wipe");
        void vp.offsetWidth; // retrigger CSS animation
        vp.classList.add("gal--wipe");
      }
    }
  };

  const show = async (si: number) => {
    const shot = data.shots[si];
    img.alt = shot.caption;
    if (mode === "gl" && gl) {
      busy = true;
      await gl.show(shot.url, data.accent);
      busy = false;
    } else {
      img.src = shot.url;
      img.alt = shot.caption;
      vp.classList.remove("gal--wipe");
      void vp.offsetWidth;
      vp.classList.add("gal--wipe");
    }
  };

  const step = (d: number) => {
    if (busy) return;
    const n = data.shots.length;
    const next = (s + d + n) % n;
    if (next === s) return;
    s = next;
    applyUI();
    void show(s);
  };

  const prev = document.querySelector<HTMLButtonElement>("#galPrev");
  const next = document.querySelector<HTMLButtonElement>("#galNext");
  if (prev) {
    prev.setAttribute("aria-label", data.labels.prev);
    prev.addEventListener("click", () => step(-1));
  }
  if (next) {
    next.setAttribute("aria-label", data.labels.next);
    next.addEventListener("click", () => step(1));
  }

  // Clavier : flèches quand le focus est dans la région galerie
  vp.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    }
  });

  applyUI();

  // GL : uniquement tier 2 — import dynamique (three n'est pas dans le bundle initial)
  if (tier >= 2 && canvas) {
    void (async () => {
      try {
        const scenes = await import("./scenes");
        gl = scenes.initGalleryGL();
        if (!gl) return;
        const ok = await gl.ready(data.shots[s].url, data.accent);
        if (!ok) {
          if (hint) hint.textContent = data.labels.hintFallback;
          gl = null;
          return;
        }
        mode = "gl";
        vp.classList.add("gal--gl");
        if (hint) hint.textContent = data.labels.hintWebgl;
      } catch {
        if (hint) hint.textContent = data.labels.hintFallback;
      }
    })();
  } else if (hint) {
    hint.textContent = data.labels.hintFallback;
  }
}
