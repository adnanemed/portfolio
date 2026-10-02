import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { corsHeaders, preflightResponse } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_CONTROL = "s-maxage=300, stale-while-revalidate=86400";

export function OPTIONS(req: Request) {
  return preflightResponse(req);
}

// GET /api/public/site — socials for the site footer / WhatsApp CTA.
export async function GET(req: Request) {
  const [settings] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));

  const body = {
    socials: {
      whatsapp: settings?.whatsappNumber ?? null,
      instagram: settings?.instagramUrl ?? null,
      linkedin: settings?.linkedinUrl ?? null,
      email: settings?.publicEmail ?? null,
    },
  };

  return NextResponse.json(body, {
    headers: { "Cache-Control": CACHE_CONTROL, ...corsHeaders(req) },
  });
}
