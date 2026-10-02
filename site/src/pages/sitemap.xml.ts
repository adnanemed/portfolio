// Sitemap — 14 URLs (2 homes + 12 case studies), locale alternates.
import type { APIRoute } from "astro";
import { SITE_URL, projects } from "@/lib/site";

export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  const url = (loc: string, altFr: string, altEn: string) => `
  <url>
    <loc>${SITE_URL}${loc}</loc>
    <lastmod>${today}</lastmod>
    <xhtml:link rel="alternate" hreflang="fr" href="${SITE_URL}${altFr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${SITE_URL}${altEn}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_URL}${altFr}"/>
  </url>`;

  const urls = [
    url("/", "/", "/en/"),
    url("/en/", "/", "/en/"),
    ...projects.flatMap((p) => [
      url(`/projets/${p.slug}/`, `/projets/${p.slug}/`, `/en/projects/${p.slug}/`),
      url(`/en/projects/${p.slug}/`, `/projets/${p.slug}/`, `/en/projects/${p.slug}/`),
    ]),
  ].join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
