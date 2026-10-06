// @ts-check
import { defineConfig } from "astro/config";

// Static output, dark-only monochrome design (approved preview v3).
// PUBLIC_SITE_URL is overridable at build time (Vercel project settings)
// so the canonical/sitemap survive a future domain swap (plan R4).
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || "https://stacklab-site.vercel.app",
  output: "static",
  trailingSlash: "ignore",
  devToolbar: {
    enabled: false,
  },
  build: {
    inlineStylesheets: "auto",
  },
});
