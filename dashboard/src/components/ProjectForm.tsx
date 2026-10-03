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

function Section({
  idx,
  title,
  children,
}: {
  idx: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <details open className="card overflow-hidden">
      <summary className="flex cursor-pointer items-baseline gap-3 px-5 py-4">
        <span className="mono text-[0.68rem] tracking-[0.14em] text-muted">
          {idx}
        </span>
        <span className="mono text-[0.78rem] uppercase tracking-[0.16em]">
          {title}
        </span>
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
      <p className="field-label">
        {label}{" "}
        <span className="normal-case tracking-normal">
          ({items.length} — minimum 4 pour publier)
        </span>
      </p>
      <div className="space-y-3">
        {items.map((f, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <input
              value={f.title}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...f, title: e.target.value };
                onChange(next);
              }}
              placeholder="Titre"
              className={`${"input-field"} mb-2 font-semibold`}
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
              className="input-field"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="mono mt-2 text-[0.7rem] uppercase tracking-[0.12em] text-muted underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-text"
            >
              Retirer
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => onChange([...items, { title: "", body: "" }])}
          className="btn-ghost"
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
      <p className="field-label">
        Métriques{" "}
        <span className="normal-case tracking-normal">
          (≥ 1 requise ; chaque métrique doit être confirmée pour publier)
        </span>
      </p>
      <div className="space-y-3">
        {items.map((m, i) => (
          <div key={i} className="rounded-lg border border-border p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <input
                value={m.labelFr}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...m, labelFr: e.target.value };
                  onChange(next);
                }}
                placeholder="Libellé FR"
                className="input-field"
              />
              <input
                value={m.labelEn}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...m, labelEn: e.target.value };
                  onChange(next);
                }}
                placeholder="Label EN"
                className="input-field"
              />
              <input
                value={m.value}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...m, value: e.target.value };
                  onChange(next);
                }}
                placeholder="Valeur (ex. 24h/24)"
                className="input-field"
              />
              <input
                value={m.suffix ?? ""}
                onChange={(e) => {
                  const next = [...items];
                  next[i] = { ...m, suffix: e.target.value };
                  onChange(next);
                }}
                placeholder="Suffixe (ex. /5)"
                className="input-field"
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <label className="flex min-h-[36px] cursor-pointer items-center gap-2 font-mono text-[0.72rem]">
                <input
                  type="checkbox"
                  checked={m.confirmed}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = { ...m, confirmed: e.target.checked };
                    onChange(next);
                  }}
                />
                <span
                  className={`badge ${
                    m.confirmed ? "badge-solid" : "badge-outline"
                  }`}
                >
                  {m.confirmed ? "Confirmée ✓" : "Non confirmée (bloc la publication)"}
                </span>
              </label>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="mono ml-auto text-[0.7rem] uppercase tracking-[0.12em] text-muted underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-text"
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
          className="btn-ghost"
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
      <p className="field-label">{label}</p>
      {url && (
        <p className="mono mb-1 truncate text-[0.72rem] text-muted">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-text"
          >
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
          className="mono text-xs text-muted"
        />
        {uploading && <span className="mono text-xs text-muted">Envoi…</span>}
        {url && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="mono text-[0.7rem] uppercase tracking-[0.12em] text-muted underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-text"
          >
            Retirer
          </button>
        )}
      </div>
      {err && (
        <p className="mono mt-1 text-[0.72rem] text-muted" role="alert">
          {err}
        </p>
      )}
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
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker mb-3">
            {props.mode === "new" ? "Portfolio — création" : "Portfolio — édition"}
          </p>
          <h1 className="page-title text-4xl">
            {props.mode === "new" ? (
              <>
                Nouveau <span className="serif-it">projet</span>
              </>
            ) : (
              <>Éditer — {p.nameFr}</>
            )}
          </h1>
        </div>
        <span
          className={`badge ${
            p.status === "published" ? "badge-solid" : "badge-outline"
          }`}
        >
          {p.status === "published" ? "publié" : "brouillon"}
        </span>
      </div>

      {error && (
        <p className="notice" role="alert">
          {error}
        </p>
      )}

      {/* Publish checklist — mono list with checkbox-style markers */}
      <div className="card p-5">
        <p className="mono text-[0.78rem] uppercase tracking-[0.14em]">
          {canPublish
            ? "✓ Prêt à publier — toutes les conditions sont réunies."
            : "À valider avant publication :"}
        </p>
        {!canPublish && (
          <ul className="mono mt-3 space-y-1.5 text-[0.78rem] leading-relaxed text-muted">
            {missing.map((m) => (
              <li key={m} className="flex items-baseline gap-2">
                <span aria-hidden>□</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap gap-2.5">
          <button
            type="button"
            onClick={() => save(false)}
            disabled={saving || publishing}
            className="btn-wipe"
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
            className="btn-solid font-mono text-[0.72rem] uppercase tracking-[0.14em]"
          >
            {publishing ? "Publication…" : "Publier"}
          </button>
        </div>
      </div>

      <Section idx="01" title="Identification">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label>
            <span className="field-label">Slug (unique)</span>
            <input
              value={p.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase())}
              placeholder="lahyani"
              className="input-field"
            />
          </label>
          <label>
            <span className="field-label">Type</span>
            <select
              value={p.type}
              onChange={(e) => set("type", e.target.value as ProjectRow["type"])}
              className="input-field"
            >
              <option value="client">client</option>
              <option value="demo">demo</option>
              <option value="own">own</option>
            </select>
          </label>
          <label>
            <span className="field-label">Nom (FR)</span>
            <input
              value={p.nameFr}
              onChange={(e) => set("nameFr", e.target.value)}
              className="input-field"
            />
          </label>
          <label>
            <span className="field-label">Name (EN)</span>
            <input
              value={p.nameEn}
              onChange={(e) => set("nameEn", e.target.value)}
              className="input-field"
            />
          </label>
          <label>
            <span className="field-label">Secteur (FR)</span>
            <input
              value={p.sectorFr}
              onChange={(e) => set("sectorFr", e.target.value)}
              className="input-field"
            />
          </label>
          <label>
            <span className="field-label">Sector (EN)</span>
            <input
              value={p.sectorEn}
              onChange={(e) => set("sectorEn", e.target.value)}
              className="input-field"
            />
          </label>
          <label>
            <span className="field-label">Ordre d'affichage (orderIndex)</span>
            <input
              type="number"
              min={0}
              value={p.orderIndex}
              onChange={(e) => set("orderIndex", Number(e.target.value))}
              className="input-field"
            />
          </label>
          <label className="flex min-h-[44px] items-end gap-2 pb-2 text-sm">
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

      <Section idx="02" title="Contenu">
        <label>
          <span className="field-label">Résumé (FR)</span>
          <textarea
            rows={3}
            value={p.summaryFr}
            onChange={(e) => set("summaryFr", e.target.value)}
            className="input-field"
          />
        </label>
        <label>
          <span className="field-label">Summary (EN)</span>
          <textarea
            rows={3}
            value={p.summaryEn}
            onChange={(e) => set("summaryEn", e.target.value)}
            className="input-field"
          />
        </label>
        <label>
          <span className="field-label">Le problème (FR)</span>
          <textarea
            rows={4}
            value={p.problemFr}
            onChange={(e) => set("problemFr", e.target.value)}
            className="input-field"
          />
        </label>
        <label>
          <span className="field-label">The problem (EN)</span>
          <textarea
            rows={4}
            value={p.problemEn}
            onChange={(e) => set("problemEn", e.target.value)}
            className="input-field"
          />
        </label>
        <label>
          <span className="field-label">La solution (FR)</span>
          <textarea
            rows={4}
            value={p.solutionFr}
            onChange={(e) => set("solutionFr", e.target.value)}
            className="input-field"
          />
        </label>
        <label>
          <span className="field-label">The solution (EN)</span>
          <textarea
            rows={4}
            value={p.solutionEn}
            onChange={(e) => set("solutionEn", e.target.value)}
            className="input-field"
          />
        </label>
        <label>
          <span className="field-label">
            Tags{" "}
            <span className="normal-case tracking-normal">
              (séparés par des virgules — minimum 3)
            </span>
          </span>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Next.js, Tableau de bord, Réservation"
            className="input-field"
          />
        </label>
      </Section>

      <Section idx="03" title="Fonctionnalités & métriques">
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

      <Section idx="04" title="Médias & publication">
        <label>
          <span className="field-label">URL du site (requis pour publier)</span>
          <input
            value={p.liveUrl ?? ""}
            onChange={(e) => set("liveUrl", e.target.value || null)}
            placeholder="https://…"
            className="input-field"
          />
        </label>
        <label className="flex min-h-[44px] items-center gap-2 text-sm">
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
          <span className="field-label">Légende architecture (FR)</span>
          <input
            value={p.architectureCaptionFr}
            onChange={(e) => set("architectureCaptionFr", e.target.value)}
            className="input-field"
          />
        </label>
        <label>
          <span className="field-label">Architecture caption (EN)</span>
          <input
            value={p.architectureCaptionEn}
            onChange={(e) => set("architectureCaptionEn", e.target.value)}
            className="input-field"
          />
        </label>
        <div>
          <p className="field-label">
            Screenshots de secours{" "}
            <span className="normal-case tracking-normal">
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
                  className="input-field"
                />
                <button
                  type="button"
                  onClick={() =>
                    set(
                      "fallbackScreenshots",
                      p.fallbackScreenshots.filter((_, j) => j !== i),
                    )
                  }
                  className="btn-ghost shrink-0 px-3"
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
              className="btn-ghost"
            >
              + Ajouter une URL screenshot
            </button>
          </div>
        </div>
      </Section>
    </div>
  );
}
