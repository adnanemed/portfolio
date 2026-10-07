# Design Notes — v5 (le Sommaire · dossier éditorial à 7 chapitres)

Aperçu : `preview/design-preview-v5.html` (auto-suffisant, FR, responsive). Direction : **nouvelle itération structurale** — la page n'est plus une suite de sections, c'est un **dossier à 7 chapitres numérotés** dont le contact est le chapitre final.

## 1. ADN retenu des 4 références

| Référence | Ce qu'on garde en v5 |
|---|---|
| grigoletti.ch | Précision suisse : filets hairline, micro-labels mono, chrome minimal, motion lent |
| visuvate.com | Canvas presque noir, récit mené par le scroll, chapitres pleine page |
| johngearhart.me | Index typographique géant : le sommaire EST la page |
| hayler (ClaPat) | Case-study image-led : image pleine largeur qui casse la grille, légendes mono |

**ADN commun conservé** : canvas `#0a0a0a` · très grande typo d'affichage (Instrument Serif italique en accent) · espace négatif généreux · chrome = filets 1px · **un seul accent** (le bleu `#0a7cff` reste porté UNIQUEMENT par le logo) · récit par l'image · motion lent et précis.

**Ce qui change vs v4** : hero dual-state "avant → après" abandonné (remplacé par une couverture éditoriale avec image incrustée dans le titre) · grille alternée 7fr/5fr remplacée par des chapitres pleine page image-led · bouton flottant pill remplacé par une barre de marge en pied de fenêtre · CTA band séparé supprimé (fusionné dans les interchapitres).

## 2. Le concept signature : "Le Sommaire"

La page se lit comme un dossier de créations numéroté 01 → 07. Un **index typographique géant** juste après le hero liste les 7 chapitres ; le **07, "Votre projet", est le contact** — il clôt la séquence au lieu d'être une section à part. Trois conséquences de conversion :

1. Le visiteur sait à tout moment où il en est (folio dans la marge de chaque chapitre) et ce qu'il reste à voir.
2. Le contact est **normalisé comme la suite logique** du parcours, pas comme une interruption commerciale.
3. L'effet de fin (Peak-End) est renforcé : la numérotation donne au contact un rôle narratif, pas juste un emplacement.

## 3. Tokens

**Couleurs** — `--bg #0a0a0a` · `--bg2 #131313` · `--text #f6f6f6` · `--muted #9f9f9f` (6.9:1) · `--soft #8a8a8a` (folios, grands textes ≥ 24px seulement) · `--line #262626` · accent bleu logo seul. Contrastes ≥ 4.5:1 vérifiés.

**Typo** — `Archivo` (400–700) + `Instrument Serif` italique (accents, folios). Échelle : hero `clamp(2.6rem, 6.6vw, 6rem)` · noms du sommaire `clamp(1.45rem, 3.6vw, 2.9rem)` · titres chapitre `clamp(1.9rem, 4.4vw, 3.6rem)` · folios serif `clamp(2.4rem, 5vw, 4.6rem)` · contact climax `clamp(2.9rem, 10.5vw, 8.5rem)` · micro-labels mono 0.72–0.84rem.

**Motion** — `--ease-out cubic-bezier(.23,1,.32,1)` · `--ease-in-out (.77,0,.175,1)` · `--press 140ms` · `--hover 220ms`. Reveal scroll 0.85s (IntersectionObserver, une fois). Hero : reveal typographique par masques + pastille image en fondu. Tout derrière `prefers-reduced-motion: no-preference` ; en reduced-motion, contenu 100% visible, pas de translation, transitions opacité uniquement, pas de reveal masqué.

**Espacement** — `--pad clamp(1.25rem, 4vw, 3.5rem)` · sections `clamp(4.5rem, 10vw, 8rem)` · chapitres délimités par filets 1px.

## 4. Mécaniques de conversion (le cœur du brief)

1. **Chapitre 07 = contact** : le contact est dans le sommaire, numéroté comme les projets. Omniprésence *sémantique* plutôt que visuelle : au lieu d'un bouton qui crie, c'est la structure qui ramène au contact.
2. **Barre de marge** (remplace le bouton flottant v4) : bande fine fixée en pied de fenêtre, filet haut, micro-label mono "Un projet en tête ?" + "Démarrer un projet →". Apparaît après le hero, se masque quand le contact est visible. Desktop : coin bas-droit ; mobile : pleine largeur. Moins intrusive qu'une pill flottante, toujours à portée de pouce.
3. **Interchapitres contextuels** : après CHAQUE projet, un filet + une question centrée client ("Un site qui remplit votre agenda ?", "Un catalogue qui génère des devis ?") + le refrain "Démarrer un projet →". Le lien porte un texte WhatsApp **pré-rempli par projet** (`{primaryContactHref}` par chapitre) : le message part avec le contexte, le client n'a plus qu'à envoyer.
4. **CTA permanent d'en-tête** : pill pleine "Démarrer un projet" dans le header, voile + filet au scroll.
5. **Climax Peak-End** : chapitre 07 avec la plus grande typo (8.5rem), WhatsApp en bouton plein + email en second + formulaire en ancre `#contact`.

**Un seul label par intention** : contact = "Démarrer un projet" partout (header, hero, interchapitres, barre de marge, climax) ; exploration = "Voir les projets".

## 5. Structure gardée / coupée

**Garder** : header sticky compact → hero couverture → **sommaire (nouveau, signature)** → preuve honnête (chiffres réels du portfolio, pas de métriques inventées) → 6 chapitres projets image-led → méthode (4 étapes : Cadrer, Concevoir, Construire, Mettre en ligne) → contact chapitre 07 + formulaire → footer.

**Couper vs v4** : preloader compteur (retard perçu, n'aide pas la conversion ; le reveal typographique du hero fait le travail d'entrée) · horloge Casablanca (decoration, déplacée en mention footer) · bouton flottant pill (remplacé par la barre de marge) · CTA band autonome (fusionné dans les interchapitres) · stats 4-colonnes (remplacées par un colophon à 3 faits réels).

## 6. Accessibilité & performance

Skip-link, focus visible 2px, cibles ≥ 44px, contrastes ≥ 4.5:1 (≥ 3:1 pour les folios de grande taille), `prefers-reduced-motion` intégralement traité (contenu visible sans JS également : reveals scopés derrière `html.js`), images 1440×900 déclarées (`width`/`height`, zéro CLS), lazy loading partout sauf la pastille hero, zéro framework, zéro dépendance JS obligatoire.

## 7. À évaluer avant d'approuver (franc)

1. **Le sommaire en tête de page** : il ajoute une étape avant les projets. C'est le choix signature (johngearhart) — mais si vous préférez plonger direct dans le travail, on peut le déplacer ou le réduire.
2. **La barre de marge vs le bouton flottant v4** : plus discrète, moins "app". Risque : moins visible. Le mécanisme est le même (apparaît après le hero, disparaît au contact) — seul le costume change.
3. **Les interchapitres ×6** : même boucle de retour que la v4, mais habillée en question. Vérifier que la répétition reste agréable avec le nouveau format chapitre.
4. **Hero sans dual-state** : le "avant → après" est abandonné au profit de la couverture + image incrustée. C'est un vrai départ du v4 — confirmer que vous l'acceptez.
5. **Image en pastille dans le titre** : le geste créatif le plus visible de la v5. Si elle gêne, elle se retire sans toucher au reste.
6. **Images** : les vraies captures `.webp` (1440×900) sont chargées via chemins relatifs ; hors ligne, un emplacement conçu s'affiche. Valider le rendu avec les images réelles.
7. **Thème clair** : toujours absent, dark-led comme les références — confirmer l'abandon du toggle.
8. **Liens de contact** : tous en `#contact` avec commentaires `{primaryContactHref}` ; les textes WhatsApp pré-remplis par projet sont à brancher à l'intégration.

— design-lead · v5
