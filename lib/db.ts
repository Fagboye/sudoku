"use server";
import "server-only";
import { neon, neonConfig } from "@neondatabase/serverless";

neonConfig.fetchConnectionCache = true;

let cachedSql: ReturnType<typeof neon> | null = null;

export function getSql() {
  if (cachedSql) return cachedSql;
  const connectionString = process.env.DATABASE_URL as string | undefined;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  cachedSql = neon(connectionString);
  return cachedSql;
}


