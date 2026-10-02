"use client";

import { useEffect, useState } from "react";
import { SettingsRow, apiGet, apiSend } from "@/lib/api";

const inputCls =
  "w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm outline-none focus:border-accent";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsRow | null>(null);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      const data = await apiGet<{ settings: SettingsRow }>(
        "/api/admin/settings",
      );
      setSettings(data.settings);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setNotice(null);
    try {
      const data = await apiSend<{ settings: SettingsRow }>(
        "/api/admin/settings",
        "PUT",
        {
          whatsappNumber: settings.whatsappNumber || null,
          instagramUrl: settings.instagramUrl || null,
          linkedinUrl: settings.linkedinUrl || null,
          publicEmail: settings.publicEmail || null,
          notifyEmail: settings.notifyEmail || null,
        },
      );
      setSettings(data.settings);
      setNotice({ ok: true, text: "Réglages enregistrés." });
    } catch (err) {
      const e = err as { fields?: Record<string, string[]>; message?: string };
      setNotice({
        ok: false,
        text: e.fields
          ? `Validation : ${Object.entries(e.fields)
              .map(([k, v]) => `${k}: ${v.join(", ")}`)
              .join(" · ")}`
          : (e.message ?? "Échec de l'enregistrement"),
      });
    } finally {
      setSaving(false);
    }
  }

  async function testEmail() {
    setTesting(true);
    setNotice(null);
    try {
      await apiSend("/api/admin/settings/test-email", "POST");
      setNotice({
        ok: true,
        text: "Email de test envoyé — vérifiez la boîte de réception.",
      });
    } catch (err) {
      const e = err as { error?: string; message?: string };
      setNotice({
        ok: false,
        text: `Échec de l'envoi (${e.error ?? "unknown"}): ${e.message ?? ""}`,
      });
    } finally {
      setTesting(false);
    }
  }

  if (!settings) return <p className="text-muted">Chargement…</p>;

  function field<K extends keyof SettingsRow>(
    key: K,
    label: string,
    placeholder: string,
    type = "text",
  ) {
    return (
      <label key={key}>
        <span className="mb-1 block text-sm font-semibold">{label}</span>
        <input
          type={type}
          value={(settings![key] as string | null) ?? ""}
          onChange={(e) =>
            setSettings({ ...settings!, [key]: e.target.value || null })
          }
          placeholder={placeholder}
          className={inputCls}
        />
        <span className="mt-1 block text-xs text-muted">
          Optionnel — laissé vide, le lien n'est pas rendu sur le site.
        </span>
      </label>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">Réglages</h1>

      {notice && (
        <p
          className={`mb-4 rounded-lg border p-3 text-sm ${
            notice.ok
              ? "border-green-500/40 text-green-600 dark:text-green-400"
              : "border-red-500/40 text-red-500"
          }`}
        >
          {notice.text}
        </p>
      )}

      <form onSubmit={save} className="space-y-5">
        <div className="space-y-4 rounded-2xl border border-border bg-bg-2 p-5">
          <h2 className="font-bold">Réseaux sociaux (pied de page du site)</h2>
          {field("whatsappNumber", "WhatsApp", "2126XXXXXXXX")}
          {field("instagramUrl", "Instagram", "https://instagram.com/…")}
          {field("linkedinUrl", "LinkedIn", "https://linkedin.com/company/…")}
          {field("publicEmail", "Email public", "contact@…")}
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-bg-2 p-5">
          <h2 className="font-bold">Notifications</h2>
          {field(
            "notifyEmail",
            "Email de notification (Resend)",
            "team@…",
            "email",
          )}
          <div>
            <button
              type="button"
              onClick={testEmail}
              disabled={testing}
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:border-accent disabled:opacity-50"
            >
              {testing ? "Envoi…" : "Tester l'envoi Resend"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2.5 font-semibold text-accent-text hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
