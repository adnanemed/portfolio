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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker mb-3">Portfolio — gestion du contenu</p>
          <h1 className="page-title text-4xl">Projets</h1>
        </div>
        <Link href="/dashboard/projects/new" className="btn-solid">
          + Nouveau projet
        </Link>
      </div>

      {error && (
        <p className="notice mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="overflow-x-auto border-y border-border">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="mono-label px-4 py-3 text-left font-normal">Nom</th>
              <th className="mono-label px-4 py-3 text-left font-normal">Secteur</th>
              <th className="mono-label px-4 py-3 text-left font-normal">Statut</th>
              <th className="mono-label px-4 py-3 text-left font-normal">Ordre</th>
              <th className="mono-label px-4 py-3 text-left font-normal">Vedette</th>
              <th className="mono-label px-4 py-3 text-right font-normal">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {projects.map((p) => (
              <tr key={p.id} className="row-hover">
                <td className="px-4 py-4">
                  <span className="font-semibold tracking-[-0.01em]">
                    {p.nameFr}
                  </span>
                  <span className="mono block text-xs text-muted">
                    /{p.slug} · {p.type}
                  </span>
                </td>
                <td className="px-4 py-4 text-muted">{p.sectorFr}</td>
                <td className="px-4 py-4">
                  <span
                    className={`badge ${
                      p.status === "published" ? "badge-solid" : "badge-outline"
                    }`}
                  >
                    {p.status === "published" ? "publié" : "brouillon"}
                  </span>
                </td>
                <td className="mono px-4 py-4 tabular-nums">{p.orderIndex}</td>
                <td className="mono px-4 py-4">
                  {p.featured ? (
                    <span aria-label="Vedette">★</span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  <span className="flex flex-wrap justify-end gap-1.5">
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => router.push(`/dashboard/projects/${p.id}/edit`)}
                      className="btn-ghost"
                    >
                      Éditer
                    </button>
                    {p.status === "draft" ? (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => publish(p, true)}
                        className="btn-ghost border-text bg-text text-bg"
                      >
                        Publier
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={busyId === p.id}
                        onClick={() => publish(p, false)}
                        className="btn-ghost"
                      >
                        Dépublier
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => remove(p)}
                      className="btn-ghost"
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
      <p className="mono mt-3 text-[0.7rem] text-muted">
        Vedette : 2 projets maximum (affichage hero sur le site).
      </p>
    </div>
  );
}
