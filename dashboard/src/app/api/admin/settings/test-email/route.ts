import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";
import { sendContactNotification } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/admin/settings/test-email — sends a test notification via Resend
 * to notifyEmail (DB) falling back to CONTACT_EMAIL_TO (env).
 */
export async function POST() {
  const [settings] = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, 1));

  const to = settings?.notifyEmail || process.env.CONTACT_EMAIL_TO;
  if (!to) {
    return NextResponse.json(
      { error: "not_configured", message: "Aucun email de notification configuré" },
      { status: 400 },
    );
  }

  const result = await sendContactNotification({
    name: "StackLab Dashboard",
    email: to,
    phone: null,
    message:
      "Ceci est un email de test envoyé depuis les réglages du dashboard StackLab. Si vous le lisez, la configuration Resend fonctionne.",
    locale: "fr",
  });

  if (!result.sent) {
    return NextResponse.json(
      { error: "send_failed", message: result.error ?? "unknown" },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
