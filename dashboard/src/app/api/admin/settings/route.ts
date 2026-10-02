import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const settingsSchema = z.object({
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\+?[0-9]{6,20}$/, "format international attendu (ex. 2126XXXXXXXX)")
    .nullable()
    .optional(),
  instagramUrl: z.string().trim().url().max(300).nullable().optional(),
  linkedinUrl: z.string().trim().url().max(300).nullable().optional(),
  publicEmail: z.string().trim().email().max(200).nullable().optional(),
  notifyEmail: z.string().trim().email().max(200).nullable().optional(),
});

async function ensureSingleton() {
  const [existing] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));
  if (existing) return existing;
  const [created] = await db
    .insert(siteSettings)
    .values({
      id: 1,
      notifyEmail: process.env.CONTACT_EMAIL_TO || null,
    })
    .onConflictDoNothing()
    .returning();
  if (created) return created;
  const [row] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));
  return row;
}

// GET — read settings (creates the singleton on first access).
export async function GET() {
  const row = await ensureSingleton();
  return NextResponse.json({ settings: row });
}

// PUT — partial update; every social can be saved empty (null).
export async function PUT(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "validation", fields: { body: "invalid JSON" } },
      { status: 400 },
    );
  }

  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  await ensureSingleton();
  const patch = parsed.data;
  const [updated] = await db
    .update(siteSettings)
    .set({
      whatsappNumber:
        patch.whatsappNumber !== undefined
          ? patch.whatsappNumber
          : undefined,
      instagramUrl:
        patch.instagramUrl !== undefined ? patch.instagramUrl : undefined,
      linkedinUrl:
        patch.linkedinUrl !== undefined ? patch.linkedinUrl : undefined,
      publicEmail:
        patch.publicEmail !== undefined ? patch.publicEmail : undefined,
      notifyEmail:
        patch.notifyEmail !== undefined ? patch.notifyEmail : undefined,
      updatedAt: new Date(),
    })
    .where(eq(siteSettings.id, 1))
    .returning();

  return NextResponse.json({ settings: updated });
}
