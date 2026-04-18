import "server-only";

import { eq, isNull } from "drizzle-orm";

import {
  DEFAULT_TEMPLATE_ID,
  DEFAULT_TEMPLATE_PROMPT,
} from "@/lib/content/default-templates";
import { getDb, templates, type TemplateRow } from "@/db";

/**
 * Lists global templates (no owner) for the template picker.
 */
export async function listGlobalTemplates(): Promise<TemplateRow[]> {
  const db = getDb();
  await seedDefaultTemplateIfMissing();
  return db
    .select()
    .from(templates)
    .where(isNull(templates.ownerUserId));
}

/**
 * Loads a template by id or undefined if missing.
 */
export async function getTemplateById(
  id: string,
): Promise<TemplateRow | undefined> {
  const db = getDb();
  await seedDefaultTemplateIfMissing();
  const rows = await db
    .select()
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);
  return rows[0];
}

let seedPromise: Promise<void> | null = null;

/**
 * Ensures the default LinkedIn + X template exists (single-row idempotent seed).
 */
export function seedDefaultTemplateIfMissing(): Promise<void> {
  if (!seedPromise) {
    seedPromise = (async () => {
      const db = getDb();
      const existing = await db
        .select({ id: templates.id })
        .from(templates)
        .where(eq(templates.id, DEFAULT_TEMPLATE_ID))
        .limit(1);
      if (existing.length > 0) {
        return;
      }
      await db.insert(templates).values({
        id: DEFAULT_TEMPLATE_ID,
        name: "Professional (LinkedIn + X)",
        prompt: DEFAULT_TEMPLATE_PROMPT,
        metadata: { platforms: ["linkedin", "twitter"] },
        ownerUserId: null,
      });
    })();
  }
  return seedPromise;
}
