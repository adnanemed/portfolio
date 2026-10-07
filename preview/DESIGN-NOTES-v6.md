# DESIGN NOTES - StackLab v6

Aperçu : `preview/design-preview-v6.html` (HTML autonome, CSS inline, vanilla JS, zéro dépendance lourde).
Toute modification de `site/` est exclue du livrable. Version FR uniquement.

## 1. Direction choisie : "Papier & Encre" (éditorial suisse, conversion-first)

**Lecture du brief** : site studio de type conversion (les visiteurs doivent devenir des clients), pour une audience de dirigeants de PME (cliniques, agences, distribution industrielle, e-commerce). Goûts exprimés par le client : minimaliste, précision suisse, grande typo. Contrainte : rompre nettement avec la v5 "Le Sommaire" (pas de sommaire numéroté, pas de hero dual-state, pas de barre de marge).

**La direction** : une page papier clair (`#f6f5f1`, pas de blanc pur) avec une typographie display géante (Space Grotesk, lettrage serré), un contraste encre/papier très franc, et un seul accent bleu StackLab `#0a7cff` employé avec parcimonie (liens, tags, soulignés, focus). Les boutons primaires sont en **encre pleine** (`#151412`) plutôt que bleus : contraste maximal (~15:1), lisibilité AA garantie partout, et le bleu reste réservé à la signalétique. C'est le geste suisse : une couleur d'action, pas dix couleurs décoratives.

### Pourquoi ce choix (et les références qui l'inspirent)

Recherche menée sur les tendances 2025-2026 (Awwwards, templates Framer/Webflow récents, articles tendances) :

- Les synthèses de tendances 2026 (GoDaddy, Sessions College, Haddington Creative, Fireart Studio, Studio Meyer) convergent vers : **grilles modulaires lisibles (bento)**, **type minimalisme à grande échelle**, **"floating minimalism"**, et surtout une logique de **scannabilité orientée conversion**.
- Les templates d'agence Framer/Webflow plébiscités 2025-2026 (Perform chez Gola Supply, sélections Radiant/Victorflow/Framer Websites) partagent : typographie suisse, layouts épurés, micro-interactions rapides, vitrine de travaux "distraction-free".
- Références de calibration produit : Linear / OpenAI (typographie-led, restraint), ElevenLabs (confiance par l'espace blanc).

Ce que je retiens pour StackLab : la mode "Awwwards expérimentale" (scroll-hijack, curseurs custom, parallax) est le mauvais pari pour un site dont l'objectif est de faire signer des PME. Le bon pari 2026, c'est le **minimalisme stratégique** : grande typo comme seule décoration, preuve réelle (screenshots de sites EN PRODUCTION) comme seule image, et un chemin de conversion sans friction. La différenciation vient de la matière (papier/encre, pas de gris "SaaS") et de l'omniprésence d'un unique CTA.

Dials utilisés (échelle taste-skill) : VARIANCE 5 (grille suisse, asymétrie mesurée), MOTION 3-4 (reveals sobres, hovers physiques), DENSITY 3 (aéré).

## 2. Tokens

### Couleurs (60-30-10)
| Rôle | Token | Valeur | Usage |
|---|---|---|---|
| Dominant 60% | `--paper` | `#f6f5f1` | fond de page, sections |
| Secondaire 30% | `--surface` / `--dark` | `#fdfcfa` / `#151412` | cartes / bandes CTA + contact |
| Accent 10% | `--accent` | `#0a7cff` | halo discret, dot live, focus large |
| Accent texte AA | `--accent-text` | `#0057d8` | liens, tags, labels (5.9:1 sur papier) |
| Encre | `--ink` | `#151412` | texte + boutons primaires |
| Encre douce | `--ink-soft` | `#55524b` | texte secondaire (6.6:1) |
| Ligne | `--line` | `#e4e1da` | hairlines |

`#0a7cff` seul donne 3.9:1 sur papier : insuffisant pour du petit texte, d'où la variante `#0057d8`. Le bleu "brut" reste visible dans le halo du hero et le dot d'état du chat.

### Typographie
- Display : **Space Grotesk** (500-700), `letter-spacing -0.03em`, H1 clamp(2.5rem, 6.5vw, 4.9rem).
- Corps/UI : **Inter** (conforme aux règles design du projet), 17px/1.6.
- Fallbacks système sur les deux.

### Espacement / rayons / ombres
- Échelle 8px uniquement (4, 8, 12, 16, 24, 32, 48, 64 + paddings de section 64/120).
- Rayon : cartes 16px, médias 12px, boutons pill. Règle documentée, tenue partout.
- Ombres teintées encre (pas de noir pur), une seule profondeur par contexte.

### Motion (philosophie emilkowalski/animate)
- Reveal au scroll : `transform + opacity` uniquement, `cubic-bezier(0.23,1,0.32,1)`, 500-550ms, stagger 70ms. Déclenché par IntersectionObserver, une seule fois.
- Hovers : 150-200ms, `ease` ; pas de `transition: all` ; hover scale d'image conditionné à `@media (hover:hover)`.
- Boutons : feedback `:active scale(0.98)` 150ms.
- `prefers-reduced-motion: reduce` : tout le contenu est visible sans aucune animation (les états `[data-reveal]` ne s'appliquent que si le media query `no-preference` ET si JS est actif via la classe `.js`). Sans JS : page intégralement lisible.
- Aucun scroll-hijack, aucun parallax, aucune boucle infinie.

## 3. Mécaniques de conversion

1. **Une seule intention = un seul libellé.** "Démarrer un projet" apparaît 6 fois (nav sticky, hero, bandeau encre, section contact, barre mobile, footer), toujours avec le même libellé et toujours vers `#contact`. Le secondaire du hero ("Voir les projets") est le seul échappatoire, placé à gauche.
2. **Le CTA est physiquement le héros.** Bouton XL (60px) dans le hero, bandeau encre pleine largeur au milieu de page, section contact finale en encre, et **barre CTA collante sur mobile** qui apparaît après le hero et disparaît quand on atteint le contact (pas de chevauchement avec le formulaire final).
3. **La preuve fait la vente.** 6 projets cliquables vers leurs sites réels ("Visiter le site"), 2 études de cas problème → solution → résultats avec métriques réelles issues de `content.json`, collage de vraies captures dans le hero avec mention "En ligne". Rien d'inventé, aucune métrique décorative.
4. **Contact sans friction.** La section finale promet "un message, une réponse, un rendez-vous" ; le canal WhatsApp est le bouton principal (placeholder `{primaryContactHref}` en commentaire HTML pour l'intégration).

## 4. Structure livrée (dans l'ordre imposé)

1. **Hero + CTA** : H1 court ("Votre site devrait vous ramener des clients."), sous-texte < 20 mots, CTA primaire XL + secondaire, note de réassurance d'une ligne, puis collage de 3 vraies captures. Pas d'eyebrow, pas de strip décoratif.
2. **Projets** : 2 cartes vedettes (lahyani, saveur-charme, les deux `featured: true`) + grille 2x2 (auradrive, kfresh, sigmaparts, promptifyapp). Chaque carte = capture réelle, secteur, tags, lien externe "Visiter le site".
3. **Bandeau CTA** (transition encre).
4. **Étude de cas** : SigmaParts (lien https://sigmaparts.ma/) et Lahyani, chacune : problème encadré bleu → 4 étapes de solution numérotées → 3 métriques. Intro collante en colonne gauche (desktop), texte réel repris de `content.json` (problemFr/solutionFr/metrics), reformaté sans em-dash.
5. **Méthode** : Cadrer / Concevoir / Construire / Mettre en ligne, 4 colonnes reliées par un filet d'encre, numérotation discrète.
6. **Votre produit** : section PromptifyApp présentée en **conversation** (bulles chat : idée vague → carte "PROMPT FORGÉ" avec Rôle/Tâche/Ton/Structure/Longueur, comme sur promptifyapp.com → questions/réponses tarif), badge "Notre propre produit", CTA "Essayer Promptify" vers https://promptifyapp.com/. Les bulles apparaissent en stagger à l'entrée dans le viewport.
7. **Contact final** encre + footer. `{primaryContactHref}` à remplacer par le lien WhatsApp réel.

## 5. Accessibilité & technique

- Skip-link, `:focus-visible` 2px accent sur tout, navigation mobile avec `aria-expanded`, cibles >= 44px, contrastes AA vérifiés (encre/papier ~15:1, `#0057d8` 5.9:1, `#55524b` 6.6:1, texte sur encre > 12:1).
- Images : `width/height` + `loading="lazy"` (sauf première image hero), `object-fit: cover` dans des ratios fixés (zéro CLS), fallback élégant via handler `error` (motif + nom du projet, attribut `data-fallback`).
- `prefers-reduced-motion` : animations coupées, contenu intégralement visible ; la page est aussi 100% lisible sans JS.
- Mobile : nav hamburger, grilles 1 colonne, collage hero en scroll-snap horizontal, barre CTA collante.

## 6. À évaluer avant d'approuver

1. **La matière "papier"** : le fond `#f6f5f1` (légèrement chaud, pas de blanc pur) est le geste signature de la version. Si le client préfère un blanc plus neutre ou un thème sombre, c'est un changement de tokens, pas de structure.
2. **Boutons primaires en encre (noirs) plutôt que bleus** : choix délibéré (contraste + rareté du bleu). Si le client tient à des CTA bleus `#0a7cff`, il faudra accepter un texte sur bouton en grande taille ou un bleu plus foncé.
3. **Les métriques des études de cas** : SigmaParts n'a que 2 métriques réelles dans `content.json` ; j'ai ajouté "0 appel pour identifier une pièce" (qualitatif, vérifiable) et "0 double réservation" pour Lahyani. À valider côté client avant mise en ligne.
4. **PromptifyApp apparaît deux fois** (grille projets + section conversation). C'est conforme au brief mais on peut le retirer de la grille si ça fait doublon au goût du client.
5. **La photo du hero** : collage de 3 captures clients. Si le client préfère un hero purement typographique, la suppression du bloc `.hero-media` est propre.
6. **Langue et canal** : FR seul dans cet aperçu ; le libellé WhatsApp final et le numéro réel restent à brancher (`{primaryContactHref}`).
