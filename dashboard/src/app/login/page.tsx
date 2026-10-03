"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import StackLabLogo from "@/components/StackLabLogo";

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
    <div className="flex min-h-screen items-center justify-center bg-bg p-6">
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>
      <form
        onSubmit={onSubmit}
        className="card w-full max-w-sm p-8 sm:p-10"
      >
        <div className="mb-6 flex flex-col items-start gap-5">
          <StackLabLogo height={32} />
          <div>
            <p className="kicker mb-3">Accès réservé à l&apos;équipe</p>
            <h1 className="page-title text-3xl">
              StackLab{" "}
              <span className="serif-it">Dashboard</span>
            </h1>
          </div>
        </div>

        <label className="mb-4 block">
          <span className="field-label">Identifiant</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
            className="input-field"
          />
        </label>

        <label className="mb-6 block">
          <span className="field-label">Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
            className="input-field"
          />
        </label>

        {error && (
          <p className="notice mb-4" role="alert">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading} className="btn-solid w-full">
          {loading ? "Connexion…" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}
