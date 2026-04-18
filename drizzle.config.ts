import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// Drizzle CLI does not load `.env.local` by default (only `.env`). Match Next.js so
// `bun run db:migrate` picks up the same DATABASE_URL as the app.
config({ path: ".env" });
config({ path: ".env.local", override: true });

const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";

const needsDatabaseUrl = ["migrate", "push", "studio", "introspect", "check"].some(
  (cmd) => process.argv.includes(cmd),
);

if (needsDatabaseUrl && !databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Add your Neon connection string to .env.local (or .env).",
  );
}

/**
 * Drizzle Kit config for schema introspection, migrations, and Studio.
 */
export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
});
