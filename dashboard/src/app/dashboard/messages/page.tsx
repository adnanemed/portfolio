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
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker mb-3">Boîte de réception — accès sécurisé</p>
          <h1 className="page-title flex items-center gap-4 text-4xl">
            Messages
            {unreadTotal > 0 && (
              <span className="badge badge-solid">
                {unreadTotal} non lu{unreadTotal > 1 ? "s" : ""}
              </span>
            )}
          </h1>
        </div>
        <div className="flex rounded-full border border-border p-1" role="group">
          {(["all", "unread"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              aria-pressed={filter === f}
              className={`inline-flex min-h-[36px] items-center rounded-full px-4 font-mono text-[0.68rem] uppercase tracking-[0.14em] transition-[color,background] duration-200 ease-out active:scale-[0.96] ${
                filter === f
                  ? "bg-text text-bg"
                  : "text-muted hover:text-text"
              }`}
            >
              {f === "all" ? "Tous" : "Non lus"}
            </button>
          ))}
        </div>
      </div>

      <div className="border-y border-border">
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
                    m.status === "unread" ? "bg-text" : "border border-border"
                  }`}
                  aria-hidden
                />
                <Link
                  href={`/dashboard/messages/${m.id}`}
                  className="row-hover min-w-0 flex-1 rounded-sm"
                >
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span
                      className={`${
                        m.status === "unread" ? "font-bold" : "font-medium"
                      }`}
                    >
                      {m.name}
                    </span>
                    <span className="mono text-xs text-muted">{m.email}</span>
                    <span className="mono text-[0.7rem] text-muted">
                      {new Date(m.createdAt).toLocaleString("fr-FR")}
                    </span>
                  </span>
                  <span className="mt-0.5 line-clamp-2 block text-sm text-muted">
                    {m.message}
                  </span>
                </Link>
                <span className="flex shrink-0 flex-col gap-1.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => toggleRead(m)}
                    className="btn-ghost"
                  >
                    {m.status === "unread" ? "Marquer lu" : "Marquer non lu"}
                  </button>
                  <button type="button" onClick={() => remove(m)} className="btn-ghost">
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
