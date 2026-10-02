import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// PATCH { "status": "read" | "unread" } — toggle read/unread.
export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  let body: { status?: unknown };
  try {
    body = (await req.json()) as { status?: unknown };
  } catch {
    return NextResponse.json(
      { error: "validation", fields: { body: "invalid JSON" } },
      { status: 400 },
    );
  }

  const status = body?.status;
  if (status !== "read" && status !== "unread" && status !== "archived") {
    return NextResponse.json(
      {
        error: "validation",
        fields: { status: 'must be "read" | "unread" | "archived"' },
      },
      { status: 400 },
    );
  }

  const [updated] = await db
    .update(messages)
    .set({
      status,
      readAt: status === "read" ? new Date() : null,
    })
    .where(eq(messages.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ message: updated });
}

// DELETE one message.
export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = ctx.params;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const [deleted] = await db
    .delete(messages)
    .where(eq(messages.id, id))
    .returning({ id: messages.id });
  if (!deleted) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
