import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "./schema";

export type Database = NeonHttpDatabase<typeof schema>;

let dbInstance: Database | null = null;

/**
 * Returns a shared Drizzle client (Neon serverless HTTP). Lazily created so
 * `next build` can succeed when `DATABASE_URL` is only present at deploy/runtime.
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
  dbInstance = drizzle(neon(url), { schema });
  return dbInstance;
}

export * from "./schema";
