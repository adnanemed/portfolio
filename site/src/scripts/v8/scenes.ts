// v8 — Three.js scenes (hero particles, neon pipeline, shader gallery).
// This module is ONLY imported via dynamic import() when the device tier is 2,
// so three.js never lands in the initial bundle.
import * as THREE from "three";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerScene } from "./tier";

const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
type ImgTex = THREE.Texture & { image: HTMLImageElement };
const texAspect = (t: { image: unknown }) => {
  const img = t.image as HTMLImageElement;
  return img.width / img.height;
};

/* ============================================================
   F1 — Hero : moteur de nœuds (particules + wireframes)
   ============================================================ */
function initHeroScene(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#heroCanvas");
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(DPR());
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
  cam.position.z = 8;
  const group = new THREE.Group();
  scene.add(group);

  const N = 1500;
  const pos = new Float32Array(N * 3);
  const rnd = new Float32Array(N);
  const dir = new THREE.Vector3();
  for (let i = 0; i < N; i++) {
    dir.randomDirection().multiplyScalar(2.6 + (Math.random() - 0.5) * 1.6);
    pos[i * 3] = dir.x;
    pos[i * 3 + 1] = dir.y;
    pos[i * 3 + 2] = dir.z;
    rnd[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aRand", new THREE.BufferAttribute(rnd, 1));
  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uSize: { value: DPR() * 10 },
    },
    vertexShader: [
      "attribute float aRand;",
      "uniform float uTime, uMorph, uSize;",
      "varying float vA;",
      "void main(){",
      "  vec3 p = position;",
      "  p.x += sin(uTime*0.6 + aRand*6.283)*0.08;",
      "  p.y += cos(uTime*0.5 + aRand*4.0)*0.08;",
      "  float fall = uMorph * (5.0 + aRand*7.0);",
      "  p.y -= fall; p.x *= 1.0 - uMorph*0.45; p.z *= 1.0 - uMorph*0.45;",
      "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
      "  gl_PointSize = uSize * (30.0 / -mv.z) * (0.6 + aRand*0.8);",
      "  gl_Position = projectionMatrix * mv;",
      "  vA = (1.0 - uMorph*0.85) * (0.4 + aRand*0.6);",
      "}",
    ].join("\n"),
    fragmentShader: [
      "varying float vA;",
      "void main(){",
      "  float d = length(gl_PointCoord - 0.5);",
      "  float a = smoothstep(0.5, 0.05, d);",
      "  gl_FragColor = vec4(vec3(0.93, 0.93, 0.95), a * vA);",
      "}",
    ].join("\n"),
  });
  group.add(new THREE.Points(geo, mat));

  const wireMat = new THREE.LineBasicMaterial({ color: 0xd4d4d8, transparent: true, opacity: 0.2 });
  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(2.1, 1)),
    wireMat
  );
  const wire2 = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(1.15, 0)),
    new THREE.LineBasicMaterial({ color: 0xf4f4f5, transparent: true, opacity: 0.1 })
  );
  group.add(wire, wire2);

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    },
    { passive: true }
  );

  const resize = () => {
    const w = canvas.clientWidth || canvas.parentElement?.clientWidth || 1;
    const h = canvas.clientHeight || canvas.parentElement?.clientHeight || 1;
    renderer.setSize(w, h, false);
    cam.aspect = w / Math.max(h, 1);
    cam.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  const morph = { v: 0 };
  ScrollTrigger.create({
    trigger: ".hero3d",
    start: "top top",
    end: "bottom top",
    scrub: true,
    onUpdate: (self) => (morph.v = self.progress),
  });

  registerScene({
    el: canvas,
    active: true,
    update(t) {
      mx += (tx - mx) * 0.05;
      my += (ty - my) * 0.05;
      group.rotation.y = t * 0.07 + mx * 0.7 + morph.v * Math.PI * 0.9;
      group.rotation.x = my * 0.45 + morph.v * 0.25;
      group.position.y = -morph.v * 1.2;
      mat.uniforms.uTime.value = t;
      mat.uniforms.uMorph.value = morph.v;
      wireMat.opacity = 0.2 * (1 - morph.v);
      wire.rotation.y = -t * 0.04;
      wire2.rotation.x = t * 0.05;
      renderer.render(scene, cam);
    },
  });
}

/* ============================================================
   F4 — Pipeline néon (4 nœuds méthode, accents projet)
   ============================================================ */
function initPipelineScene(): void {
  const canvas = document.querySelector<HTMLCanvasElement>("#pipeCanvas");
  if (!canvas) return;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(DPR());
  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  cam.position.set(0, 0, 9);

  const nodePos = [
    new THREE.Vector3(-4.6, 0.9, 0),
    new THREE.Vector3(-1.6, -0.7, 0.8),
    new THREE.Vector3(1.6, 0.8, -0.6),
    new THREE.Vector3(4.6, -0.6, 0.4),
  ];
  const curve = new THREE.CatmullRomCurve3(nodePos, false, "catmullrom", 0.6);
  const tubeMat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uPulse: { value: 0 } },
    vertexShader: ["varying vec2 vUv;", "void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }"].join("\n"),
    fragmentShader: [
      "uniform float uPulse; varying vec2 vUv;",
      "void main(){",
      "  float g = exp(-pow((vUv.x - uPulse) * 14.0, 2.0));",
      "  vec3 col = mix(vec3(0.5), vec3(1.0), g) * (0.5 + g * 2.0);",
      "  gl_FragColor = vec4(col, 0.26 + g * 0.85);",
      "}",
    ].join("\n"),
  });
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 140, 0.07, 10, false), tubeMat));

  const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-pipe-node]")];
  // Une couleur projet par nœud (lue depuis le --pa inline des boutons)
  const accents = buttons.map((b) => {
    const c = getComputedStyle(b).getPropertyValue("--pa").trim();
    try { return new THREE.Color(c || "#d4d4d8"); } catch { return new THREE.Color("#d4d4d8"); }
  });
  const dims = accents.map((c) => c.clone().multiplyScalar(0.22));

  const glowTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(244,244,245,.9)");
    gr.addColorStop(1, "rgba(244,244,245,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();

  const nodes: THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial>[] = [];
  nodePos.forEach((p, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 24), new THREE.MeshBasicMaterial({ color: dims[i].clone() }));
    m.position.copy(p);
    m.userData.i = i;
    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: glowTex,
        color: accents[i].clone(),
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      })
    );
    glow.scale.setScalar(2.2);
    m.add(glow);
    scene.add(m);
    nodes.push(m);
  });

  const camTarget = { x: 0, y: 0, z: 9, lx: 0, ly: 0, lz: 0 };
  const press = (i: number) => buttons.forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
  const zoomTo = (i: number) => {
    const p = nodePos[i];
    gsap.to(camTarget, { x: p.x * 0.55, y: p.y * 0.55, z: 4.6, lx: p.x, ly: p.y, lz: p.z, duration: 1.1, ease: "power3.inOut", overwrite: true });
    press(i);
  };
  const resetCam = () => {
    gsap.to(camTarget, { x: 0, y: 0, z: 9, lx: 0, ly: 0, lz: 0, duration: 1.1, ease: "power3.inOut", overwrite: true });
    press(-1 as unknown as number);
    buttons.forEach((b) => b.setAttribute("aria-pressed", "false"));
  };
  buttons.forEach((b) => {
    b.addEventListener("click", () => {
      const i = Number(b.dataset.pipeNode);
      if (b.getAttribute("aria-pressed") === "true") resetCam();
      else zoomTo(i);
    });
  });
  const ray = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  canvas.addEventListener("click", (e) => {
    const r = canvas.getBoundingClientRect();
    ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
    ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    ray.setFromCamera(ptr, cam);
    const hit = ray.intersectObjects(nodes)[0];
    if (hit) zoomTo(hit.object.userData.i as number);
  });

  const pulse = { v: 0 };
  ScrollTrigger.create({
    trigger: ".v8pipe",
    start: "top 75%",
    end: "bottom 35%",
    scrub: 1,
    onUpdate: (self) => {
      pulse.v = self.progress;
      buttons.forEach((b, i) => b.classList.toggle("v8pipe--lit", Math.abs(pulse.v - i / 3) < 0.06));
    },
  });

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    cam.aspect = w / h;
    cam.updateProjectionMatrix();
  };
  resize();
  window.addEventListener("resize", resize);

  registerScene({
    el: canvas,
    active: true,
    update(t) {
      cam.position.x += (camTarget.x - cam.position.x) * 0.06;
      cam.position.y += (camTarget.y - cam.position.y) * 0.06;
      cam.position.z += (camTarget.z - cam.position.z) * 0.06;
      cam.lookAt(camTarget.lx, camTarget.ly, camTarget.lz);
      tubeMat.uniforms.uPulse.value = pulse.v;
      nodes.forEach((n, i) => {
        const a = Math.exp(-Math.pow((pulse.v - i / 3) * 7, 2));
        n.material.color.copy(dims[i]).lerp(accents[i], a);
        n.scale.setScalar(1 + a * 0.45);
        n.position.y = nodePos[i].y + Math.sin(t * 1.2 + i * 1.7) * 0.07;
      });
      renderer.render(scene, cam);
    },
  });
}

/* ============================================================
   F3 — Galerie : transition shader liquide monochrome + uAccent
   ============================================================ */
export type GalleryGL = {
  setActive: (v: boolean) => void;
  /** Charge la première texture ; résout true si le mode GL est actif. */
  ready: (url: string, accent: string) => Promise<boolean>;
  /** Transition liquide vers une nouvelle texture + accent. */
  show: (url: string, accent: string) => Promise<void>;
};

function initGalleryGL(): GalleryGL | null {
  const canvas = document.querySelector<HTMLCanvasElement>("#galCanvas");
  const vp = document.querySelector<HTMLElement>("#galViewport");
  if (!canvas || !vp) return null;
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  renderer.setPixelRatio(DPR());
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    tPrev: { value: null as THREE.Texture | null },
    tNext: { value: null as THREE.Texture | null },
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uAspect: { value: 1 },
    uTaP: { value: 1.6 },
    uTaN: { value: 1.6 },
    uAccent: { value: new THREE.Color(0.83, 0.63, 0.45) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: ["varying vec2 vUv;", "void main(){ vUv = uv; gl_Position = vec4(position, 1.0); }"].join("\n"),
    fragmentShader: [
      "precision highp float;",
      "uniform sampler2D tPrev, tNext;",
      "uniform float uProgress, uTime, uAspect, uTaP, uTaN;",
      "uniform vec3 uAccent;",
      "varying vec2 vUv;",
      "vec4 sampleFit(sampler2D tex, vec2 uv, float ta){",
      "  vec2 r = (ta > uAspect) ? vec2(1.0, ta / uAspect) : vec2(uAspect / ta, 1.0);",
      "  vec2 st = (uv - 0.5) * r + 0.5;",
      "  if (st.x < 0.0 || st.x > 1.0 || st.y < 0.0 || st.y > 1.0) {",
      "    return vec4(0.045, 0.045, 0.06, 1.0);",
      "  }",
      "  return vec4(texture2D(tex, st).rgb, 1.0);",
      "}",
      "void main(){",
      "  float p = uProgress;",
      "  float amp = sin(p * 3.14159265);",
      "  vec2 c = vUv - 0.5;",
      "  float d = length(c);",
      "  vec2 dir = normalize(c + vec2(0.0001));",
      "  float ripple = sin(d * 22.0 - uTime * 3.0) * 0.035 * amp;",
      "  vec2 uv = vUv + dir * ripple;",
      "  float radius = p * 1.35;",
      "  float m = smoothstep(radius - 0.28, radius + 0.02, d);",
      "  vec4 cp = sampleFit(tPrev, uv, uTaP);",
      "  vec4 cn = sampleFit(tNext, uv, uTaN);",
      "  vec3 col = mix(cn.rgb, cp.rgb, m);",
      "  float edge = 1.0 - abs(m - 0.5) * 2.0;",
      "  col += uAccent * edge * amp * 0.45;",
      "  gl_FragColor = vec4(col, 1.0);",
      "}",
    ].join("\n"),
  });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));

  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  const cache = new Map<string, THREE.Texture>();
  let current: THREE.Texture | null = null;
  let busy = false;

  const loadTex = (url: string) =>
    new Promise<THREE.Texture | null>((resolve) => {
      const hit = cache.get(url);
      if (hit) return resolve(hit);
      loader.load(
        url,
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.minFilter = THREE.LinearFilter;
          cache.set(url, t);
          resolve(t);
        },
        undefined,
        () => resolve(null)
      );
    });

  const softAccent = (hex: string) => {
    const c = new THREE.Color(hex);
    const l = c.r * 0.299 + c.g * 0.587 + c.b * 0.114;
    c.lerp(new THREE.Color(l, l, l), 0.25);
    return c;
  };

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    uniforms.uAspect.value = w / h;
  };
  resize();
  window.addEventListener("resize", resize);

  const galleryScene = {
    el: canvas as Element,
    active: true,
    update(t: number) {
      uniforms.uTime.value = t;
      if (uniforms.tPrev.value) renderer.render(scene, cam);
    },
  };
  registerScene(galleryScene);

  return {
    setActive(v) {
      galleryScene.active = v;
    },
    async ready(url, accent) {
      const tex = (await loadTex(url)) as ImgTex | null;
      if (!tex) return false;
      uniforms.tPrev.value = tex;
      uniforms.tNext.value = tex;
      uniforms.uTaP.value = texAspect(tex);
      uniforms.uTaN.value = texAspect(tex);
      uniforms.uProgress.value = 0;
      uniforms.uAccent.value.copy(softAccent(accent));
      current = tex;
      resize();
      return true;
    },
    async show(url, accent) {
      if (busy || !current) return;
      const tex = (await loadTex(url)) as ImgTex | null;
      if (!tex) { busy = false; return; }
      busy = true;
      uniforms.tPrev.value = current;
      uniforms.uTaP.value = texAspect(current);
      uniforms.uTaN.value = texAspect(tex);
      uniforms.uAccent.value.copy(softAccent(accent));
      uniforms.uProgress.value = 0;
      await gsap.to(uniforms.uProgress, {
        value: 1,
        duration: 0.95,
        ease: "power2.inOut",
        onComplete: () => {
          current = tex;
          uniforms.tPrev.value = tex;
          uniforms.uProgress.value = 0;
        },
      }).then();
      busy = false;
    },
  };
}

/** Point d'entrée unique : monte les scènes présentes dans le DOM. */
export function initHomeScenes(): void {
  try { initHeroScene(); } catch { /* fallback CSS déjà en place */ }
  try { initPipelineScene(); } catch { /* idem */ }
}
export { initGalleryGL };
