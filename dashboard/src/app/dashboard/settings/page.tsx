"use client";

import { useEffect, useState } from "react";
import { SettingsRow, apiGet, apiSend } from "@/lib/api";

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
        <span className="field-label">{label}</span>
        <input
          type={type}
          value={(settings![key] as string | null) ?? ""}
          onChange={(e) =>
            setSettings({ ...settings!, [key]: e.target.value || null })
          }
          placeholder={placeholder}
          className="input-field"
        />
        <span className="mono mt-1 block text-[0.7rem] text-muted">
          Optionnel — laissé vide, le lien n'est pas rendu sur le site.
        </span>
      </label>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <p className="kicker mb-3">Configuration — accès sécurisé</p>
        <h1 className="page-title text-4xl">
          Ré<span className="serif-it">glages</span>
        </h1>
      </div>

      {notice && (
        <p className="notice mb-4" role="status">
          {notice.text}
        </p>
      )}

      <form onSubmit={save} className="space-y-5">
        <div className="card space-y-4 p-5">
          <h2 className="mono text-[0.78rem] uppercase tracking-[0.16em]">
            Réseaux sociaux (pied de page du site)
          </h2>
          {field("whatsappNumber", "WhatsApp", "2126XXXXXXXX")}
          {field("instagramUrl", "Instagram", "https://instagram.com/…")}
          {field("linkedinUrl", "LinkedIn", "https://linkedin.com/company/…")}
          {field("publicEmail", "Email public", "contact@…")}
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="mono text-[0.78rem] uppercase tracking-[0.16em]">
            Notifications
          </h2>
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
              className="btn-wipe"
            >
              {testing ? "Envoi…" : "Tester l'envoi Resend"}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-solid"
        >
          {saving ? "Enregistrement…" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
