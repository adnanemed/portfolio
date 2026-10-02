import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB
const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/**
 * POST multipart/form-data { file } → { url }
 * - Vercel Blob when BLOB_READ_WRITE_TOKEN is set (prod).
 * - Local ./public/uploads fallback in development.
 */
export async function POST(req: Request) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "validation", message: "multipart/form-data attendu" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "validation", message: "champ 'file' manquant" },
      { status: 400 },
    );
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json(
      {
        error: "validation",
        message: "type non autorisé (png, jpeg ou webp uniquement)",
      },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "validation", message: "fichier > 2 MB" },
      { status: 400 },
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    const { put } = await import("@vercel/blob");
    const pathname = `projects/${randomUUID()}.${ext}`;
    const blob = await put(pathname, bytes, {
      token,
      access: "public",
      contentType: file.type,
    });
    return NextResponse.json({ url: blob.url }, { status: 201 });
  }

  if (process.env.NODE_ENV !== "production") {
    const dir = path.join(process.cwd(), "public", "uploads");
    await mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}.${ext}`;
    await writeFile(path.join(dir, filename), bytes);
    return NextResponse.json(
      { url: `/uploads/${filename}` },
      { status: 201 },
    );
  }

  return NextResponse.json(
    { error: "upload_unavailable", message: "BLOB_READ_WRITE_TOKEN manquant" },
    { status: 503 },
  );
}
