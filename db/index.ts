import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePg, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

/**
 * Drizzle client — Neon HTTP (hosted) or `pg` TCP (e.g. Docker Postgres on localhost).
 */
export type Database =
  | NeonHttpDatabase<typeof schema>
  | NodePgDatabase<typeof schema>;

let dbInstance: Database | null = null;
let pgPool: Pool | null = null;

/**
 * Returns true when `DATABASE_URL` should use the TCP `pg` driver (local Docker, etc.)
 * instead of Neon's HTTP driver.
 *
 * Set `DATABASE_DRIVER=neon` to force Neon HTTP even for `localhost` (rare).
 * Set `DATABASE_DRIVER=pg` to force `pg` (e.g. custom hostname without auto-detect).
 */
function shouldUsePgDriver(url: string): boolean {
  const driver = process.env.DATABASE_DRIVER?.trim().toLowerCase();
  if (driver === "pg" || driver === "postgres" || driver === "node") {
    return true;
  }
  if (driver === "neon" || driver === "neon-http") {
    return false;
  }
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  } catch {
    return false;
  }
}

/**
 * Returns a shared Drizzle client. Lazily created so `next build` can succeed when
 * `DATABASE_URL` is only present at deploy/runtime.
 *
 * - **Neon (cloud):** `@neondatabase/serverless` HTTP driver — requires a Neon-style host.
 * - **Local Postgres (Docker):** `pg` + TCP — use `DATABASE_URL` with `localhost` and
 *   usually `?sslmode=disable` (see `.env.example` and `docker-compose.yml`).
 */
export function getDb(): Database {
  if (dbInstance) {
    return dbInstance;
  }
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to .env.local.",
    );
  }

  if (shouldUsePgDriver(url)) {
    if (!pgPool) {
      pgPool = new Pool({ connectionString: url });
    }
    dbInstance = drizzlePg(pgPool, { schema });
    return dbInstance;
  }

  dbInstance = drizzleNeon(neon(url), { schema });
  return dbInstance;
}

export * from "./schema";
