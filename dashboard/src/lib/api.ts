"use client";

/** Small same-origin JSON fetch helpers for the dashboard pages. */

export type ApiError = {
  status: number;
  error?: string;
  message?: string;
  fields?: Record<string, string[]>;
  missing?: string[];
};

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(path, { credentials: "same-origin" });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw toApiError(res.status, body);
  return body as T;
}

export async function apiSend<T>(
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: "same-origin",
    headers: body !== undefined ? { "Content-Type": "application/json" } : {},
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw toApiError(res.status, data);
  return data as T;
}

export async function apiUpload<T>(path: string, file: File): Promise<T> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(path, {
    method: "POST",
    credentials: "same-origin",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw toApiError(res.status, data);
  return data as T;
}

function toApiError(status: number, body: Record<string, unknown>): ApiError {
  return {
    status,
    error: typeof body.error === "string" ? body.error : undefined,
    message: typeof body.message === "string" ? body.message : undefined,
    fields: body.fields as Record<string, string[]> | undefined,
    missing: Array.isArray(body.missing) ? (body.missing as string[]) : undefined,
  };
}

// ---- Shared API types (JSON-serialized rows) ----

export type Metric = {
  labelFr: string;
  labelEn: string;
  value: string;
  suffix?: string;
  confirmed: boolean;
};

export type Feature = { title: string; body: string };

export type ProjectRow = {
  id: string;
  slug: string;
  status: "draft" | "published";
  type: "client" | "demo" | "own";
  featured: boolean;
  orderIndex: number;
  nameFr: string;
  nameEn: string;
  sectorFr: string;
  sectorEn: string;
  summaryFr: string;
  summaryEn: string;
  problemFr: string;
  problemEn: string;
  solutionFr: string;
  solutionEn: string;
  featuresFr: Feature[];
  featuresEn: Feature[];
  tags: string[];
  metrics: Metric[];
  liveUrl: string | null;
  iframeEmbeddable: boolean;
  fallbackScreenshots: string[];
  architectureImage: string | null;
  architectureCaptionFr: string;
  architectureCaptionEn: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type MessageRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  locale: string;
  status: "unread" | "read" | "archived";
  createdAt: string;
  readAt: string | null;
};

export type SettingsRow = {
  id: number;
  whatsappNumber: string | null;
  instagramUrl: string | null;
  linkedinUrl: string | null;
  publicEmail: string | null;
  notifyEmail: string | null;
  updatedAt: string;
};

/** Mirrors server-side publishMissing (src/lib/validation.ts). */
export function publishMissing(p: ProjectRow): string[] {
  const missing: string[] = [];
  const req = (label: string, v: string | null | undefined) => {
    if (!v || v.trim().length === 0) missing.push(label);
  };
  req("summaryFr", p.summaryFr);
  req("summaryEn", p.summaryEn);
  req("problemFr", p.problemFr);
  req("problemEn", p.problemEn);
  req("solutionFr", p.solutionFr);
  req("solutionEn", p.solutionEn);
  if (p.featuresFr.length < 4) missing.push("featuresFr (≥ 4)");
  if (p.featuresEn.length < 4) missing.push("featuresEn (≥ 4)");
  if (p.tags.length < 3) missing.push("tags (≥ 3)");
  if (p.metrics.length < 1) missing.push("metrics (≥ 1)");
  if (p.metrics.some((m) => !m.confirmed)) missing.push("métriques non confirmées");
  req("liveUrl", p.liveUrl);
  return missing;
}
