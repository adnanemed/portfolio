// Contact form client logic — POST to the dashboard public API.
// Honeypot ("website") + startedAt min-fill-time, both checked server-side.
// States: idle → sending → success | error (+ email fallback link).
// All copy comes from data-* attributes set by the Astro component.

interface FormStrings {
  sending: string;
  success: string;
  error: string;
  fallback: string;
  fallbackLink: string;
}

const STR: Record<string, FormStrings> = {
  fr: {
    sending: "Envoi…",
    success: "Message reçu — réponse sous 24h.",
    error: "L'envoi a échoué — réessayez dans un instant.",
    fallback: "Le formulaire est indisponible : écrivez-nous directement par email.",
    fallbackLink: "Ouvrir votre application email ↗",
  },
  en: {
    sending: "Sending…",
    success: "Message received — reply within 24 hours.",
    error: "Sending failed — please try again in a moment.",
    fallback: "The form is unavailable: email us directly instead.",
    fallbackLink: "Open your email app ↗",
  },
};

export function initContactForm(): void {
  const form = document.getElementById("contactForm") as HTMLFormElement | null;
  if (!form) return;

  const status = form.querySelector<HTMLElement>("#cf-status")!;
  const submit = form.querySelector<HTMLButtonElement>("#cf-submit")!;
  const locale = form.getAttribute("data-locale") === "en" ? "en" : "fr";
  const apiBase = (
    form.getAttribute("data-api-base") ||
    import.meta.env.PUBLIC_API_BASE_URL ||
    (import.meta.env.DEV ? "http://localhost:3000" : "https://stacklab-admin.vercel.app")
  ).replace(/\/+$/, "");
  const startedAt = Date.now();
  const s = STR[locale];

  const setStatus = (html: string, cls: "ok" | "err") => {
    status.innerHTML = html;
    status.className = "form-status " + cls;
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!apiBase) {
      setStatus(s.error + " " + s.fallback, "err");
      return;
    }

    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      email: (form.elements.namedItem("email") as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem("phone") as HTMLInputElement).value.trim() || undefined,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim(),
      website: (form.elements.namedItem("website") as HTMLInputElement).value,
      startedAt,
      locale,
    };

    // Cheap client-side guards mirroring the server (zod) rules.
    if (data.name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) || data.message.length < 10) {
      setStatus(s.error, "err");
      return;
    }

    submit.disabled = true;
    submit.setAttribute("aria-busy", "true");
    submit.firstChild!.textContent = s.sending + " ";
    setStatus("", "ok");

    try {
      const res = await fetch(apiBase + "/api/public/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        form.reset();
        setStatus(s.success, "ok");
      } else if (res.status === 429) {
        setStatus(
          locale === "fr"
            ? "Trop de tentatives — réessayez dans une heure ou écrivez-nous par email."
            : "Too many attempts — try again in an hour or email us instead.",
          "err"
        );
      } else {
        setStatus(s.error, "err");
      }
    } catch {
      // API unreachable — graceful fallback
      const emailLink = fallbackEmailLink();
      setStatus(s.fallback + (emailLink ? ` <a href="${emailLink}">${s.fallbackLink}</a>` : ""), "err");
    } finally {
      submit.disabled = false;
      submit.removeAttribute("aria-busy");
      submit.firstChild!.textContent = (locale === "fr" ? "Envoyer le message" : "Send message") + " ";
    }
  });
}

function fallbackEmailLink(): string | null {
  const email =
    document.querySelector<HTMLAnchorElement>("[data-public-email]")?.getAttribute("href") || null;
  return email;
}
