import { NextResponse } from "next/server";
import { createClient } from "@farcaster/quick-auth";
import { getSql } from "@/lib/db";
import { weekStartUtc } from "@/lib/week";

export const runtime = "nodejs";

async function ensureSchema() {
  const sql = getSql();
  await sql/* sql */`
    create table if not exists scores (
      fid          bigint not null,
      week_start   date   not null,
      best_seconds integer not null,
      updated_at   timestamptz not null default now(),
      primary key (fid, week_start)
    );
  `;
}

export async function POST(req: Request) {
  try {
    const sql = getSql();
    await ensureSchema();

    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });

    const client = createClient();
    const domain = new URL(req.url).hostname;
    const payload = await client.verifyJwt({ token, domain });

    const body = (await req.json().catch(() => null)) as { seconds?: number } | null;
    const seconds = body?.seconds;
    if (!Number.isFinite(seconds) || (seconds as number) <= 0 || (seconds as number) > 24 * 60 * 60) {
      return NextResponse.json({ error: "Invalid seconds" }, { status: 400 });
    }

    const fid = Number(payload.sub);
    const weekStart = weekStartUtc();

    await sql/* sql */`
      insert into scores (fid, week_start, best_seconds)
      values (${fid}, ${weekStart}, ${seconds})
      on conflict (fid, week_start)
      do update set
        best_seconds = least(scores.best_seconds, excluded.best_seconds),
        updated_at = now();
    `;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


