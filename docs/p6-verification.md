# P6 verification — Rebuild site public (Astro)

Date : 2026-10-02. Environnement : Windows / Git Bash, Node 24, pnpm 11, Astro 5.18.2.

## Résultats

| # | Vérification | Résultat |
|---|---|---|
| 1 | `astro check` (TS strict + diagnostics, TS 5.9) | 0 erreur · 0 warning · 0 hint (33 fichiers) |
| 2 | `astro build` (output static) | ✅ 14 pages en ~1.1 s, sans erreur |
| 3 | Routes construites | `/` + `/en/` + 6×`/projets/[slug]/` + 6×`/en/projects/[slug]/` + `/sitemap.xml` = **14/14** |
| 4 | `astro preview` + curl — 17 URLs (14 pages + sitemap + favicon + logo) | **17/17 → 200** |
| 5 | Asset-link check (`scripts/check-assets.mjs` : refs `src|href` du HTML buildé vs fichiers dist) | 13 refs, **0 manquant** (6 assets non référencés = fallbacks galerie pour projets iframe-embeddable + og-image en meta `content=`, tous présents) |
| 6 | Case index rendu depuis content.json | 6 lignes `.case` avec numéros 01–06, badges « Démo » (Saveur & Charme) et « Produit propre » (PromptifyApp), note R1 `#r1-note` présente |
| 7 | Case rows → URLs live | `target="_blank" rel="noopener noreferrer"` sur les 5 lignes avec liveUrl ; ligne PromptifyApp → `#contact` (R1 : **aucun lien promptifyapp.com** dans le site, vérifié grep = 0) |
| 8 | Hero dual-state | `.swap` > `.state-a`/`.state-b` (aria-hidden sur B), cycle 4s, statique sous reduced-motion |
| 9 | Preloader + curseur | présents sur toutes les pages ; animation complète 1×/session (`sessionStorage`), `display:none` sous reduced-motion |
| 10 | Live demo (Saveur & Charme) | mockup navigateur, URL mono `restaurant-app-liart-seven.vercel.app`, click-to-load (`data-demo-src`), skeleton shimmer, fallback note après 8 s — aucune iframe dans le HTML statique |
| 11 | Architecture viewer | 3 chips (Saveur & Charme aria-pressed=true, Lahyani, AuraDrive) → `/diagrams/<slug>.webp`, zoom +/−/reset, drag pan, clavier (flèches/+/−/0), pan clampé |
| 12 | Case studies §2.2 | hero (nom, secteur, métrique une ligne, badge type) → Problème → Solution → Fonctionnalités (rows + metrics strip) → Aperçu live (iframe embeddable : kfresh/auradrive/saveur-charme ; galerie + « Ouvrir le site » : lahyani/sigmaparts ; note + « Demander une présentation privée » : promptifyapp) → Architecture (si diagramme) → CTA band → prev/next |
| 13 | Formulaire contact | champs name/email/phone/message + honeypot `website` + `startedAt` + `locale` ; POST `${PUBLIC_API_BASE_URL}/api/public/contact` ; états inline sending/success/error ; fallback gracieux si API injoignable |
| 14 | Runtime refresh (`src/lib/refresh.ts`) | fetch `/api/public/projects` + `/api/public/site` ; hash djb2 build vs API (`data-hash="1yo6qdu"` sur `#caseIndex`, `data-cs-hash="lahyani:…"` sur les case studies) ; re-render rows/textes si diff ; update WhatsApp + socials ; échec réseau → HTML statique intact |
| 15 | SEO | canonical + hreflang fr/en/x-default sur les 14 pages ; `og:*` + `twitter:card` + og-image 1200×630 ; JSON-LD Organization + WebSite (homes) + BreadcrumbList (case studies) ; sitemap 14 URLs avec alternates ; robots.txt ; `llms.txt` |
| 16 | A11y / perf | skip-link, `:focus-visible`, cibles ≥44px (nav, chips, zbtn, arrow, liens footer/form), `prefers-reduced-motion` kill-switch global (preloader/marquee/swap/reveals/shimmer/cursor), images `loading="lazy"` + `width/height` (pas de CLS), preconnect fonts, `theme-color #0a0a0a`, CSS en propriétés logiques (`inset-inline`, `border-inline-start`…) |
| 17 | Anonymat | aucun nom personnel dans le HTML/metadata ; aucune clé secrète côté site (env publiques uniquement : `PUBLIC_API_BASE_URL`, `PUBLIC_SITE_URL`, `PUBLIC_WHATSAPP_FALLBACK`) ; `dashboard/` et `preview/` non modifiés |

## Assets

| Asset | Avant | Après |
|---|---|---|
| logo-stacklab.svg | 722 KB (2 PNG base64 encapsulés) | **257 KB** (rasters ré-encodés palette PNG q90 — delta pixel 0.25 %, visuellement identique, vérifié par rendu) |
| 13 screenshots PNG | 0.15–1.5 MB | webp q80, max 1440w, **15–262 KB chacun** (tous ≤ 300 KB) |
| 3 diagrammes architecture | 1.2–2.4 MB PNG | webp q80 1600w, **23–45 KB** |
| og-image.png | — | 49 KB, 1200×630, typographique (aucun visage/nom) |

## Écarts / décisions

1. **Lang switch dans la nav** (petit lien mono EN/FR avant les liens) — pas dans la preview, requis pour un site bilingue SEO-friendly (P7). Les ancres nav restent fidèles à la preview.
2. **Entrée vers les case studies** : les lignes du case index pointent vers les sites live (preview + consigne), donc les légendes de la grille « Dans les coulisses » sont devenues des liens vers `/projets/<slug>/` (seule navigation valide sans casser la structure `<a>` de ligne).
3. **PromptifyApp** : liveUrl exposé `null` dans content.json (`liveUrlWithheld: true`) conformément à R1 — case row → `#contact` + note R1 ; case-study → galerie + « Demander une présentation privée ». Réactivation : retirer le slug de `LIVE_URL_WITHHELD` dans `site/scripts/generate-content.mjs` et relancer `pnpm generate-content`.
4. **Preloader** : animation complète uniquement à la première page vue de la session (UX standard), sinon skip instantané — le rendu reste identique à la preview à la première visite.
5. **Tags** : les drafts ne contiennent qu'un seul jeu de tags (FR) — mappé EN via table de correspondance (`render-case-index.ts` / `i18n.ts`), non réécrit dans les drafts.
6. **robots.txt** contient l'URL par défaut `https://stacklab-site.vercel.app` — à mettre à jour lors du swap de domaine (R4), avec `PUBLIC_SITE_URL`.
7. **Astro check** requiert TypeScript 5.x (TS 7 natif ne fournit pas encore l'API programmatique) — épinglé `typescript@5.9` en devDependency.

## Reste owner (flux contenu)

1. `dashboard/` tourne (Neon + env configurées) → valider/corriger chaque projet dans `/dashboard/projects/[id]/edit`, confirmer les métriques, publier.
2. Après publication : télécharger l'export **content.json** (`/api/admin/export`) → remplacer `site/src/content/content.json` (ou relancer `cd site && pnpm generate-content` tant que les drafts locaux font foi), **rebuild** (`pnpm build`) → le site reflète le contenu publié.
3. Renseigner `site/.env` : `PUBLIC_API_BASE_URL` (URL du dashboard déployé) + optionnel `PUBLIC_WHATSAPP_FALLBACK` ; au runtime, `refresh.ts` mettra à jour WhatsApp/socials et le contenu modifié depuis le dernier build.
4. E2E contact en conditions réelles (dashboard + Neon + Resend up) — non exécutable dans cet environnement (API dashboard ne démarre pas sans DB) ; le contrat POST suit §2.4 (honeypot, startedAt, 429 géré).
5. QA visuelle complète (matrice FR/EN, mobile 360px, throttled 4G, lecteur d'écran) → P9.
