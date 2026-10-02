import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(), // "lahyani", "auradrive", "kfresh", "sigmaparts", "saveur-charme", "promptifyapp"
  status: text("status").notNull().default("draft"), // "draft" | "published"
  type: text("type").notNull().default("client"), // "client" | "demo" | "own"
  featured: boolean("featured").notNull().default(false), // 2 max (app-level check)
  orderIndex: integer("order_index").notNull().default(0),

  nameFr: text("name_fr").notNull(),
  nameEn: text("name_en").notNull(),
  sectorFr: text("sector_fr").notNull(),
  sectorEn: text("sector_en").notNull(),
  summaryFr: text("summary_fr").notNull().default(""),
  summaryEn: text("summary_en").notNull().default(""),
  problemFr: text("problem_fr").notNull().default(""),
  problemEn: text("problem_en").notNull().default(""),
  solutionFr: text("solution_fr").notNull().default(""),
  solutionEn: text("solution_en").notNull().default(""),

  featuresFr: jsonb("features_fr")
    .$type<{ title: string; body: string }[]>()
    .notNull()
    .default([]),
  featuresEn: jsonb("features_en")
    .$type<{ title: string; body: string }[]>()
    .notNull()
    .default([]),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  metrics: jsonb("metrics")
    .$type<
      {
        labelFr: string;
        labelEn: string;
        value: string;
        suffix?: string;
        confirmed: boolean;
      }[]
    >()
    .notNull()
    .default([]),

  liveUrl: text("live_url"), // required to publish
  iframeEmbeddable: boolean("iframe_embeddable").notNull().default(false),
  fallbackScreenshots: jsonb("fallback_screenshots")
    .$type<string[]>()
    .notNull()
    .default([]), // Blob URLs
  architectureImage: text("architecture_image"), // Blob URL (optional)
  architectureCaptionFr: text("architecture_caption_fr").notNull().default(""),
  architectureCaptionEn: text("architecture_caption_en").notNull().default(""),

  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  locale: text("locale").notNull().default("fr"),
  status: text("status").notNull().default("unread"), // "unread" | "read" | "archived"
  ipHash: text("ip_hash"), // SHA-256(ip + salt), never the raw IP
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  readAt: timestamp("read_at", { withTimezone: true }),
});

export const siteSettings = pgTable("site_settings", {
  id: integer("id").primaryKey().default(1), // singleton
  whatsappNumber: text("whatsapp_number"), // international format "2126XXXXXXXX"
  instagramUrl: text("instagram_url"),
  linkedinUrl: text("linkedin_url"),
  publicEmail: text("public_email"),
  notifyEmail: text("notify_email"), // Resend notification target (fallback: env)
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
