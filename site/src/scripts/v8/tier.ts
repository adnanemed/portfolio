// v8 — device tier detection (equivalent of drei's useDetectGPU) and the
// shared rAF loop that drives every Three.js scene. Scenes register with an
// `active` flag driven by IntersectionObserver, so off-screen canvases cost
// nothing and the main thread is never blocked by the WebGL layer.

export type GlScene = {
  el: Element;
  active: boolean;
  update: (time: number) => void;
};

const scenes: GlScene[] = [];
let loopStarted = false;
let frames = 0;
let lastFps = 0;

export type Tier = 0 | 1 | 2;

/** 0 = static (reduced motion / no WebGL) · 1 = low (CSS fallbacks) · 2 = full WebGL. */
export function detectTier(): Tier {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return 0;
  try {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (!gl) return 0;
  } catch {
    return 0;
  }
  const nav = navigator as Navigator & { deviceMemory?: number };
  const mem = nav.deviceMemory ?? 8;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(screen.width, screen.height) < 700;
  if (small || coarse || mem <= 4 || cores <= 3) return 1;
  return 2;
}

/** Freeze rendering for canvases outside the viewport. */
export function observe(el: Element, scene: GlScene): void {
  if (!("IntersectionObserver" in window)) {
    scene.active = true;
    return;
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const en of entries) scene.active = en.isIntersecting;
    },
    { threshold: 0.02 }
  );
  io.observe(el);
}

export function registerScene(scene: GlScene): void {
  scenes.push(scene);
  observe(scene.el, scene);
  startLoop();
}

function startLoop(): void {
  if (loopStarted) return;
  loopStarted = true;
  const badge = document.getElementById("v8fps");
  const tick = (now: number) => {
    requestAnimationFrame(tick);
    if (document.hidden) return;
    const t = now * 0.001;
    for (const s of scenes) if (s.active) s.update(t);
    frames++;
    if (badge && !badge.hidden && now - lastFps > 800) {
      badge.textContent = Math.round((frames * 1000) / (now - lastFps)) + " FPS";
      frames = 0;
      lastFps = now;
    }
  };
  requestAnimationFrame(tick);
}
