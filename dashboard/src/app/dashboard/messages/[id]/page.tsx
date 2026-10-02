"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { MessageRow, apiGet, apiSend } from "@/lib/api";

export default function MessageDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [message, setMessage] = useState<MessageRow | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // Fetch the full inbox and pick the message (list endpoint doubles as lookup).
        const data = await apiGet<{ messages: MessageRow[] }>(
          "/api/admin/messages",
        );
        const found = data.messages.find((m) => m.id === id);
        if (!found) {
          setNotFound(true);
          return;
        }
        setMessage(found);
        if (found.status === "unread") {
          // Mark read automatically on open.
          await apiSend(`/api/admin/messages/${id}`, "PATCH", {
            status: "read",
          });
          setMessage({ ...found, status: "read" });
        }
      } catch {
        setNotFound(true);
      }
    })();
  }, [id]);

  async function remove() {
    if (!message) return;
    if (!window.confirm("Supprimer ce message ? Action irréversible.")) return;
    await apiSend(`/api/admin/messages/${id}`, "DELETE");
    router.push("/dashboard/messages");
  }

  if (notFound) {
    return (
      <div className="mx-auto max-w-3xl">
        <p className="text-muted">Message introuvable.</p>
        <Link href="/dashboard/messages" className="text-accent hover:underline">
          ← Retour à la boîte de réception
        </Link>
      </div>
    );
  }

  if (!message) {
    return <p className="text-muted">Chargement…</p>;
  }

  const waLink = message.phone
    ? `https://wa.me/${message.phone.replace(/[^0-9]/g, "")}`
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href="/dashboard/messages"
        className="mb-4 inline-block text-sm text-muted hover:text-accent"
      >
        ← Boîte de réception
      </Link>

      <div className="rounded-2xl border border-border bg-bg-2 p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold">{message.name}</h1>
            <p className="text-sm text-muted">
              <a href={`mailto:${message.email}`} className="hover:text-accent">
                {message.email}
              </a>
              {message.phone ? ` · ${message.phone}` : ""}
            </p>
          </div>
          <div className="text-right text-xs text-muted">
            <p>{new Date(message.createdAt).toLocaleString("fr-FR")}</p>
            <p>
              Locale : <span className="font-semibold">{message.locale}</span>
            </p>
          </div>
        </div>

        <p className="whitespace-pre-wrap border-t border-border pt-4 leading-relaxed">
          {message.message}
        </p>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
          <a
            href={`mailto:${message.email}?subject=Re: votre message sur StackLab`}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-text hover:opacity-90"
          >
            Répondre par email
          </a>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:border-accent"
            >
              WhatsApp
            </a>
          )}
          <button
            type="button"
            onClick={() =>
              apiSend(`/api/admin/messages/${id}`, "PATCH", {
                status: message.status === "unread" ? "read" : "unread",
              }).then(() =>
                setMessage({
                  ...message,
                  status: message.status === "unread" ? "read" : "unread",
                }),
              )
            }
            className="rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:border-accent"
          >
            {message.status === "unread" ? "Marquer lu" : "Marquer non lu"}
          </button>
          <button
            type="button"
            onClick={remove}
            className="ml-auto rounded-lg border border-border px-4 py-2 text-sm font-semibold text-red-500 hover:border-red-500"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
