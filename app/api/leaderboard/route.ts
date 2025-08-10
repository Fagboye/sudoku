import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { weekStartUtc } from "@/lib/week";

export const runtime = "nodejs";

export async function GET() {
  const weekStart = weekStartUtc();
  const rows = await sql/* sql */`
    select fid, best_seconds
    from scores
    where week_start = ${weekStart}
    order by best_seconds asc, fid asc
    limit 100;
  `;

  return NextResponse.json({ weekStart, rows });
}


