"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  MessageRow,
  ProjectRow,
  apiGet,
} from "@/lib/api";

export default function OverviewPage() {
  const [projects, setProjects] = useState<ProjectRow[] | null>(null);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);
  const [latest, setLatest] = useState<MessageRow[]>([]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [p, unread, all] = await Promise.all([
          apiGet<{ projects: ProjectRow[] }>("/api/admin/projects"),
          apiGet<{ messages: MessageRow[] }>(
            "/api/admin/messages?status=unread",
          ),
          apiGet<{ messages: MessageRow[] }>("/api/admin/messages"),
        ]);
        if (!active) return;
        setProjects(p.projects);
        setUnreadCount(unread.messages.length);
        setLatest(all.messages.slice(0, 5));
      } catch {
        // 401 handled by middleware redirect
      }
    };
    load();
    const timer = setInterval(load, 45000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const published = projects?.filter((p) => p.status === "published").length ?? 0;
  const drafts = projects?.filter((p) => p.status === "draft").length ?? 0;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <p className="kicker mb-3">Pilotage — espace équipe</p>
        <h1 className="page-title text-4xl">
          Vue <span className="serif-it">d&apos;ensemble</span>
        </h1>
      </div>

      {/* Stats strip — hairline-separated cells, big Archivo numbers,
          mono labels (site .stats grammar) */}
      <div className="mb-8 grid grid-cols-1 border-y border-border sm:grid-cols-3">
        <Link
          href="/dashboard/messages"
          className="lift row-hover block border-b border-border p-5 sm:border-b-0 sm:border-r"
        >
          <p className="mono-label flex items-center gap-2">
            Messages non lus
            {unreadCount !== null && unreadCount > 0 && (
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-text"
                aria-hidden
              />
            )}
          </p>
          <p className="mt-2 text-4xl font-bold tracking-[-0.03em] tabular-nums">
            {unreadCount ?? "…"}
          </p>
        </Link>
        <div className="border-b border-border p-5 sm:border-b-0 sm:border-r">
          <p className="mono-label">Projets publiés</p>
          <p className="mt-2 text-4xl font-bold tracking-[-0.03em] tabular-nums">
            {published}
          </p>
        </div>
        <div className="p-5">
          <p className="mono-label">Brouillons</p>
          <p className="mt-2 text-4xl font-bold tracking-[-0.03em] tabular-nums">
            {drafts}
          </p>
        </div>
      </div>

      <div className="mb-10 flex flex-wrap gap-3">
        <Link href="/dashboard/projects/new" className="btn-solid">
          + Nouveau projet
        </Link>
        <a href="/api/admin/export" className="btn-wipe">
          Exporter content.json
        </a>
      </div>

      <div className="mb-3 flex items-baseline justify-between gap-4">
        <h2 className="page-title text-lg">Derniers messages</h2>
        <span className="mono-label">05 max</span>
      </div>
      <div className="border-y border-border">
        {latest.length === 0 ? (
          <p className="p-5 text-sm text-muted">
            Aucun message pour l&apos;instant.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {latest.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/dashboard/messages/${m.id}`}
                  className="row-hover flex items-center justify-between gap-4 p-4"
                >
                  <span className="min-w-0">
                    <span
                      className={`block truncate ${
                        m.status === "unread" ? "font-bold" : ""
                      }`}
                    >
                      {m.status === "unread" && (
                        <span
                          className="mr-2 inline-block h-2 w-2 rounded-full bg-text align-middle"
                          aria-hidden
                        />
                      )}
                      {m.name}
                    </span>
                    <span className="block truncate text-sm text-muted">
                      {m.message}
                    </span>
                  </span>
                  <span className="mono shrink-0 text-[0.7rem] text-muted">
                    {new Date(m.createdAt).toLocaleString("fr-FR")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
