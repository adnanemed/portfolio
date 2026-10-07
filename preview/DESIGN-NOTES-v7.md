# DESIGN NOTES — StackLab v7 « Cinématique immersif »

Fichier : `preview/design-preview-v7.html` — aperçu autonome, aucun fichier de `site/` modifié.

## 1. Direction

Direction retenue par le client : **cinématique immersif** (référence visuvate.com). Récit piloté
par le scroll, images plein écran qui zooment/se révèlent, typographie display géante, fond sombre
profond, « wow » d'abord. Rupture totale avec les v5 (éditorial sombre numéroté) et v6 (papier/encre
suisse) : pas de serif, pas de sommaire numéroté, pas de mise en page magazine.

Thèse visuelle : **l'écran est une salle de cinéma, le scroll est la barre de temps.** Chaque
projet est un « moment » plein écran ; chaque séquence majeure se referme sur une porte vers le
contact — le « wow » raconte, le CTA convertit.

## 2. Design tokens

| Token | Valeur | Rôle |
|---|---|---|
| `--bg` | `#06070c` | Fond dominant (60 %) — noir bleuté, jamais `#000` |
| `--bg-2` / `--surface` | `#0a0c13` / `#10131d` | Surfaces secondaires (30 %) |
| `--accent` | `#0a7cff` | Bleu StackLab (10 %) — CTA, liens, chiffres |
| `--accent-hi` | `#4d9aff` | Labels kicker, hover, texte accentué (4.9:1+ sur fond) |
| `--text` / `--muted` | `#f3f5fa` / `#9aa4b5` | Lecture (≥ 7:1) / secondaire (≥ 7.6:1) |
| `--cta-ink` | `#04102a` | Texte des boutons bleu vif (≥ 4.85:1 — AA) |

- Typographie : **Inter** (400→900). Display `clamp(3rem, 9.2vw, 8.25rem)`, interlignage ~1,
  tracking négatif. Aucun serif — la v5/v6 reste bannie.
- Espacement : échelle 8px (4/8/12/16/24/32/48), section rhythm 96px (2×48).
- Boutons : bleu vif + texte bleu nuit foncé (contraste AA garanti, distinctive — Von Restorff).
  Un seul bouton primaire par écran ; cibles ≥ 44px.

## 3. Séquences scroll (GSAP 3.12 + ScrollTrigger, CDN cdnjs)

| # | Séquence | Mécanique |
|---|---|---|
| 0 | Hero | Zoom lent de l'image de fond (CSS `heroZoom`, hors main thread) + entrée orchestrée du titre/CTAs au chargement. CTA visible **dès l'arrivée**, pas après scroll. Parallaxe douce de sortie (`yPercent -10`, scrub). |
| 1 | Projets (6 moments) | Chaque projet = section `100svh`, image en fond avec **zoom scrub 1.18 → 1.02** sur toute la traversée, voile dégradé pour le contraste, texte qui émerge au batch. Aucun pin : le scroll natif (tactile inclus) n'est jamais intercepté. |
| 2 | Études de cas ×2 | **Pin desktop uniquement** (`gsap.matchMedia ≥ 900px`, `end +=280%`, `scrub 1`) : phase PROBLÈME (mots qui émergent mot à mot) → phase SOLUTION (étapes 1→4 en cascade + capture flottante) → phase RÉSULTATS (métriques + CTA). Sur mobile : pas de pin, phases empilées avec reveals simples. |
| 3 | Méthode | Ligne de progression verticale remplie au scrub (`scaleY 0→1`) + reveals des 4 temps. |
| 4 | Produit PromptifyApp | Conversation animée au premier scroll dans le panneau : bulle utilisateur **effet machine à écrire** → réponse → pilule « Forge It » → carte **PROMPT FORGÉ** (Rôle/Tâche/Ton/Structure) qui poppe (`back.out`), lignes en cascade. |
| 5 | Contact | Titre géant + CTA primaire plein format. |

Performance : transforms/opacity uniquement, `will-change` limité aux images projet et phases
épinglées, images `width/height` + `loading="lazy"` (sauf fond hero en `fetchpriority="high"`),
barre de progression en `scaleX` sur rAF, `gsap.quickTo` inutile (pas de mouse-follower).

## 4. Robustesse & accessibilité (contraintes du brief)

- **Sans GSAP (offline/CDN bloqué)** : les états cachés ne sont appliqués **que** sous la classe
  `html.fx`, ajoutée par JS après chargement + enregistrement réussis de GSAP. Toute exception →
  `catch` retire la classe, tue les ScrollTriggers et nettoie les styles inline : **tout le contenu
  reste visible et lisible**. `prefers-reduced-motion` : GSAP jamais initialisé, animations CSS
  désactivées par media queries — page 100 % statique et complète.
- Images manquantes : placeholder dégradé élégant (`media--missing` via `onerror`).
- Skip-link, focus visible, HTML sémantique, FR uniquement, alt descriptifs, texte du « typing »
  lisible par lecteur d'écran via `aria-label` (le span animé est `aria-hidden` implicite du
  parent étiqueté).
- Contrastes vérifiés : boutons ≥ 4.85:1, texte muted ≥ 7:1, liens accent ≥ 4.9:1.
- Tactile : aucune dépendance hover ; reveals déclenchés au scroll, liens et CTA ≥ 44px.

## 5. Mécaniques de conversion

1. **CTA « Démarrer un projet » omniscient** — même libellé partout : nav sticky (visible dès
   l'arrivée, y compris mobile), hero, bande après les projets, fin des deux études de cas,
   méthode, section produit, contact géant, footer. Pointe vers `#contact` ; le lien WhatsApp réel
   est à substituer au marqueur `{primaryContactHref}` (commentaire en tête du `<body>`).
2. **Preuve vivante** — chaque projet porte un lien « Voir le site live ↗ » vers l'URL réelle
   (lahyani, auradrive, saveur-charme, kfresh, sigmaparts.ma, promptifyapp.com) : le visiteur
   vérifie sans friction, la crédibilité précède le pitch.
3. **Récit problème → solution → résultats** — les deux études de cas épinglées transforment une
   galerie en argumentaire : le visiteur repart avec un schéma mental « StackLab résout X » et un
   CTA immédiatement sous les métriques.

## 6. Structure livrée

1. Hero cinématique + double CTA · 2. Projets (6 moments plein écran, liens live) ·
3. Études de cas SigmaParts & Lahyani (pin scrub, textes réels de `content.json`) ·
4. Méthode (Cadrer / Concevoir / Construire / Mettre en ligne + ligne de progression) ·
5. Produit PromptifyApp (conversation + « PROMPT FORGÉ » + « Essayer Promptify → ») ·
6. Contact + footer.

## 7. À évaluer avant d'approuver

- [ ] Le rythme du pin des études de cas (`+=280%`) : assez lent pour le récit, assez rapide pour
      ne pas frustrer ? À tester à la souris ET au trackpad.
- [ ] Le zoom des images projets (1.18 → 1.02) : présent sans étourdir — ajuster si malaise.
- [ ] Durée du typewriter (~26 ms/caractère) et délai avant la réponse du bot.
- [ ] Lisibilité du texte sur les 6 fonds d'images (voile dégradé) — sur vrai écran lumineux.
- [ ] Le lien sigmaparts : le brief impose `https://sigmaparts.ma/` alors que `content.json`
      indique une démo interne (`/demos/sigmaparts/`) — à trancher avant intégration.
- [ ] Sur mobile, vérifier que le pin désactivé laisse des études de cas agréables à lire.
- [ ] Emplacement du CTA WhatsApp réel (`{primaryContactHref}`) une fois fourni.
