import { NextResponse } from "next/server";
import { and, desc, eq, lt, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { messages } from "@/db/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

/**
 * GET /api/admin/messages?status=unread|read&cursor=<ISO date>
 * Cursor pagination on createdAt (desc).
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const status = url.searchParams.get("status");
  const cursor = url.searchParams.get("cursor");

  const conditions: SQL[] = [];
  if (status === "unread" || status === "read" || status === "archived") {
    conditions.push(eq(messages.status, status));
  }
  if (cursor) {
    const cursorDate = new Date(cursor);
    if (!Number.isNaN(cursorDate.getTime())) {
      conditions.push(lt(messages.createdAt, cursorDate));
    }
  }

  const rows = await db
    .select()
    .from(messages)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(messages.createdAt))
    .limit(PAGE_SIZE + 1);

  const hasMore = rows.length > PAGE_SIZE;
  const page = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore
    ? page[page.length - 1]?.createdAt.toISOString() ?? null
    : null;

  return NextResponse.json({ messages: page, nextCursor });
}
