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
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight">
        Vue d'ensemble
      </h1>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/dashboard/messages"
          className="rounded-2xl border border-border bg-bg-2 p-5 transition-colors hover:border-accent"
        >
          <p className="text-sm text-muted">Messages non lus</p>
          <p className="mt-1 text-4xl font-extrabold text-accent">
            {unreadCount ?? "…"}
          </p>
        </Link>
        <div className="rounded-2xl border border-border bg-bg-2 p-5">
          <p className="text-sm text-muted">Projets publiés</p>
          <p className="mt-1 text-4xl font-extrabold">{published}</p>
        </div>
        <div className="rounded-2xl border border-border bg-bg-2 p-5">
          <p className="text-sm text-muted">Brouillons</p>
          <p className="mt-1 text-4xl font-extrabold">{drafts}</p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/dashboard/projects/new"
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-text hover:opacity-90"
        >
          + Nouveau projet
        </Link>
        <a
          href="/api/admin/export"
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:border-accent"
        >
          Exporter content.json
        </a>
      </div>

      <h2 className="mb-3 text-lg font-bold">Derniers messages</h2>
      <div className="rounded-2xl border border-border bg-bg-2">
        {latest.length === 0 ? (
          <p className="p-5 text-sm text-muted">Aucun message pour l'instant.</p>
        ) : (
          <ul className="divide-y divide-border">
            {latest.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/dashboard/messages/${m.id}`}
                  className="flex items-center justify-between gap-4 p-4 hover:bg-bg"
                >
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {m.status === "unread" && (
                        <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent align-middle" />
                      )}
                      {m.name}
                    </span>
                    <span className="block truncate text-sm text-muted">
                      {m.message}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-muted">
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
