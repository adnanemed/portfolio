CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"message" text NOT NULL,
	"locale" text DEFAULT 'fr' NOT NULL,
	"status" text DEFAULT 'unread' NOT NULL,
	"ip_hash" text,
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"type" text DEFAULT 'client' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"order_index" integer DEFAULT 0 NOT NULL,
	"name_fr" text NOT NULL,
	"name_en" text NOT NULL,
	"sector_fr" text NOT NULL,
	"sector_en" text NOT NULL,
	"summary_fr" text DEFAULT '' NOT NULL,
	"summary_en" text DEFAULT '' NOT NULL,
	"problem_fr" text DEFAULT '' NOT NULL,
	"problem_en" text DEFAULT '' NOT NULL,
	"solution_fr" text DEFAULT '' NOT NULL,
	"solution_en" text DEFAULT '' NOT NULL,
	"features_fr" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"features_en" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"metrics" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"live_url" text,
	"iframe_embeddable" boolean DEFAULT false NOT NULL,
	"fallback_screenshots" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"architecture_image" text,
	"architecture_caption_fr" text DEFAULT '' NOT NULL,
	"architecture_caption_en" text DEFAULT '' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"whatsapp_number" text,
	"instagram_url" text,
	"linkedin_url" text,
	"public_email" text,
	"notify_email" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
