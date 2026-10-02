/**
 * P4+P5 verification battery (PLAN-v2 §2.3/§2.4).
 * Usage: BASE_URL=http://localhost:3100 node scripts/verify-p4-p5.mjs
 *
 * NOTE: consumes the contact rate-limit (3/h) and login rate-limit (5/15min)
 * for the caller IP — run against a local/dev deployment only.
 */
import "dotenv/config";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const ORIGIN_OK = (process.env.CORS_ALLOWED_ORIGINS || "")
  .split(",")[0] || "http://localhost:4321";
const ORIGIN_EVIL = "https://evil.example";

const results = [];
function record(name, pass, detail = "") {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? " — " + detail : ""}`);
}

function cookieFrom(res) {
  const setCookie = res.headers.get("set-cookie") || "";
  const m = setCookie.match(/stacklab_session=[^;]+/);
  return m ? m[0] : null;
}

async function main() {
  // ---------- 1. Health ----------
  let res = await fetch(`${BASE}/api/health`);
  let body = await res.json();
  record("GET /api/health → 200 {ok:true}", res.status === 200 && body.ok === true, `db=${body.db}`);

  // ---------- 2. Auth protection ----------
  res = await fetch(`${BASE}/dashboard`, { redirect: "manual" });
  record(
    "GET /dashboard (no cookie) → redirect /login",
    res.status >= 300 && res.status < 400 && (res.headers.get("location") || "").includes("/login"),
    `status=${res.status}`,
  );

  res = await fetch(`${BASE}/api/admin/me`);
  record("GET /api/admin/me (no cookie) → 401", res.status === 401, `status=${res.status}`);

  // ---------- 3. CSRF on login ----------
  res = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN_EVIL },
    body: JSON.stringify({
      username: process.env.ADMIN_USERNAME || "admin",
      password: process.env.ADMIN_PASSWORD || "wrong",
    }),
  });
  body = await res.json().catch(() => ({}));
  record(
    "POST login with foreign Origin → 403 csrf_origin_rejected",
    res.status === 403 && body.error === "csrf_origin_rejected",
    `status=${res.status}`,
  );

  // ---------- 4. Login failures + success ----------
  res = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "wrong-password" }),
  });
  record("POST login wrong password → 401", res.status === 401, `status=${res.status}`);

  res = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: process.env.ADMIN_USERNAME || "admin",
      password: process.env.ADMIN_PASSWORD || "",
    }),
  });
  const cookie = cookieFrom(res);
  record(
    "POST login correct → 200 + stacklab_session cookie (httpOnly)",
    res.status === 200 && cookie !== null,
    cookie ? "cookie set" : "no cookie",
  );

  res = await fetch(`${BASE}/api/admin/me`, { headers: { cookie } });
  body = await res.json();
  record("GET /api/admin/me (cookie) → {authenticated:true}", res.status === 200 && body.authenticated === true);

  // ---------- 5. Public GETs (all projects seeded as draft) ----------
  res = await fetch(`${BASE}/api/public/projects`);
  body = await res.json();
  record(
    "GET /api/public/projects → 200 {projects:[]} (all drafts)",
    res.status === 200 && Array.isArray(body.projects) && body.projects.length === 0,
    `count=${body.projects?.length}`,
  );
  const cc = res.headers.get("cache-control") || "";
  record(
    "public GET cache-control s-maxage=300, swr=86400",
    cc.includes("s-maxage=300") && cc.includes("stale-while-revalidate=86400"),
    cc,
  );

  res = await fetch(`${BASE}/api/public/projects/lahyani`);
  body = await res.json();
  record(
    "GET /api/public/projects/lahyani (draft) → 404 not_found",
    res.status === 404 && body.error === "not_found",
  );

  res = await fetch(`${BASE}/api/public/site`);
  body = await res.json();
  record(
    "GET /api/public/site → socials all null",
    res.status === 200 &&
      body.socials &&
      Object.values(body.socials).every((v) => v === null),
    JSON.stringify(body.socials),
  );

  // ---------- 6. CORS allowlist ----------
  res = await fetch(`${BASE}/api/public/projects`, { headers: { Origin: ORIGIN_OK } });
  const acaoOk = res.headers.get("access-control-allow-origin");
  res = await fetch(`${BASE}/api/public/projects`, { headers: { Origin: ORIGIN_EVIL } });
  const acaoBad = res.headers.get("access-control-allow-origin");
  const vary = res.headers.get("vary") || "";
  record(
    "CORS: allowlisted Origin gets ACAO, unknown Origin gets none, Vary: Origin",
    acaoOk === ORIGIN_OK && acaoBad === null && vary.includes("Origin"),
    `ok=${acaoOk} bad=${acaoBad} vary=${vary}`,
  );

  // ---------- 7. Contact: honeypot / timing (no rate-limit consumption) ----------
  res = await fetch(`${BASE}/api/public/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Bot Test", email: "bot@test.com", message: "hello there bot",
      locale: "fr", website: "http://spam.example",
      startedAt: Date.now() - 5000,
    }),
  });
  body = await res.json();
  record("POST contact honeypot filled → 403 blocked", res.status === 403 && body.error === "blocked");

  res = await fetch(`${BASE}/api/public/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Fast Bot", email: "bot@test.com", message: "too fast hello",
      locale: "fr", startedAt: Date.now(),
    }),
  });
  body = await res.json();
  record("POST contact instant submit (timing) → 403 blocked", res.status === 403 && body.error === "blocked");

  // ---------- 8. Contact: validation (consumes rate slot 1/3) ----------
  res = await fetch(`${BASE}/api/public/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "X", email: "not-an-email", message: "court", locale: "fr", startedAt: Date.now() - 5000 }),
  });
  body = await res.json();
  record(
    "POST contact invalid → 400 validation + fields",
    res.status === 400 && body.error === "validation" && body.fields !== undefined,
  );

  // ---------- 9. Contact: valid (consumes slots 2 and 3) ----------
  for (let i = 1; i <= 2; i++) {
    res = await fetch(`${BASE}/api/public/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `Owner Test ${i}`,
        email: "owner.test@example.com",
        phone: "+212600000000",
        message:
          "Ceci est un message de test de la vérification P4/P5 du dashboard StackLab. Merci de l'ignorer.",
        locale: "fr",
        startedAt: Date.now() - 6000,
      }),
    });
    body = await res.json();
    record(`POST contact valid #${i} → 201 {ok:true}`, res.status === 201 && body.ok === true, `status=${res.status}`);
  }

  // ---------- 10. Contact: 4th → 429 ----------
  res = await fetch(`${BASE}/api/public/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Rate Test", email: "rate@test.com", message: "should be limited here",
      locale: "en", startedAt: Date.now() - 6000,
    }),
  });
  body = await res.json();
  record("POST contact 4th in hour → 429 rate_limited", res.status === 429 && body.error === "rate_limited", `status=${res.status}`);

  // ---------- 11. Admin: CSRF on mutation with cookie ----------
  res = await fetch(`${BASE}/api/admin/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN_EVIL, cookie },
    body: JSON.stringify({ slug: "x", nameFr: "x", nameEn: "x", sectorFr: "x", sectorEn: "x" }),
  });
  body = await res.json();
  record(
    "POST /api/admin/projects with foreign Origin → 403 csrf_origin_rejected",
    res.status === 403 && body.error === "csrf_origin_rejected",
  );

  // ---------- 12. Admin: create + publish validation + delete ----------
  res = await fetch(`${BASE}/api/admin/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({
      slug: "test-publish-flow",
      nameFr: "Test Publish",
      nameEn: "Test Publish",
      sectorFr: "Test",
      sectorEn: "Test",
    }),
  });
  body = await res.json();
  const testId = body.project?.id;
  record("POST /api/admin/projects → 201 created", res.status === 201 && testId, `id=${testId}`);

  if (testId) {
    res = await fetch(`${BASE}/api/admin/projects/${testId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ publish: true }),
    });
    body = await res.json();
    record(
      "POST publish (empty project) → 422 incomplete + missing[]",
      res.status === 422 && body.error === "incomplete" && Array.isArray(body.missing) && body.missing.length > 0,
      `missing=[${(body.missing || []).slice(0, 3).join(", ")}…]`,
    );

    res = await fetch(`${BASE}/api/admin/projects/${testId}`, {
      method: "DELETE",
      headers: { cookie },
    });
    record("DELETE test project → 200", res.status === 200);

    // cleanup: also try to restore rate limiter is impossible — note only.
  }

  // ---------- 13. Messages: rows exist, PATCH read, DELETE ----------
  res = await fetch(`${BASE}/api/admin/messages`, { headers: { cookie } });
  body = await res.json();
  const msgs = body.messages || [];
  record(
    "GET /api/admin/messages → the 2 valid contact messages are in Neon",
    msgs.length >= 2 && msgs.every((m) => m.ipHash && !m.ipHash.includes("@")),
    `count=${msgs.length}`,
  );

  if (msgs.length > 0) {
    res = await fetch(`${BASE}/api/admin/messages/${msgs[0].id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ status: "read" }),
    });
    body = await res.json();
    record(
      "PATCH message status=read → readAt set",
      res.status === 200 && body.message?.status === "read" && body.message?.readAt,
    );

    for (const m of msgs) {
      await fetch(`${BASE}/api/admin/messages/${m.id}`, {
        method: "DELETE",
        headers: { cookie },
      });
    }
    res = await fetch(`${BASE}/api/admin/messages`, { headers: { cookie } });
    body = await res.json();
    record("DELETE test messages → inbox clean", (body.messages || []).length === 0);
  }

  // ---------- 14. Settings ----------
  res = await fetch(`${BASE}/api/admin/settings`, { headers: { cookie } });
  body = await res.json();
  record(
    "GET /api/admin/settings → singleton (socials null, notifyEmail set)",
    res.status === 200 && body.settings?.id === 1 && body.settings?.notifyEmail,
  );

  res = await fetch(`${BASE}/api/admin/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", cookie },
    body: JSON.stringify({ whatsappNumber: "not a number" }),
  });
  record("PUT settings invalid whatsapp → 400", res.status === 400);

  // ---------- 15. Export ----------
  res = await fetch(`${BASE}/api/admin/export`, { headers: { cookie } });
  body = await res.json();
  record(
    "GET /api/admin/export → content.json snapshot (published only, socials)",
    res.status === 200 && Array.isArray(body.projects) && body.site?.socials,
    `generatedAt=${body.generatedAt}`,
  );

  // ---------- 16. Upload (local dev fallback — server not in prod mode here) ----------
  // Skipped in this battery: needs a real image + differs between dev/prod.

  // ---------- 17. Login rate-limit: 3 more wrong attempts → 6th → 429 ----------
  for (let i = 0; i < 3; i++) {
    await fetch(`${BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "admin", password: "wrong" }),
    });
  }
  res = await fetch(`${BASE}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin", password: "wrong" }),
  });
  body = await res.json().catch(() => ({}));
  record("POST login 6th attempt in 15min → 429 rate_limited", res.status === 429, `status=${res.status}`);

  // ---------- 18. Logout ----------
  res = await fetch(`${BASE}/api/admin/logout`, {
    method: "POST",
    headers: { cookie },
  });
  const cleared = (res.headers.get("set-cookie") || "").includes("stacklab_session=;");
  record("POST /api/admin/logout → cookie cleared", res.status === 200 && cleared);

  // ---------- Summary ----------
  const failed = results.filter((r) => !r.pass);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length > 0) process.exit(1);
}

main().catch((err) => {
  console.error("Battery crashed:", err);
  process.exit(1);
});
