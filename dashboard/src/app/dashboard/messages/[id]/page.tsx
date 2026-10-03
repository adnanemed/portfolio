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
        <p className="mb-2 text-muted">Message introuvable.</p>
        <Link href="/dashboard/messages" className="link-mono">
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
      <Link href="/dashboard/messages" className="link-mono mb-6">
        ← Boîte de réception
      </Link>

      <div className="card mt-2 p-6 sm:p-8">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="kicker mb-2">Message reçu</p>
            <h1 className="text-2xl font-bold tracking-[-0.02em]">
              {message.name}
            </h1>
            <p className="mono mt-1 text-sm text-muted">
              <a
                href={`mailto:${message.email}`}
                className="underline decoration-border underline-offset-4 transition-colors duration-200 hover:text-text"
              >
                {message.email}
              </a>
              {message.phone ? ` · ${message.phone}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="mono text-[0.72rem] text-muted">
              {new Date(message.createdAt).toLocaleString("fr-FR")}
            </p>
            <p className="mono mt-1 text-[0.72rem] text-muted">
              Locale :{" "}
              <span className="badge badge-outline align-middle">
                {message.locale}
              </span>
            </p>
          </div>
        </div>

        <p className="whitespace-pre-wrap border-t border-border pt-5 leading-relaxed">
          {message.message}
        </p>

        <div className="mt-7 flex flex-wrap gap-2.5 border-t border-border pt-5">
          <a
            href={`mailto:${message.email}?subject=Re: votre message sur StackLab`}
            className="btn-solid"
          >
            Répondre par email
          </a>
          {waLink && (
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-wipe"
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
            className="btn-wipe"
          >
            {message.status === "unread" ? "Marquer lu" : "Marquer non lu"}
          </button>
          <button type="button" onClick={remove} className="btn-wipe ml-auto">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
