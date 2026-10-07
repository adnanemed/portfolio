# DESIGN NOTES — StackLab v8 « Flex tech / WebGL »

Fichier : `preview/design-preview-v8.html` — aperçu autonome (Three.js module + GSAP ScrollTrigger + Lenis via CDN). Aucun fichier de `site/` modifié.

## 1. Direction

Le client a jugé la v7 « not well designed » et veut **flexer** : la v8 garde le squelette de conversion validé (hero CTA → 6 projets → case studies → méthode → produit → contact) et monte la finition d'un cran :

- **Typographie** : Satoshi (Fontshare) pour display et texte — le skill stitch-design-taste bannit Inter pour un contexte premium. JetBrains Mono pour le code, les chiffres, les labels techniques (chips, HUD, terminal).
- **Matériaux** : verre fumé (`rgba` + backdrop-blur), bordures 1px, ombres profondes teintées du fond. **Zéro bleu** : l'ancien accent #0a7cff a été supprimé partout (retour client). Le portfolio est **neutre** (gris zinc) ; la couleur vient uniquement du contenu — chaque projet porte l'accent de son propre site. Le néon du pipeline est blanc/gris, les nœuds portent les accents projet.
- **Micro-copies FR** : revues avec le skill humanizer — ton direct, pas de clichés (« seamless », « elevate »…). Le tiret cadratin est conservé : le corpus du client (content.json) l'utilise, donc c'est sa voix.
- **Motion** : feedback press-in 100-150 ms partout, reveals en cascade (stagger 80-120 ms), easings `power3.out` / `back.out` — philosophie animate (ease-out, jamais ease-in sur l'UI, jamais scale(0)).

## 2. Les 5 features imposées — implémentation dans l'aperçu

### F1 — Hero : moteur de nœuds dynamique
Canvas WebGL plein hero (`#heroCanvas`) derrière le copy. 1 500 particules en coquille sphérique (ShaderMaterial custom, sprites additifs) + double icosaèdre wireframe. La souris pilote une **rotation par lerp** (`mx += (tx-mx)*0.05` — physique de ressort amortie). Au scroll (ScrollTrigger scrub sur le hero), un uniform `uMorph` 0→1 fait **descendre les particules en flux de données** (chute par particule + contraction X/Z + fondu) pendant que l'objet tourne de ~160°. Badge FPS live en bas à gauche (preuve, pas décoration).

### F2 — Projets : rangées tilt 3D + popups glassmorphism
La grille v7 devient des **rangées alternées** (media 7fr / meta 5fr, zig-zag — pas de 3 colonnes égales). Chaque media est un conteneur `perspective:1100px` avec tilt temps réel vers le pointeur (cible → lerp 0.12/frame sur `rotateX/rotateY`, rAF, **zéro shift de layout**, `will-change` posé seulement pendant l'interaction). Couche de profondeur `translateZ(-40px)` qui s'allume au hover. Popup flottant glassmorphism avec **device frame qui oscille en rotateY** (±13°, alternate) contenant le second screenshot du projet, plus meta « Vue : … ». Hover (pointeur fin) ET bouton « Aperçu 3D » (`aria-expanded`) pour clavier/tactile — aucune affordance hover-only.

### F3 — Galerie : transitions shader GLSL
Viewport 16/9 : un `<img>` réel (fallback + accessibilité) + un canvas Three.js au-dessus. Fragment shader : **ripple radial** (`sin(d*22 - t*3)` dont l'amplitude suit `sin(π·progress)`) — **monochrome** : le fringe RGB arc-en-ciel a été retiré (échantillonnage unique par texel) ; le front de transition porte une teinte unique `uAccent` = la couleur du projet affiché, légèrement désaturée (lerp 25 % vers sa propre luminance) pour tenir le contraste sur fond sombre. `uProgress` animé par GSAP (0.95 s, power2.inOut). Textures webp chargées **en asynchrone à la demande** (cache), cover-fit calculé par uniform. Onglets (6 projets, boutons `aria-pressed`) + flèches ‹ › (cycle 3 captures par projet). Si la texture échoue (ex. CORS en `file://`), reste en mode image avec transition CSS `clip-path` cercle — jamais de hard cut.

### F4 — Pipeline 3D néon (méthode)
Canvas 16/10 : courbe CatmullRom reliant 4 nœuds (sphères + sprite glow additif), TubeGeometry (140 segments) en ShaderMaterial — l'**impulsion** est une gaussienne `exp(-((vUv.x - uPulse)·14)²)` dont l'uniform est scrubbé par ScrollTrigger sur toute la section. Tube et pulsation **blancs neutres** ; chaque nœud s'allume dans **la couleur d'un projet** (voir §5) et **le bouton HTML correspondant flash en synchro** (avec son point de couleur). Clic sur un nœud (raycaster) ou sur une étape de la liste → **zoom caméra interpolé** (GSAP sur un objet cible, `lookAt` lerpé). Les 4 nœuds mappent la méthode : Cadrer (ex. booking 24/7) → Concevoir (ex. OCR & validation) → Construire (ex. base + PDF) → Mettre en ligne (ex. dashboard admin). Re-clic = retour vue d'ensemble.

### F5 — Terminal flottant stacklab.txt
Équivalent CSS 3D du `Float` de drei : `term-float` (oscillation translateY, 6 s alternate) > `term-tilt` (rotateX/Y lerpés vers le pointeur, max 10°/7°) > panneau verre. Parallaxe de profondeur au scroll (GSAP scrub y:-70). Bouton **« Run Demo System »** dans la barre du terminal : stream ASCII réel (logo bloc ANSI-Shadow, boot, scan réseau des 6 produits UP, statut), cadence 95 ms/ligne, curseur clignotant, bouton → « Relancer la démo ».

## 3. Stratégie fallback (obligation de la spec)

Détection de performance (équivalent `useDetectGPU`) → **tier 0/1/2** :
- tier 0 : `prefers-reduced-motion` ou WebGL indisponible → tout statique.
- tier 1 : mobile (`pointer:coarse`, écran < 700 px), `deviceMemory ≤ 4`, `hardwareConcurrency ≤ 3` → fallback CSS.
- tier 2 : desktop GPU → les 3 scènes Three.js.

Toute la 3D est un **enhancement par-dessus un DOM complet** : les canvases sont transparents tant que rien n'y est rendu, la galerie reste en `<img>` jusqu'à ce que la première texture soit réellement chargée, le pipeline affiche sa ligne néon CSS en dessous du canvas. CDN Three.js bloqué → la promesse `__threeReady` est rejetée/timeout (8 s) → fallbacks CSS uniquement ; GSAP/Lenis bloqués → reveals off, scroll natif. `IntersectionObserver` gèle le rendu des scènes hors écran, `document.hidden` suspend la boucle — le thread principal n'est jamais bloqué (géométries procédurales, aucune ressource 3D synchrone).

## 4. Décisions d'outillage

- **animejs : évalué, écarté.** GSAP couvre déjà springs (`back.out`), staggers et scrubbing ; ajouter un quatrième CDN pour des doublons multiplie les points de défaillance sans gain visuel. Règle appliquée : le moins d'outillage qui produit le résultat.
- **Pas de .glb** dans l'aperçu : géométries procédurales stylisées (voir §6 pour Draco/.glb en prod).
- Lenis : `smoothWheel` uniquement (tactile untouched — le scroll natif mobile n'est jamais pris en otage), câblé `lenis.on('scroll', ScrollTrigger.update)` + ticker GSAP.

## 5. Système couleur — v2 (retour client « pas ce bleu »)

La couleur ne vient plus du portfolio mais **du contenu** : les accents ci-dessous ont été extraits des sites live eux-mêmes (HTML/CSS réels récupérés par curl, classes Tailwind et variables hex les plus fréquentes).

| Projet | Accent | Hex | Source extraite du site live |
|---|---|---|---|
| Centre Dentaire Lahyani | Ambre (dental premium) | `#f59e0b` | 14× `bg-amber-500`, 10× `text-amber-400`, `border-amber-500` — la famille amber domine tout le site |
| AuraDrive | Or champagne | `#d8be75` | Hex littéraux `#d8be75` (4×), `#c9a352`, `#ba9340`, fond `#030305`, classes `amber-400`/`zinc` — noir + or |
| Saveur & Charme | Caramel | `#cda274` | Hex littéraux : `#cda274` (28×), `#8c5e35`, crème `#e2d6c5`, chocolat `#2c1e16` |
| KFresh | Vert frais | `#4ade80` | `text-green-200` (8×), `green-600/400/300`, dégradés `to-green-700/900` — vert « fresh » dominant |
| SigmaParts | Jaune industriel | `#e5a600` | Hex littéral `#e5a600` (21×) sur fond `#111827`/`#0d1520` (les verts/bleus détectés sont WhatsApp/Facebook, pas la marque) |
| PromptifyApp | Rouge forge | `#ff4b4b` | Hex littéraux `#ff4b4b`, `#ff3535`, `bg-red-500`, `from-red-500` sur fond `#161821` — l'identité « Forge » |

**Base portfolio** : neutre zinc sans dominante bleue — `--bg:#0a0a0c`, `--bg-2:#0e0e11`, `--surface:#141417`, `--surface-2:#1a1a1f`, texte `#f4f4f5`, muted `#a1a1aa`. Glows de fond passés du bleu au gris (`rgba(245,245,247,.05-06)`).

**CTA « Démarrer un projet »** : **blanc plein `--ink:#f4f4f5` sur encre `--paper:#131316`** (contraste ≈ 15:1, hover `#ffffff`). Justification : sur une page entièrement sombre, le seul bloc clair inversé est automatiquement le point de poids maximal — Von Restorff sans aucune couleur. Même traitement pour la skip-link, le label de phase des case studies, l'onglet galerie actif, le bouton « Run Demo System » et les étapes sélectionnées du pipeline.

**Onde du shader (galerie)** : `uAccent` = accent du projet affiché, désaturé en JS (`lerp 25 %` vers sa propre luminance) — jamais de fringe arc-en-ciel, plus de teinte bleue.

**Application par projet** : variable CSS `--pa` posée inline sur chaque rangée article — badge sector, filet de profondeur du tilt, bordure et ring du popup glassmorphism, hover du lien « étude de cas », point de couleur du nœud pipeline. Section produit = accent Promptify (`#ff4b4b`) : bulles de chat, carte « PROMPT FORGÉ », lueur de fond.

## 5b. Tokens

| Token | Valeur | Rôle |
|---|---|---|
| `--bg` | `#0a0a0c` | Fond (neutre, jamais #000) |
| `--surface` / `--surface-2` | `#141417` / `#1a1a1f` | Verre fumé, panneaux |
| `--ink` / `--paper` | `#f4f4f5` / `#131316` | CTA blanc plein / encre inversée (AA 15:1) |
| `--text` / `--muted` | `#f4f4f5` / `#a1a1aa` | Lecture ≥ 12:1 / secondaire ≥ 7:1 |
| `--pa` | par projet (voir §5) | Accent porté par le contenu |
| Display | Satoshi 900, clamp(3rem, 9vw, 8rem), tracking -0.04em | Hero |
| Mono | JetBrains Mono | chips, HUD, terminal, chiffres |

## 6. Plan d'intégration Next.js 16 + React Three Fiber

| Aperçu (vanilla) | Production (R3F) |
|---|---|
| `<canvas id="heroCanvas">` + rAF manuel | `<Canvas>` global (`react-three-fiber`) monté dans un composant client `dynamic(() => …, { ssr: false })` ; scènes en composants déclaratifs ; `frameloop="demand"` + `invalidate()` pour les scènes à l'arrêt |
| Détection tier maison | `@react-three/drei` `useDetectGPU()` (`tier` 0-3) + `useReducedMotion()` ; même grille 0/1/2 → composants fallback CSS (déjà écrits dans l'aperçu) |
| Particules + uniform `uMorph` | Composant `<NodeEngine>` : `Points` + `shaderMaterial` de drei ; `uMorph` piloté par `ScrollTrigger` (même wiring GSAP) ou par `useFrame` lisant un store (zustand) partagé avec Lenis |
| Icosaèdres wireframe | Remplaçables par un GLB low-poly **compressé Draco** (`useGLTF`, `draco: true` dans le gltfLoader) — l'aperçu reste procédural, la prod peut charger `kfresh-drone.glb` etc. en async avec Suspense |
| Tilt des cartes | `framer-motion` : `useMotionValue` + `useSpring` (stiffness 100, damping 20) sur `rotateX/rotateY` — le tilt JS maison devient un spring interruptible natif ; `whileHover` pour le popup |
| Galerie shader | Composant `<ShaderGallery>` : deux textures via `useTexture` (préchargé), même fragment GLSL (fichier `.glsl` importé), transition via `useSpring` ou GSAP ; fallback = le composant `<img>` existant |
| Pipeline néon | `<Pipeline>` : `TubeGeometry` via `<tubeGeometry args={[curve,…]}/>` + `shaderMaterial` ; pulsation scrubbée ; zoom caméra via `useFrame` + `lerp` ou `@react-three/camera-controls` ; raycast = `onPointerDown` des meshes R3F |
| Terminal float/tilt | `Float` + `MeshTransmissionMaterial` de drei si rendu WebGL, ou le composant CSS actif conservé (recommandé : HTML réel pour l'a11y et le SEO) |
| Lenis | `lenis/react` (`<ReactLenis root>`) + `lenis.on('scroll', ScrollTrigger.update)` dans un provider client unique |
| Shadcn UI | Nav, boutons, onglets galerie et dialog popup migrés vers Shadcn (Button/Tabs/Dialog) — les styles tokens restent identiques |

Perf cibles prod : LCP < 2,5 s mobile-4G (hero 3D en `ssr:false` + `next/dynamic`, poster statique pendant l'hydratation), ~60 FPS desktop tier 2, budgets : three+r3f+drei ≈ 150-180 KB gzip chargés après interaction/scroll, textures WebP < 120 KB pièce.

## 8. Intégration réelle (Astro 5 — site/ porté, validé client)

La v8 a été portée sur le site Astro existant (décision : **pas de migration Next.js maintenant** — le plan §6 reste l'évolution future). Libs via npm (`three`, `gsap`, `lenis`), bundle Vite/Astro — plus de timeout CDN.

**Architecture composants**
- `HomeView.astro` réécrit : Hero3D → SectorMarquee → ProjectRows (#projets) → ShaderGallery (#coulisses) → CaseSequences (#cas) → Pipeline3D (#processus) → PromptifyForge (#produit) → TerminalStacklab (#manifeste) → ContactSection (#contact, formulaire + WhatsApp conservés) → SiteFooter.
- `Hero3D`, `ProjectRows` (tilt + popups, `--pa` par projet), `ShaderGallery`, `CaseSequences` (pin scrub desktop / stack mobile), `Pipeline3D` (nœuds = 4 étapes méthode, accents projet), `PromptifyForge`, `TerminalStacklab`.
- **Scripts** (`src/scripts/v8/`) : `tier.ts` (détection 0/1/2 + boucle rAF partagée + FPS + IntersectionObserver), `home.ts` (GSAP/ScrollTrigger + Lenis wheel-only + reveals + tilt + popups + pins + chat + terminal), `gallery.ts` (logique DOM toujours active), `scenes.ts` (**import dynamique** — Three.js 548 KB gzipé non minifié part dans un chunk séparé chargé uniquement si tier ≥ 2).
- **Tokens** : `src/styles/v8.css` (couche après global.css) — palette zinc neutre, `--pa` par projet, CTA blanc plein, Satoshi via Fontshare + JetBrains Mono ; `.serif` redéfini en sans 900 (une ligne → tout le site suit la v8 sans toucher aux contenus).
- **i18n** : sous-arbre `v8` ajouté à `t.fr` et `t.en` (hero, projets, galerie, case sequences, pipeline, forge, terminal) — la home v8 existe en FR **et** EN (`/`, `/en/`).
- **Contenu** : `accent` par projet + `fallbackScreenshots` (3/projet) dans content.json, régénérés par `scripts/generate-content.mjs` (maps `ACCENTS` + `LIVE_URL_OVERRIDES` : sigmaparts → sigmaparts.ma, promptifyapp → promptifyapp.com, plus de lien withholds). Type `Project.accent` dans `lib/site.ts` — une seule source de vérité.

**Nettoyage** : supprimés `CaseIndex`, `ShotsGrid`, `FlowMap`, `AnatomyRows`, `Stats`, `Manifesto`, `ProjectNavigator`, `lib/project-store.ts`, `lib/render-case-index.ts` ; `lib/refresh.ts` recentré sur case pages + socials (le re-render de l'index home était lié aux composants retirés). Le préloader, le curseur custom, le thème clair/sombre, le formulaire de contact et le CTA WhatsApp (`primaryContactHref`) sont conservés tels quels.

**Vérifié** : `astro check` 0 erreur ; `pnpm build` 14 pages (FR/EN + 12 case studies + sitemap) ; chunk `scenes.*.js` (Three.js) bien séparé et chargé dynamiquement ; `check-assets` OK ; dev server testé (/, /en/, /projets/lahyani/ → 200).

**Note build Windows** : dans l'environnement de portage, esbuild a besoin de `TEMP` local (conflit AV sur `%TEMP%`) : `TMP="$(pwd)/.tmpbuild" TEMP="$(pwd)/.tmpbuild" pnpm build`. Sur une machine normale, `pnpm build` suffit.

## 9. À évaluer avant d'approuver

- [ ] Équilibre des accents projet : le rouge Promptify et le vert KFresh ressortent plus que les ors (AuraDrive/Saveur) — ajuster la désaturation de `uAccent`/`--pa` si l'ensemble paraît inégal
- [ ] CTA blanc plein : assez « lourd » face aux accents couleur (c'est voulu : poids maximal, sans couleur)

- [ ] Le hero frappe-t-il assez fort ? (particules 1 500, densité du réseau, vitesse de rotation — ajustables dans `initHeroScene`)
- [ ] Force du ripple RGB-shift en galerie (0.018/0.035 — plus ou moins « liquide »)
- [ ] Vitesse de la pulsation du pipeline vs scroll (`scrub: 1`, section `.pipe`)
- [ ] Le tilt 9°/7° : présent sans gêner la lecture des captures
- [ ] Terminal : cadence du stream (95 ms) et hauteur 340 px
- [ ] Satoshi rend-elle le ton voulu (vs retour au Inter si le client préfère)
- [ ] Vérifier le badge FPS sur une machine faible (si < 45 FPS de façon stable, réduire N à 900)
- [ ] Lien WhatsApp réel (`{primaryContactHref}`) une fois fourni
