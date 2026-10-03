// UI copy — FR is the approved preview copy; EN mirrors it.
import type { Locale } from "./site";

export const t = {
  fr: {
    htmlLang: "fr",
    skipToContent: "Aller au contenu",
    preloaderLabel: "StackLab — Portfolio",
    navAria: "Navigation principale",
    nav: { projects: "Projets", coulisses: "Coulisses", process: "Processus", contact: "Contact", cta: "Parlons de votre projet" },
    langSwitch: "EN",
    langSwitchAria: "Switch to English",
    homePath: "/",
    homeUrl: "/",
    hero: {
      kicker: "Studio de développement — Maroc & international",
      stateA: 'Vous perdez des clients au <span class="serif">téléphone.</span>',
      stateB: 'Tout votre commerce, géré depuis <span class="serif">un seul tableau de bord.</span>',
      sub: "Sites web qui attirent vos clients, tableaux de bord qui gèrent votre activité. Cliniques, restaurants, locations, commerces, startups. La démo d'abord, le projet ensuite.",
      cta: "Démarrer un projet",
      clockCity: "Casablanca",
      clockAria: "Heure locale à Casablanca (décoratif)",
    },
    stats: [
      { num: "6", lbl: "Projets livrés" },
      { num: "5", lbl: "Secteurs différents" },
      { num: "2", lbl: "Produits propres" },
      { num: "FR/EN", lbl: "Bilingue" },
    ],
    marquee: ["Cliniques dentaires", "Restaurants", "Location de voitures", "Supermarchés", "Pièces industrielles", "Produits SaaS"],
    cases: {
      title: 'Projets <span class="serif">livrés</span>',
      idx: "6 projets — 2024 · 2026",
      demoBadge: "Démo",
      ownBadge: "Produit propre",
      r1Note: "Le lien public de PromptifyApp sera activé avec la mise en ligne officielle — écrivez-nous pour une présentation privée.",
    },
    coulisses: {
      title: 'Dans les <span class="serif">coulisses</span>',
      idx: "captures réelles, non retouchées — sites & tableaux de bord",
    },
    shotCaptions: {
      "saveur-charme-admin": "saveur-charme — tableau de bord temps réel",
      "saveur-charme-admin-menu": "saveur-charme — gestion du menu + import excel",
      "lahyani-booking": "lahyani — réservation en ligne",
      "kfresh-shop": "kfresh — boutique en ligne",
      "auradrive-hero": "auradrive — showroom 3d 360°",
      "lahyani-hero": "lahyani — site bilingue fr / ar",
      "promptifyapp-hero": "promptifyapp — produit propre",
    },
    demo: {
      title: "L'aperçu <span class=\"serif\">en direct</span>",
      idx: "6 projets — démo, sites réels & produits — naviguez avec les flèches",
      liveBadge: "démo live",
      imageBadge: "capture réelle",
      hint: "rien à installer — cliquez, testez",
      load: "Charger l'aperçu",
      open: "Ouvrir le site",
      embedUnavailable: "Aperçu intégré indisponible pour ce site — ouvrez-le dans un nouvel onglet.",
      notePre: "L'aperçu ne s'est pas chargé ici — ",
      noteLink: "ouvrez le site dans un nouvel onglet ↗",
      iframeTitle: "Aperçu en direct",
    },
    pnav: {
      group: "Choisir un projet",
      prev: "Projet précédent",
      next: "Projet suivant",
    },
    flow: {
      howLabel: "comment ça marche",
    },
    arch: {
      title: "L'<span class=\"serif\">architecture</span>, en clair",
      idx: "le parcours réel de chaque application — projet par projet",
      groupLabel: "Choisir le schéma d'architecture",
      zoomLabel: "Contrôles de zoom",
      zoomIn: "Zoomer",
      zoomOut: "Dézoomer",
      reset: "Réinitialiser la vue",
      viewportAria: "Schéma d'architecture. Utilisez les boutons pour zoomer, les flèches pour déplacer, la touche 0 pour réinitialiser.",
      hint: "molette de boutons pour zoomer · glisser pour déplacer · touches + − 0 et flèches",
    },
    anatomy: {
      title: "Anatomie d'une <span class=\"serif\">case study</span>",
      idx: "chaque projet raconté, même structure",
      rows: [
        ["Hero", "La promesse du projet en une phrase, en grand — avant tout détail technique."],
        ["Problème", "Ce que le gérant vit sans outil : le carnet papier, les doubles réservations, le téléphone."],
        ["Solution", "Le parcours complet, du client jusqu'au tableau de bord — raconté, pas listé."],
        ["Fonctionnalités", "Chaque module avec sa capture d'écran réelle : réservation, catalogue, commandes, factures."],
        ["Aperçu live", "La démo embarquée, testable sans rien installer — ou un bouton « Ouvrir le site »."],
        ["Comment ça marche", "Le parcours détaillé en phases : ce que fait le client, ce que fait le gérant, ce qui tourne sous le capot."],
        ["CTA", "Un seul bouton à la fin : démarrer votre projet à vous."],
      ],
    },
    manifesto: {
      title: 'Le <span class="serif">manifeste</span>',
      idx: "stacklab.txt",
      body: `studio de développement — casablanca, maroc.

on ne vend pas de site vitrine.
on construit le site et le système derrière :
commandes, réservations, agenda, catalogue, factures.

le client commande en ligne.
le gérant voit tout dans un seul tableau de bord.
pas de double réservation, pas de carnet papier.

toujours une démo d'abord. vous testez, ensuite on livre.
si la démo ne vous convainc pas, on s'arrête là.

6 projets. 5 secteurs. 2 produits propres. fr / en.`,
    },
    process: {
      title: 'Comment on <span class="serif">travaille</span>',
      idx: "4 étapes, zéro surprise",
      rows: [
        ['On <span class="serif">écoute</span>', "Un appel, vos contraintes, vos clients. Pas de jargon, pas de devis à l'aveugle."],
        ['On construit une <span class="serif">démo</span>', "Vous voyez votre site fonctionner — avec vos plats, vos soins, vos véhicules — avant de payer quoi que ce soit."],
        ['Vous <span class="serif">testez</span>', "En conditions réelles, avec votre équipe. On ajuste jusqu'à ce que ça colle au terrain."],
        ['On livre & on <span class="serif">forme</span>', "Le site en ligne, le tableau de bord entre vos mains, une formation pour l'équipe incluse."],
      ],
    },
    contact: {
      title: 'Parlons de<br><span class="serif">votre projet.</span>',
      note: "Réponse sous 24h.",
      megaCta: "Démarrer un projet",
      waText: "Bonjour StackLab, je veux discuter d'un projet.",
      formTitle: "Ou écrivez-nous directement",
      form: {
        name: "Nom",
        namePh: "Votre nom",
        email: "Email",
        emailPh: "vous@entreprise.com",
        phone: "Téléphone",
        optional: "(optionnel)",
        message: "Message",
        messagePh: "Parlez-nous de votre activité et de ce qu'il vous manque.",
        submit: "Envoyer le message",
        sending: "Envoi…",
        success: "Message reçu — réponse sous 24h.",
        error: "L'envoi a échoué — réessayez dans un instant.",
        fallback: "Le formulaire est indisponible : écrivez-nous directement par email.",
        fallbackLink: "Ouvrir votre application email ↗",
      },
    },
    footer: {
      rights: "© 2026 StackLab",
      tagline: "Sites & systèmes — démo d'abord, projet ensuite",
      top: "Haut de page ↑",
    },
    waFloat: "Discuter sur WhatsApp",
    caseStudy: {
      back: "Tous les projets",
      typeBadge: { demo: "Démo", own: "Produit propre" },
      problemIdx: "02 — Le problème",
      problemTitle: 'Le <span class="serif">problème</span>',
      solutionIdx: "03 — La solution",
      solutionTitle: 'La <span class="serif">solution</span>',
      featuresIdx: "04 — Fonctionnalités",
      featuresTitle: 'Fonctionnalités <span class="serif">clés</span>',
      liveIdx: "05 — Aperçu live",
      liveTitle: 'Aperçu <span class="serif">en direct</span>',
      archIdx: "06 — Comment ça marche",
      archTitle: 'Comment ça <span class="serif">marche</span>',
      archTitleText: "Comment ça marche — le parcours détaillé, phase par phase",
      ctaTitle: 'Démarrons <span class="serif">votre projet.</span>',
      ctaNote: "Comme ces six projets — la démo d'abord, le projet ensuite.",
      openSite: "Ouvrir le site",
      loadPreview: "Charger l'aperçu",
      hint: "rien à installer — cliquez, testez",
      notePre: "L'aperçu ne s'est pas chargé ici — ",
      noteLink: "ouvrez le site dans un nouvel onglet ↗",
      withheldNote: "Le lien public sera activé avec la mise en ligne officielle — écrivez-nous pour une présentation privée.",
      withheldCta: "Demander une présentation privée",
      prev: "Projet précédent",
      next: "Projet suivant",
      screenshotAlt: "Capture d'écran du site",
      waText: "Bonjour StackLab, j'ai vu le projet {name} — je veux la même chose pour mon activité.",
    },
    seo: {
      home: {
        title: "StackLab — Sites web & tableaux de bord pour PME | Casablanca",
        description: "Studio de développement à Casablanca : sites web qui attirent vos clients et tableaux de bord qui gèrent votre activité. 6 projets, 5 secteurs. La démo d'abord, le projet ensuite.",
      },
      caseTitleSuffix: "— Case study | StackLab",
      caseDescription: (summary: string) => summary,
    },
    ogLocale: "fr_FR",
    ogLocaleAlt: "en_US",
  },

  en: {
    htmlLang: "en",
    skipToContent: "Skip to content",
    preloaderLabel: "StackLab — Portfolio",
    navAria: "Main navigation",
    nav: { projects: "Projects", coulisses: "Behind the scenes", process: "Process", contact: "Contact", cta: "Let's talk about your project" },
    langSwitch: "FR",
    langSwitchAria: "Passer au français",
    homePath: "/en/",
    homeUrl: "/en/",
    hero: {
      kicker: "Development studio — Morocco & international",
      stateA: 'You are losing clients on <span class="serif">the phone.</span>',
      stateB: 'Your entire business, run from <span class="serif">a single dashboard.</span>',
      sub: "Websites that bring you clients, dashboards that run your business. Clinics, restaurants, rentals, retail, startups. The demo first, the project next.",
      cta: "Start a project",
      clockCity: "Casablanca",
      clockAria: "Local time in Casablanca (decorative)",
    },
    stats: [
      { num: "6", lbl: "Projects delivered" },
      { num: "5", lbl: "Different sectors" },
      { num: "2", lbl: "Own products" },
      { num: "FR/EN", lbl: "Bilingual" },
    ],
    marquee: ["Dental clinics", "Restaurants", "Car rental", "Supermarkets", "Industrial parts", "SaaS products"],
    cases: {
      title: 'Delivered <span class="serif">projects</span>',
      idx: "6 projects — 2024 · 2026",
      demoBadge: "Demo",
      ownBadge: "Own product",
      r1Note: "PromptifyApp's public link will go live with the official launch — write to us for a private walkthrough.",
    },
    coulisses: {
      title: 'Behind the <span class="serif">scenes</span>',
      idx: "real, untouched screenshots — sites & dashboards",
    },
    shotCaptions: {
      "saveur-charme-admin": "saveur-charme — realtime dashboard",
      "saveur-charme-admin-menu": "saveur-charme — menu management + excel import",
      "lahyani-booking": "lahyani — online booking",
      "kfresh-shop": "kfresh — online store",
      "auradrive-hero": "auradrive — 360° 3d showroom",
      "lahyani-hero": "lahyani — bilingual fr / ar site",
      "promptifyapp-hero": "promptifyapp — own product",
    },
    demo: {
      title: 'The <span class="serif">live</span> preview',
      idx: "6 projects — demo, real sites & products — navigate with the arrows",
      liveBadge: "live demo",
      imageBadge: "real screenshot",
      hint: "nothing to install — click, try",
      load: "Load the preview",
      open: "Open the site",
      embedUnavailable: "Embedded preview unavailable for this site — open it in a new tab.",
      notePre: "The preview did not load here — ",
      noteLink: "open the site in a new tab ↗",
      iframeTitle: "Live preview",
    },
    pnav: {
      group: "Choose a project",
      prev: "Previous project",
      next: "Next project",
    },
    flow: {
      howLabel: "how it works",
    },
    arch: {
      title: 'The <span class="serif">architecture</span>, made plain',
      idx: "each application's real journey — project by project",
      groupLabel: "Choose the architecture diagram",
      zoomLabel: "Zoom controls",
      zoomIn: "Zoom in",
      zoomOut: "Zoom out",
      reset: "Reset view",
      viewportAria: "Architecture diagram. Use the buttons to zoom, the arrows to pan, the 0 key to reset.",
      hint: "buttons to zoom · drag to pan · keys + − 0 and arrows",
    },
    anatomy: {
      title: 'Anatomy of a <span class="serif">case study</span>',
      idx: "every project told, same structure",
      rows: [
        ["Hero", "The project's promise in one big sentence — before any technical detail."],
        ["Problem", "What the owner lives without a tool: the paper notebook, double bookings, the phone."],
        ["Solution", "The full journey, from the customer to the dashboard — told, not listed."],
        ["Features", "Every module with its real screenshot: booking, catalogue, orders, invoices."],
        ["Live preview", "The embedded demo, testable with nothing to install — or an “Open the site” button."],
        ["How it works", "The journey in phases: what the customer does, what the owner does, what runs under the hood."],
        ["CTA", "One button at the end: start a project of your own."],
      ],
    },
    manifesto: {
      title: 'The <span class="serif">manifesto</span>',
      idx: "stacklab.txt",
      body: `development studio — casablanca, morocco.

we don't sell brochure websites.
we build the site and the system behind it:
orders, reservations, schedules, catalogues, invoices.

the customer orders online.
the owner sees everything in a single dashboard.
no double bookings, no paper notebook.

always a demo first. you try it, then we deliver.
if the demo doesn't convince you, we stop there.

6 projects. 5 sectors. 2 own products. fr / en.`,
    },
    process: {
      title: 'How we <span class="serif">work</span>',
      idx: "4 steps, zero surprises",
      rows: [
        ['We <span class="serif">listen</span>', "One call, your constraints, your customers. No jargon, no blind quotes."],
        ['We build a <span class="serif">demo</span>', "You see your site working — with your dishes, your treatments, your vehicles — before paying anything."],
        ['You <span class="serif">test</span>', "In real conditions, with your team. We adjust until it fits the field."],
        ['We deliver & <span class="serif">train</span>', "The site live, the dashboard in your hands, team training included."],
      ],
    },
    contact: {
      title: 'Let\'s talk about<br><span class="serif">your project.</span>',
      note: "Reply within 24 hours.",
      megaCta: "Start a project",
      waText: "Hello StackLab, I'd like to discuss a project.",
      formTitle: "Or write to us directly",
      form: {
        name: "Name",
        namePh: "Your name",
        email: "Email",
        emailPh: "you@company.com",
        phone: "Phone",
        optional: "(optional)",
        message: "Message",
        messagePh: "Tell us about your business and what you're missing.",
        submit: "Send message",
        sending: "Sending…",
        success: "Message received — reply within 24 hours.",
        error: "Sending failed — please try again in a moment.",
        fallback: "The form is unavailable: email us directly instead.",
        fallbackLink: "Open your email app ↗",
      },
    },
    footer: {
      rights: "© 2026 StackLab",
      tagline: "Sites & systems — demo first, project next",
      top: "Back to top ↑",
    },
    waFloat: "Chat on WhatsApp",
    caseStudy: {
      back: "All projects",
      typeBadge: { demo: "Demo", own: "Own product" },
      problemIdx: "02 — The problem",
      problemTitle: 'The <span class="serif">problem</span>',
      solutionIdx: "03 — The solution",
      solutionTitle: 'The <span class="serif">solution</span>',
      featuresIdx: "04 — Features",
      featuresTitle: 'Key <span class="serif">features</span>',
      liveIdx: "05 — Live preview",
      liveTitle: 'The <span class="serif">live</span> preview',
      archIdx: "06 — How it works",
      archTitle: 'How it <span class="serif">works</span>',
      archTitleText: "How it works — the detailed journey, phase by phase",
      ctaTitle: 'Let\'s start <span class="serif">your project.</span>',
      ctaNote: "Like these six projects — the demo first, the project next.",
      openSite: "Open the site",
      loadPreview: "Load the preview",
      hint: "nothing to install — click, try",
      notePre: "The preview did not load here — ",
      noteLink: "open the site in a new tab ↗",
      withheldNote: "The public link will go live with the official launch — write to us for a private walkthrough.",
      withheldCta: "Request a private walkthrough",
      prev: "Previous project",
      next: "Next project",
      screenshotAlt: "Website screenshot",
      waText: "Hello StackLab, I saw the {name} project — I want the same for my business.",
    },
    seo: {
      home: {
        title: "StackLab — Websites & dashboards for SMEs | Casablanca",
        description: "Development studio in Casablanca: websites that bring you clients and dashboards that run your business. 6 projects, 5 sectors. The demo first, the project next.",
      },
      caseTitleSuffix: "— Case study | StackLab",
      caseDescription: (summary: string) => summary,
    },
    ogLocale: "en_US",
    ogLocaleAlt: "fr_FR",
  },
} as const;

export type Dict = (typeof t)["fr"];

// Tags are stored once (French) in the drafts; map for EN display.
const TAG_EN: Record<string, string> = {
  "Prise de RDV en ligne": "Online booking",
  "Tableau de bord": "Dashboard",
  "Tableau de bord temps réel": "Realtime dashboard",
  "Paiement/Contrats PDF": "Payments / PDF contracts",
  "Démo": "Demo",
  "Commande en ligne": "Online ordering",
  "Plan 2D interactif": "Interactive 2D floor plan",
  "Plats cuisinés": "Ready-to-eat meals",
  "Catalogue en ligne": "Online catalogue",
  "Recherche par référence": "Reference search",
  "Industrie": "Industry",
  "Maroc": "Morocco",
  "Extension navigateur": "Browser extension",
  "IA": "AI",
  "Produit": "Product",
  "E-commerce": "E-commerce",
};

export function tagLabel(tag: string, locale: Locale): string {
  if (locale === "en") return TAG_EN[tag] ?? tag;
  return tag;
}
