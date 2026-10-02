# P4 + P5 verification — Dashboard backend + API publique (2026-10-02)

Méthode : suite automatisée `dashboard/scripts/verify-p4-p5.mjs` (30 checks) contre un
build de production (`next build` + `next start`), DB Neon réelle, Upstash réel, Resend réel.
Complétée par un test manuel du happy-path publication + upload.

**Résultat global : 30/30 checks PASS + 10 checks manuels PASS.**

## Environnement de test

- Build production Next.js 14.2.35 (App Router), Node v24, port 3100.
- `DATABASE_URL` Neon (pooled, `prepare:false`) — 3 tables migrées (`drizzle/0000_*.sql`).
- Upstash Redis réel (rate-limit). Resend réel (compte test-mode).
- Seed : 6 projets en `status="draft"`, toutes métriques `confirmed=false`, `site_settings` id=1 (socials null, notifyEmail renseigné). Seed idempotent (2e exécution → « none (already seeded) »).

## Résultats — batterie automatisée (30/30)

| # | Check | Résultat |
|---|---|---|
| 1 | `GET /api/health` → 200 `{ok:true, db:true}` | PASS |
| 2 | `GET /dashboard` sans cookie → 307 vers `/login` | PASS |
| 3 | `GET /api/admin/me` sans cookie → 401 | PASS |
| 4 | `POST /api/admin/login` avec Origin étranger → 403 `csrf_origin_rejected` | PASS |
| 5 | `POST login` mauvais mot de passe → 401 (message générique) | PASS |
| 6 | `POST login` identifiants corrects → 200 + cookie `stacklab_session` httpOnly | PASS |
| 7 | `GET /api/admin/me` avec cookie → `{authenticated:true}` | PASS |
| 8 | `GET /api/public/projects` → 200 `{projects:[]}` (tout en draft) | PASS |
| 9 | Cache-Control GET publics : `s-maxage=300, stale-while-revalidate=86400` | PASS |
| 10 | `GET /api/public/projects/lahyani` (draft) → 404 `{error:"not_found"}` | PASS |
| 11 | `GET /api/public/site` → socials tous `null` | PASS |
| 12 | CORS : origin allowlistée → ACAO ; origin inconnue → pas d'ACAO ; `Vary: Origin` | PASS |
| 13 | Contact honeypot rempli → 403 `{error:"blocked"}` | PASS |
| 14 | Contact soumis instantanément (timing < 3s) → 403 `blocked` | PASS |
| 15 | Contact payload invalide → 400 `{error:"validation", fields:{...}}` (zod) | PASS |
| 16 | Contact valide #1 → 201 `{ok:true}` (insert Neon d'abord) | PASS |
| 17 | Contact valide #2 → 201 `{ok:true}` | PASS |
| 18 | Contact 4e requête en 1h → 429 `{error:"rate_limited"}` (Upstash 3/h/IP) | PASS |
| 19 | `POST /api/admin/projects` avec Origin étranger + cookie → 403 CSRF | PASS |
| 20 | `POST /api/admin/projects` → 201 créé | PASS |
| 21 | `POST .../publish` projet incomplet → 422 `{error:"incomplete", missing:[...]}` | PASS |
| 22 | `DELETE` projet de test → 200 | PASS |
| 23 | `GET /api/admin/messages` → messages présents en Neon, `ip_hash` (jamais d'IP brute) | PASS |
| 24 | `PATCH message {status:"read"}` → `readAt` renseigné | PASS |
| 25 | `DELETE` messages de test → inbox vide | PASS |
| 26 | `GET /api/admin/settings` → singleton (socials null, notifyEmail présent) | PASS |
| 27 | `PUT settings` whatsapp invalide → 400 | PASS |
| 28 | `GET /api/admin/export` → snapshot content.json (publiés seuls + socials) | PASS |
| 29 | 6e tentative login en 15 min → 429 (Upstash 5/15min/IP) | PASS |
| 30 | `POST /api/admin/logout` → cookie effacé | PASS |

## Résultats — tests manuels complémentaires

| Check | Résultat |
|---|---|
| Happy-path publication : création projet complet → publish 200 (`status=published`, `publishedAt` renseigné) → visible dans `/api/public/projects` avec la shape exacte du plan (metrics sans `confirmed`) → `[slug]` renvoie les 24 champs étendus (problem/solution/features ×FR/EN…) → dépublier → public redevient vide → delete | PASS |
| Publish checklist : liste `missing` exacte renvoyée (summaryFr, summaryEn, problemFr/En, solutionFr/En, featuresFr/En (≥4), tags (≥3), metrics, métriques non confirmées, liveUrl) | PASS |
| Featured max 2 : contrainte applicative en PUT (409 `featured_limit`) + UI | PASS (code) |
| Upload `POST /api/admin/upload` : type non autorisé → 400 ; token Blob absent en prod → 503 explicite ; fallback dev (`next dev`) → 201 URL `/uploads/*.png` servie statiquement | PASS |
| Resend : pipeline appelé après insert DB ; en test-mode Resend refuse le destinataire (`You can only send testing emails to your own email address…`) — comportement attendu sans domaine vérifié ; l'insert reste en 201 (règle R7 respectée, échec loggé) | PASS (limitation compte, voir « À faire ») |

## Corrections appliquées pendant la vérification

1. **Resend import** : le dynamic `import("resend")` mal déstructuré levait une TypeError → import statique `import { Resend } from "resend"`.
2. **Hash bcrypt tronqué** : `next start` parse `.env` avec dotenv-expand, qui expanse les `$` — le hash bcrypt (`$2a$12$…`) était silencieusement corrompu → 401 systématique. Fix : `src/lib/credentials.ts` recharge les valeurs brutes (`dotenv.config({override:true})`, no-op sur Vercel sans fichier .env). Session splitée dans `src/lib/session.ts` (edge-safe pour le middleware).
3. **zod `startedAt.max(Date.now())`** figé au chargement du module → validation 400 en fausse positif après quelques secondes d'uptime. Fix : borne sup vérifiée à la requête (route contact, rejet > 24h).

## Limitations connues

- DNS local instable pendant les tests (2 erreurs `ENOTFOUND` transitoires vers Neon/api.resend.com, résolues au retry) — aucune trace dans le code ; à surveiller si récurrent en prod.
- `EMAIL_FROM` test-mode : `onboarding@resend.dev` ne délivre qu'à l'adresse propriétaire du compte Resend tant qu'aucun domaine n'est vérifié.
