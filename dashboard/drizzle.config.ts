import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Migrations run against DATABASE_URL (Neon pooled works for drizzle-kit;
// set DATABASE_URL_UNPOOLED locally for faster large migrations).
const url =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!url) {
  throw new Error("DATABASE_URL (or DATABASE_URL_UNPOOLED) is not set");
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
  strict: true,
  verbose: true,
});
