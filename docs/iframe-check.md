# iframe-check.md — STEP 0 verification (P0)

Date : 2026-10-02. Méthode : `curl -sI -L` + `curl -s -D -` (GET) sur les 6 domaines. Tous répondent `200 OK`.

| Domaine | Status | X-Frame-Options | CSP frame-ancestors | `iframe_embeddable` | Stratégie case-study |
|---|---|---|---|---|---|
| `cabinet-lahyani.vercel.app/fr` | 200 | `SAMEORIGIN` | `'self'` | ❌ **false** | Galerie screenshots + bouton « Ouvrir le site » |
| `auradrive-pi.vercel.app` | 200 | — | — | ✅ **true** | Iframe click-to-load dans mockup bar |
| `restaurant-app-liart-seven.vercel.app` | 200 | — | — | ✅ **true** | Iframe click-to-load dans mockup bar |
| `www.kfresh.ca` | 200 | — | — | ✅ **true** | Iframe click-to-load dans mockup bar (permission client accordée) |
| `sigmaparts.ma` | 200 | `SAMEORIGIN` | — | ❌ **false** | Galerie screenshots + bouton « Ouvrir le site » (permission client accordée pour screenshots) |
| `promptifyapp.com` | 200 | `SAMEORIGIN` | — | ❌ **false** | Galerie screenshots + bouton « Ouvrir le site » — ⚠️ footer « © aysobeka » : lien live à activer seulement après correction (R1) |

**Note technique :** les 3 domaines « true » n'envoient AUCUN header de frame restriction — l'embed marchera. Mais ces headers peuvent changer (redéploiement, ajout de middleware de sécurité). Recommandation : re-vérifier les 6 domaines à chaque release du site (script `scripts/check-iframes.sh` committé, exécutable en CI ou manuellement avant deploy) et fallback automatique : si l'iframe échoue au chargement (timeout 8s / erreur), afficher la galerie screenshots.

**Garde-fou case-study :** le composant `BrowserMockup.astro` doit gérer les 2 modes via le flag `iframeEmbeddable` venant de l'API — jamais d'iframe codée en dur.
