# Design Notes — v4 (éditorial sombre · CTA favorisé)

Aperçu : `preview/design-preview-v4.html` (auto-suffisant, hors-ligne, FR). Direction : **dark editorial**, pas blanc minimaliste — les 4 références font loi.

## 1. ADN extrait des 4 références

| Référence | Ce qu'on en garde |
|---|---|
| grigoletti.ch | Précision suisse : chrome minimal, filets hairline, micro-labels mono, espace négatif, motion lent |
| visuvate.com | Canvas presque noir, récit mené par le mouvement, rythme scroll-led |
| johngearhart.me | Très grande typo d'affichage, vue catalogue, chrome réduit à l'os |
| hayler (ClaPat) | Case-study éditorial : display type immense, image-led, "scroll to explore", confiance silencieuse |

**ADN commun** : canvas presque noir · très grande typo d'affichage (serif italic en accent) · espace négatif généreux · chrome = filets 1px · **un seul accent** · récit par l'image · motion lent et précis. Tout est monochrome ; le bleu StackLab (`#0a7cff`) n'est porté **que par le logo** (pastille de marque).

## 2. Tokens

**Couleurs** — `--bg #0a0a0a` · `--bg2 #121212` · `--text #f6f6f6` · `--muted #929292` (≈6.5:1 sur bg) · `--line #262626` · accent `#0a7cff` (logo seul). Contraste body ≥ 4.5:1 respecté.

**Typo** — `Archivo` (grotesque, 400–700) + `Instrument Serif` (italique, accents). Échelle : hero `clamp(2.35rem, 6.6vw, 6rem)` · h2 section `clamp(1.85rem, 4.6vw, 3.4rem)` · nom projet `clamp(1.55rem, 3.4vw, 2.7rem)` · contact climax `clamp(2.7rem, 11vw, 8.5rem)` · body 1.02rem · micro-labels mono 0.66–0.8rem.

**Motion** — `--ease-out cubic-bezier(.23,1,.32,1)` (UI) · `--ease-in-out cubic-bezier(.77,0,.175,1)` (écran) · linear pour la barre de progression · `--press 140ms` · `--hover 220ms`. Reveal scroll 0.85s. **Tout** est derrière `prefers-reduced-motion: no-preference` ; en reduced-motion, contenu 100% visible, état "après" statique, pas de cursor, pas de preloader.

**Espacement** — `--pad clamp(1.2rem, 4vw, 3.5rem)` · sections `clamp(4.5rem, 11vw, 8rem)`. Grille projets 7fr/5fr alternée (image-led).

## 3. Mécaniques de conversion (le cœur du brief)

**Hiérarchie par la matière, pas par le volume** : sur un canvas monochrome, le **blanc plein est réservé au contact**. Tout le reste est texte ou filet. La pastille pleine devient l'unique point de poids — magnétique sans crier.

1. **CTA d'en-tête sticky** : "Parlons de votre projet" jamais hors de portée ; l'en-tête se compacte au scroll (voile + filet) pour rester discret.
2. **Bouton flottant** : apparaît après ~620px de scroll (plein largeur < 560px), se masque quand la section contact est déjà visible — c'est le mécanisme "gardez-moi en tête → revenez". C'est le bouton le plus proéminent de la page.
3. **Boucle de retour** : après **chaque** projet, refrain "Démarrer un projet →" (arrow-travel) + un CTA band discret "Maintenant, parlons du vôtre". Le visiteur qui regarde un projet est toujours à un lien de revenir au contact.
4. **Climax Peak-End** : la section contact a la plus grande typo (8.5rem) et le formulaire — fin mémorable.

## 4. Structure choisie / coupures

**Garder** : nav sticky → hero (dual-state) → preuve (4 chiffres discrets) → 6 projets (éditorial alterné, images réelles) → CTA band → processus (4 étapes) → contact + formulaire → footer.

**Couper / fusionner** (justifié par la conversion) : marquee secteurs (bruit, pas de conversion) · section "coulisses" séparée (fusionnée dans les frames projets) · viewer d'architecture + anatomie + manifeste (trop de sections tuent la course vers le contact ; l'essence du manifeste est dans la promesse hero et le CTA band) · iframe démo live (appartient aux pages case-study, pas à la home).

## 5. À évaluer avant d'approuver (franc)

1. **Le bouton flottant** : disruptif ou bien calibré ? C'est le mécanisme le plus puissant du brief — mais c'est lui qui peut diviser.
2. **Le refrain "Démarrer un projet" ×6** : rassurant ou répétitif ? (Volontaire : c'est la boucle de retour demandée.)
3. **Le dual-state hero** : le concept "avant → après" reste-il lisible avec la nouvelle échelle géante ?
4. **Images** : l'aperçu charge les vraies captures `.webp` via chemins relatifs ; hors-ligne, un emplacement conçu s'affiche. Valider le rendu avec les vraies images.
5. **Thème clair absent** : les références sont dark-led ; le light n'est pas inclus — confirmer qu'on abandonne le toggle clair.
6. **Langue** : FR seul dans l'aperçu (le EN suivra à l'intégration).

— design-lead · v4
