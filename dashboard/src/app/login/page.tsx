"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(
          res.status === 429
            ? "Trop d'essais — réessayez dans 15 minutes."
            : "Identifiants incorrects",
        );
        if (res.status !== 429 && body.error) {
          // Generic message regardless of error kind.
        }
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Erreur réseau — réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-2 p-6">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border border-border bg-bg p-8"
      >
        <h1 className="mb-1 text-2xl font-extrabold tracking-tight">
          <span className="rounded-md bg-accent px-2 py-1 text-accent-text">
            StackLab
          </span>{" "}
          Dashboard
        </h1>
        <p className="mb-6 text-sm text-muted">Accès réservé à l'équipe.</p>

        <label className="mb-4 block text-sm">
          <span className="mb-1 block font-semibold">Identifiant</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 outline-none focus:border-accent"
          />
        </label>

        <label className="mb-6 block text-sm">
          <span className="mb-1 block font-semibold">Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="w-full rounded-lg border border-border bg-bg-2 px-3 py-2 outline-none focus:border-accent"
          />
        </label>

        {error && (
          <p className="mb-4 rounded-lg border border-border bg-bg-2 px-3 py-2 text-sm text-red-500">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-4 py-2.5 font-semibold text-accent-text transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
