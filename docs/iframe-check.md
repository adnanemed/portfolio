# iframe-check.md — STEP 0 verification (live, re-checked 2026-10-03)

Méthode : `curl -sD -` sur les 6 domaines + test réel d'iframe dans le navigateur.

| Domaine | Status | X-Frame-Options | CSP frame-ancestors | `iframe_embeddable` | Stratégie |
|---|---|---|---|---|---|
| `auradrive-pi.vercel.app` | 200 | — | — | ✅ **true** | Iframe click-to-load |
| `restaurant-app-liart-seven.vercel.app` | 200 | — | — | ✅ **true** | Iframe click-to-load |
| `www.kfresh.ca` | 200 | — | — | ✅ **true** | Iframe click-to-load |
| `cabinet-lahyani.vercel.app` | 200 | *(supprimé)* | `'self' https://*.vercel.app https://*.stacklab.*` | ✅ **true** *(nouveau)* | Iframe click-to-load — **patché et redéployé le 2026-10-03** |
| `sigmaparts.ma` | 200 | `SAMEORIGIN` | — | ❌ false | Screenshots + « Ouvrir le site » — hébergement LiteSpeed, header à changer côté serveur (voir ci-dessous) |
| `promptifyapp.com` | 200 | `SAMEORIGIN` | — | ❌ false | Screenshots — patch `next.config.js` fourni, en attente de déploiement |

## Ce qui a été fait pour Lahyani

Le site envoyait `X-Frame-Options: SAMEORIGIN` **et** `frame-ancestors 'self'` dans
`apps/web/next.config.js` (bloc `securityHeaders`). Corrigé dans les deux sens :

- `X-Frame-Options` **supprimé** — ce header n'a pas de forme « autoriser ces origines »,
  il annulait donc l'autorlist `frame-ancestors` dans les navigateurs qui l'honorent encore.
- `frame-ancestors 'self' https://*.vercel.app https://*.stacklab.*` — le portfolio
  reste sur un sous-domaine `*.vercel.app` tant que R4 (domaine custom) n'est pas décidé.

Déploiement : `mijero/cabinet-lahyani`, rollback disponible sur
`https://cabinet-lahyani-jo7pxam2u-mijero.vercel.app`.
Vérifié : page 200, `<title>` intact, iframe 1327×830 réellement rendue.

**À faire quand le domaine custom sera acheté** : remplacer `https://*.vercel.app` par
le domaine exact dans `apps/web/next.config.js` → `PORTFOLIO_ORIGINS`, puis redéployer.

## Patches à appliquer pour les 2 sites restants

**PromptifyApp** (Vercel derrière Cloudflare) — dans `next.config.js`, supprimer la
ligne `X-Frame-Options` et ajouter `frame-ancestors` à la CSP existante :

```js
// 1. supprimer :  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
// 2. dans la valeur Content-Security-Policy, remplacer frame-ancestors 'self'
//    par :  frame-ancestors 'self' https://*.vercel.app https://*.stacklab.*
```

Le dashboard (`admin.cabinet-lahyani`, `admin.cabinet-lahyani`-like) doit **garder**
`X-Frame-Options: DENY` — seuls les sites publics sont framables.

**SigmaParts** (LiteSpeed / hébergement mutualisé) — `.htaccess` à la racine du site :

```apache
Header always unset X-Frame-Options
Header set Content-Security-Policy "frame-ancestors 'self' https://*.vercel.app https://*.stacklab.*"
```

Si l'hébergeur ne compile pas le module `mod_headers`, `Header set` échoue en silence :
contacter l'hébergeur pour désactiver « clickjacking protection » sur ce vhost.

## Garde-fou

Le composant `BrowserMockup.astro` lit toujours le flag `iframeEmbeddable` de l'API —
jamais d'iframe en dur. Si un site remet son header plus tard, la page retombe
automatiquement sur la galerie screenshots + bouton « Ouvrir le site ».