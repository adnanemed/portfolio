"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ProjectRow, apiGet, apiSend } from "@/lib/api";

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const data = await apiGet<{ projects: ProjectRow[] }>(
      "/api/admin/projects",
    );
    setProjects(data.projects);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function publish(p: ProjectRow, publish: boolean) {
    setBusyId(p.id);
    setError(null);
    try {
      await apiSend(`/api/admin/projects/${p.id}/publish`, "POST", { publish });
      await load();
    } catch (err) {
      const e = err as { status?: number; missing?: string[]; error?: string };
      if (e.status === 422 && e.missing) {
        setError(
          `${p.nameFr} — à valider avant publication : ${e.missing.join(", ")}`,
        );
      } else {
        setError(`Erreur (${e.error ?? "unknown"})`);
      }
    } finally {
      setBusyId(null);
    }
  }

  async function remove(p: ProjectRow) {
    if (
      !window.confirm(
        `Supprimer « ${p.nameFr} » définitivement ? Action irréversible.`,
      )
    )
      return;
    setBusyId(p.id);
    try {
      await apiSend(`/api/admin/projects/${p.id}`, "DELETE");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  const featuredCount = projects.filter((p) => p.featured).length;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">Projets</h1>
        <Link
          href="/dashboard/projects/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-text hover:opacity-90"
        >
          + Nouveau projet
        </Link>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-border bg-bg-2 p-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-bg-2 text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Secteur</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Ordre</th>
              <th className="px-4 py-3">Vedette</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-bg">
            {projects.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-3">
                  <span className="font-semibold">{p.nameFr}</span>
                  <span className="block text-xs text-muted">
                    /{p.slug} · {p.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted">{p.sectorFr}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      p.status === "published"
                        ? "bg-green-500/15 text-green-600 dark:text-green-400"
                        : "bg-bg-2 text-muted"
                    }`}
                  >
                    {p.status === "published" ? "publié" : "brouillon"}
                  </span>
                </td>
                <td className="px-4 py-3">{p.orderIndex}</td>
                <td className="px-4 py-3">
                  {p.featured ? (
                    <span className="font-semibold text-accent">★</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="flex flex-wrap justify-end gap-1.5">
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => router.push(`/dashboard/projects/${p.id}/edit`)}
                      className="rounded-md border border-border px-2.5 py-1 text-xs hover:border-accent"
                    >
                      Éditer
                    </button>
                    {p.status === "draft" ? (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => publish(p, true)}
                        className="rounded-md bg-accent px-2.5 py-1 text-xs font-semibold text-accent-text disabled:opacity-50"
                      >
                        Publier
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => publish(p, false)}
                        className="rounded-md border border-border px-2.5 py-1 text-xs hover:border-accent"
                      >
                        Dépublier
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => remove(p)}
                      className="rounded-md border border-border px-2.5 py-1 text-xs text-red-500 hover:border-red-500"
                    >
                      Suppr.
                    </button>
                  </span>
                </td>
              </tr>
            ))}
            {projects.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted">
                  Aucun projet — créez le premier.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">
        Vedette : 2 projets maximum (affichage hero sur le site).
      </p>
    </div>
  );
}
