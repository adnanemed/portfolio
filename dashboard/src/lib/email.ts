import { Resend } from "resend";

/**
 * Transactional email via Resend. Contact flow inserts into Neon FIRST,
 * then sends — a Resend failure must never lose the message (R7).
 */
export type ContactEmail = {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  locale: string;
};

export async function sendContactNotification(
  contact: ContactEmail,
): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_EMAIL_TO;
  if (!apiKey || !to) {
    console.warn(
      "[email] RESEND_API_KEY or CONTACT_EMAIL_TO missing — skipping send",
    );
    return { sent: false, error: "not_configured" };
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const subject =
    contact.locale === "en"
      ? `New contact message — ${contact.name}`
      : `Nouveau message de contact — ${contact.name}`;

  const lines = [
    contact.locale === "en"
      ? `New message from the StackLab website contact form:`
      : `Nouveau message reçu depuis le formulaire de contact StackLab :`,
    "",
    `Nom / Name : ${contact.name}`,
    `Email : ${contact.email}`,
    contact.phone ? `Téléphone / Phone : ${contact.phone}` : null,
    "",
    contact.message,
    "",
    `— StackLab notifications`,
  ].filter((l): l is string => l !== null);

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from,
      to: [to],
      replyTo: contact.email,
      subject,
      text: lines.join("\n"),
    });
    if (result.error) {
      console.error("[email] Resend API error:", result.error);
      return { sent: false, error: result.error.message };
    }
    return { sent: true };
  } catch (err) {
    console.error("[email] Resend threw:", err);
    return { sent: false, error: String(err) };
  }
}
