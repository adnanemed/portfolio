"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MessageRow, apiGet, apiSend } from "@/lib/api";

type Filter = "all" | "unread";

export default function MessagesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const q = filter === "unread" ? "?status=unread" : "";
    try {
      const data = await apiGet<{ messages: MessageRow[] }>(
        `/api/admin/messages${q}`,
      );
      setMessages(data.messages);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    load();
    const timer = setInterval(load, 45000);
    return () => clearInterval(timer);
  }, [load]);

  async function toggleRead(m: MessageRow) {
    const next = m.status === "unread" ? "read" : "unread";
    await apiSend(`/api/admin/messages/${m.id}`, "PATCH", { status: next });
    load();
  }

  async function remove(m: MessageRow) {
    if (!window.confirm(`Supprimer le message de ${m.name} ? Action irréversible.`))
      return;
    await apiSend(`/api/admin/messages/${m.id}`, "DELETE");
    load();
  }

  const unreadTotal = messages.filter((m) => m.status === "unread").length;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Messages
          {unreadTotal > 0 && (
            <span className="ml-3 rounded-full bg-accent px-2.5 py-1 align-middle text-sm font-bold text-accent-text">
              {unreadTotal} non lu{unreadTotal > 1 ? "s" : ""}
            </span>
          )}
        </h1>
        <div className="flex rounded-lg border border-border">
          {(["all", "unread"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 text-sm ${
                filter === f
                  ? "bg-accent font-semibold text-accent-text"
                  : "text-muted hover:text-text"
              }`}
            >
              {f === "all" ? "Tous" : "Non lus"}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-bg-2">
        {loading ? (
          <p className="p-5 text-sm text-muted">Chargement…</p>
        ) : messages.length === 0 ? (
          <p className="p-5 text-sm text-muted">Aucun message.</p>
        ) : (
          <ul className="divide-y divide-border">
            {messages.map((m) => (
              <li key={m.id} className="flex items-start gap-3 p-4">
                <span
                  className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                    m.status === "unread" ? "bg-accent" : "bg-transparent"
                  }`}
                  aria-hidden
                />
                <Link
                  href={`/dashboard/messages/${m.id}`}
                  className="min-w-0 flex-1 hover:opacity-80"
                >
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">{m.name}</span>
                    <span className="text-sm text-muted">{m.email}</span>
                    <span className="text-xs text-muted">
                      {new Date(m.createdAt).toLocaleString("fr-FR")}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-sm text-muted">
                    {m.message}
                  </span>
                </Link>
                <span className="flex shrink-0 flex-col gap-1 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => toggleRead(m)}
                    className="rounded-md border border-border px-2.5 py-1 text-xs hover:border-accent"
                  >
                    {m.status === "unread" ? "Marquer lu" : "Marquer non lu"}
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(m)}
                    className="rounded-md border border-border px-2.5 py-1 text-xs text-red-500 hover:border-red-500"
                  >
                    Supprimer
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
