"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Feature,
  Metric,
  ProjectRow,
  apiSend,
  apiUpload,
  publishMissing,
} from "@/lib/api";

type Props =
  | { mode: "new" }
  | { mode: "edit"; project: ProjectRow };

const inputCls =
  "w-full rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm outline-none focus:border-accent";
const labelCls = "mb-1 block text-sm font-semibold";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details open className="rounded-2xl border border-border bg-bg-2">
      <summary className="cursor-pointer px-5 py-3 font-bold">
        {title}
      </summary>
      <div className="space-y-4 border-t border-border p-5">{children}</div>
    </details>
  );
}

function FeatureList({
  label,
  items,
  onChange,
}: {
  label: string;
  items: Feature[];
  onChange: (items: Feature[]) => void;
}) {
  return (
    <div>
      <p className={labelCls}>
        {label}{" "}
        <span className="font-normal text-muted">
          ({items.length} — minimum 4 pour publier)
        </span>
      </p>
      <div className="space-y-3">
        {items.map((f, i) => (
          <div key={i} className="rounded-xl border border-border p-3">
            <input
              value={f.title}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...f, title: e.target.value };
                onChange(next);
              }}
              placeholder="Titre"
              className={`${inputCls} mb-2 font-semibold`}
            />
            <textarea
              value={f.body}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...f, body: e.target.value };
                onChange(next);
              }}
              placeholder="Une phrase en langage business"
              rows={2}
              className={inputCls}
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="mt-2 text-xs text-red-500 hover:underline"
            >
              Retirer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, { title: "", body: "" }])}
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent"
        >
          + Ajouter
        </button>
      </div>
    </div>
  );
}

function MetricList({
  items,
  onChange,
}: {
  items: Metric[];
  onChange: (items: Metric[]) => void;
}) {
  return (
    <div>
      <p className={labelCls}>
        Métriques{" "}
        <span className="font-normal text-muted">
          (≥ 1 requise ; chaque métrique doit être confirmée pour publier)
        </span>
      </p>
      <div className="space-y-3">
        {items.map((m, i) => (
          <div
            key={i}
            className={`rounded-xl border p-3 ${
              m.confirmed ? "border-green-500/40" : "border-amber-500/40"
            }`}
          >
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                value={m.labelFr}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...m, labelFr: e.target.value };
                  onChange(next);
                }}
                placeholder="Libellé FR"
                className={inputCls}
              />
              <input
                value={m.labelEn}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...m, labelEn: e.target.value };
                  onChange(next);
                }}
                placeholder="Label EN"
                className={inputCls}
              />
              <input
                value={m.value}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...m, value: e.target.value };
                  onChange(next);
                }}
                placeholder="Valeur (ex. 24h/24)"
                className={inputCls}
              />
              <input
                value={m.suffix ?? ""}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...m, suffix: e.target.value };
                  onChange(next);
                }}
                placeholder="Suffixe (ex. /5)"
                className={inputCls}
              />
            </div>
            <div className="mt-2 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={m.confirmed}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...m, confirmed: e.target.checked };
                    onChange(next);
                  }}
                />
                <span className={m.confirmed ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}>
                  {m.confirmed ? "Confirmée ✓" : "Non confirmée (bloc la publication)"}
                </span>
              </label>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="ml-auto text-xs text-red-500 hover:underline"
              >
                Retirer
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange([
              ...items,
              { labelFr: "", labelEn: "", value: "", suffix: "", confirmed: false },
            ])
          }
          className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent"
        >
          + Ajouter une métrique
        </button>
      </div>
    </div>
  );
}

function ImageField({
  label,
  url,
  onChange,
}: {
  label: string;
  url: string | null;
  onChange: (url: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload(file: File) {
    setUploading(true);
    setErr(null);
    try {
      const data = await apiUpload<{ url: string }>("/api/admin/upload", file);
      onChange(data.url);
    } catch {
      setErr("Échec de l'upload (png/jpeg/webp, ≤ 2 MB).");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <p className={labelCls}>{label}</p>
      {url && (
        <p className="mb-1 truncate text-xs text-muted">
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
            {url}
          </a>
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
          }}
          className="text-sm"
        />
        {uploading && <span className="text-sm text-muted">Envoi…</span>}
        {url && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-red-500 hover:underline"
          >
            Retirer
          </button>
        )}
      </div>
      {err && <p className="mt-1 text-xs text-red-500">{err}</p>}
    </div>
  );
}

export default function ProjectForm(props: Props) {
  const router = useRouter();
  const initial: ProjectRow = useMemo(
    () =>
      props.mode === "edit"
        ? props.project
        : ({
            id: "",
            slug: "",
            status: "draft",
            type: "client",
            featured: false,
            orderIndex: 0,
            nameFr: "",
            nameEn: "",
            sectorFr: "",
            sectorEn: "",
            summaryFr: "",
            summaryEn: "",
            problemFr: "",
            problemEn: "",
            solutionFr: "",
            solutionEn: "",
            featuresFr: [],
            featuresEn: [],
            tags: [],
            metrics: [],
            liveUrl: null,
            iframeEmbeddable: false,
            fallbackScreenshots: [],
            architectureImage: null,
            architectureCaptionFr: "",
            architectureCaptionEn: "",
            publishedAt: null,
            createdAt: "",
            updatedAt: "",
          } as ProjectRow),
    [props],
  );

  const [p, setP] = useState<ProjectRow>(initial);
  const [tagsInput, setTagsInput] = useState(initial.tags.join(", "));
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ProjectRow>(key: K, value: ProjectRow[K]) {
    setP((prev) => ({ ...prev, [key]: value }));
  }

  const missing = publishMissing(p);

  async function save(publishAfter = false) {
    setError(null);
    const payload = {
      slug: p.slug,
      type: p.type,
      featured: p.featured,
      orderIndex: p.orderIndex,
      nameFr: p.nameFr,
      nameEn: p.nameEn,
      sectorFr: p.sectorFr,
      sectorEn: p.sectorEn,
      summaryFr: p.summaryFr,
      summaryEn: p.summaryEn,
      problemFr: p.problemFr,
      problemEn: p.problemEn,
      solutionFr: p.solutionFr,
      solutionEn: p.solutionEn,
      featuresFr: p.featuresFr,
      featuresEn: p.featuresEn,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      metrics: p.metrics,
      liveUrl: p.liveUrl || null,
      iframeEmbeddable: p.iframeEmbeddable,
      fallbackScreenshots: p.fallbackScreenshots,
      architectureImage: p.architectureImage,
      architectureCaptionFr: p.architectureCaptionFr,
      architectureCaptionEn: p.architectureCaptionEn,
    };

    if (props.mode === "new") {
      setSaving(true);
      try {
        const data = await apiSend<{ project: ProjectRow }>(
          "/api/admin/projects",
          "POST",
          payload,
        );
        router.push(`/dashboard/projects/${data.project.id}/edit`);
      } catch (err) {
        const e = err as { fields?: Record<string, string[]>; message?: string };
        setError(
          e.fields
            ? `Validation : ${Object.entries(e.fields)
                .map(([k, v]) => `${k}: ${v.join(", ")}`)
                .join(" · ")}`
            : (e.message ?? "Échec de l'enregistrement"),
        );
      } finally {
        setSaving(false);
      }
      return;
    }

    setSaving(true);
    try {
      await apiSend<{ project: ProjectRow }>(
        `/api/admin/projects/${props.project.id}`,
        "PUT",
        payload,
      );
      if (publishAfter) {
        setPublishing(true);
        await apiSend(
          `/api/admin/projects/${props.project.id}/publish`,
          "POST",
          { publish: true },
        );
        setPublishing(false);
      }
      router.push("/dashboard/projects");
      router.refresh();
    } catch (err) {
      const e = err as {
        fields?: Record<string, string[]>;
        message?: string;
        missing?: string[];
        status?: number;
      };
      if (e.status === 422 && e.missing) {
        setError(`À valider avant publication : ${e.missing.join(", ")}`);
      } else if (e.status === 409) {
        setError(e.message ?? "Conflit — réessayez.");
      } else {
        setError(e.message ?? "Échec de l'enregistrement");
      }
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }

  const canPublish = missing.length === 0;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">
          {props.mode === "new" ? "Nouveau projet" : `Éditer — ${p.nameFr}`}
        </h1>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            p.status === "published"
              ? "bg-green-500/15 text-green-600 dark:text-green-400"
              : "bg-bg-2 text-muted"
          }`}
        >
          {p.status === "published" ? "publié" : "brouillon"}
        </span>
      </div>

      {error && (
        <p className="rounded-lg border border-border bg-bg-2 p-3 text-sm text-red-500">
          {error}
        </p>
      )}

      {/* Publish checklist */}
      <div
        className={`rounded-2xl border p-5 ${
          canPublish ? "border-green-500/40" : "border-amber-500/40"
        }`}
      >
        <p className="font-bold">
          {canPublish
            ? "✓ Prêt à publier — toutes les conditions sont réunies."
            : "À valider avant publication :"}
        </p>
        {!canPublish && (
          <ul className="mt-2 list-inside list-disc text-sm text-amber-600 dark:text-amber-400">
            {missing.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => save(false)}
            disabled={saving || publishing}
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:border-accent disabled:opacity-50"
          >
            {saving ? "Enregistrement…" : "Enregistrer"}
          </button>
          <button
            type="button"
            onClick={() => save(true)}
            disabled={saving || publishing || !canPublish}
            title={
              canPublish
                ? "Publier ce projet"
                : "Complétez la checklist pour activer la publication"
            }
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-text hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {publishing ? "Publication…" : "Publier"}
          </button>
        </div>
      </div>

      <Section title="Identification">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label>
            <span className={labelCls}>Slug (unique)</span>
            <input
              value={p.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase())}
              placeholder="lahyani"
              className={inputCls}
            />
          </label>
          <label>
            <span className={labelCls}>Type</span>
            <select
              value={p.type}
              onChange={(e) => set("type", e.target.value as ProjectRow["type"])}
              className={inputCls}
            >
              <option value="client">client</option>
              <option value="demo">demo</option>
              <option value="own">own</option>
            </select>
          </label>
          <label>
            <span className={labelCls}>Nom (FR)</span>
            <input
              value={p.nameFr}
              onChange={(e) => set("nameFr", e.target.value)}
              className={inputCls}
            />
          </label>
          <label>
            <span className={labelCls}>Name (EN)</span>
            <input
              value={p.nameEn}
              onChange={(e) => set("nameEn", e.target.value)}
              className={inputCls}
            />
          </label>
          <label>
            <span className={labelCls}>Secteur (FR)</span>
            <input
              value={p.sectorFr}
              onChange={(e) => set("sectorFr", e.target.value)}
              className={inputCls}
            />
          </label>
          <label>
            <span className={labelCls}>Sector (EN)</span>
            <input
              value={p.sectorEn}
              onChange={(e) => set("sectorEn", e.target.value)}
              className={inputCls}
            />
          </label>
          <label>
            <span className={labelCls}>Ordre d'affichage (orderIndex)</span>
            <input
              type="number"
              min={0}
              value={p.orderIndex}
              onChange={(e) => set("orderIndex", Number(e.target.value))}
              className={inputCls}
            />
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              checked={p.featured}
              onChange={(e) => set("featured", e.target.checked)}
            />
            <span>
              Vedette (hero) —{" "}
              <span className="text-muted">2 projets maximum</span>
            </span>
          </label>
        </div>
      </Section>

      <Section title="Contenu">
        <label>
          <span className={labelCls}>Résumé (FR)</span>
          <textarea
            rows={3}
            value={p.summaryFr}
            onChange={(e) => set("summaryFr", e.target.value)}
            className={inputCls}
          />
        </label>
        <label>
          <span className={labelCls}>Summary (EN)</span>
          <textarea
            rows={3}
            value={p.summaryEn}
            onChange={(e) => set("summaryEn", e.target.value)}
            className={inputCls}
          />
        </label>
        <label>
          <span className={labelCls}>Le problème (FR)</span>
          <textarea
            rows={4}
            value={p.problemFr}
            onChange={(e) => set("problemFr", e.target.value)}
            className={inputCls}
          />
        </label>
        <label>
          <span className={labelCls}>The problem (EN)</span>
          <textarea
            rows={4}
            value={p.problemEn}
            onChange={(e) => set("problemEn", e.target.value)}
            className={inputCls}
          />
        </label>
        <label>
          <span className={labelCls}>La solution (FR)</span>
          <textarea
            rows={4}
            value={p.solutionFr}
            onChange={(e) => set("solutionFr", e.target.value)}
            className={inputCls}
          />
        </label>
        <label>
          <span className={labelCls}>The solution (EN)</span>
          <textarea
            rows={4}
            value={p.solutionEn}
            onChange={(e) => set("solutionEn", e.target.value)}
            className={inputCls}
          />
        </label>
        <label>
          <span className={labelCls}>
            Tags{" "}
            <span className="font-normal text-muted">
              (séparés par des virgules — minimum 3)
            </span>
          </span>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Next.js, Tableau de bord, Réservation"
            className={inputCls}
          />
        </label>
      </Section>

      <Section title="Fonctionnalités & métriques">
        <FeatureList
          label="Fonctionnalités (FR)"
          items={p.featuresFr}
          onChange={(items) => set("featuresFr", items)}
        />
        <FeatureList
          label="Features (EN)"
          items={p.featuresEn}
          onChange={(items) => set("featuresEn", items)}
        />
        <MetricList items={p.metrics} onChange={(items) => set("metrics", items)} />
      </Section>

      <Section title="Médias & publication">
        <label>
          <span className={labelCls}>URL du site (requis pour publier)</span>
          <input
            value={p.liveUrl ?? ""}
            onChange={(e) => set("liveUrl", e.target.value || null)}
            placeholder="https://…"
            className={inputCls}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={p.iframeEmbeddable}
            onChange={(e) => set("iframeEmbeddable", e.target.checked)}
          />
          <span>
            Iframe intégrable{" "}
            <span className="text-muted">
              (sinon : galerie screenshots + bouton « Ouvrir le site »)
            </span>
          </span>
        </label>
        <ImageField
          label="Image architecture (optionnel)"
          url={p.architectureImage}
          onChange={(url) => set("architectureImage", url)}
        />
        <label>
          <span className={labelCls}>Légende architecture (FR)</span>
          <input
            value={p.architectureCaptionFr}
            onChange={(e) => set("architectureCaptionFr", e.target.value)}
            className={inputCls}
          />
        </label>
        <label>
          <span className={labelCls}>Architecture caption (EN)</span>
          <input
            value={p.architectureCaptionEn}
            onChange={(e) => set("architectureCaptionEn", e.target.value)}
            className={inputCls}
          />
        </label>
        <div>
          <p className={labelCls}>
            Screenshots de secours{" "}
            <span className="font-normal text-muted">
              (URLs — utilisées si iframeEmbeddable = false)
            </span>
          </p>
          <div className="space-y-2">
            {p.fallbackScreenshots.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={s}
                  onChange={(e) => {
                    const next = [...p.fallbackScreenshots];
                    next[i] = e.target.value;
                    set("fallbackScreenshots", next);
                  }}
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "fallbackScreenshots",
                      p.fallbackScreenshots.filter((_, j) => j !== i),
                    )
                  }
                  className="shrink-0 rounded-lg border border-border px-3 text-xs text-red-500 hover:border-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                set("fallbackScreenshots", [...p.fallbackScreenshots, ""])
              }
              className="rounded-lg border border-border px-3 py-1.5 text-sm hover:border-accent"
            >
              + Ajouter une URL screenshot
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
