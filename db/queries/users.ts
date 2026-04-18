import "server-only";

import { eq } from "drizzle-orm";

import { getDb, users, type UserRow } from "@/db";

type ClerkProfile = {
  id: string;
  email?: string | null;
  name?: string | null;
};

/**
 * Inserts or updates the mirrored `users` row for a Clerk account.
 */
export async function upsertUserFromClerk(profile: ClerkProfile): Promise<void> {
  const db = getDb();
  await db
    .insert(users)
    .values({
      id: profile.id,
      email: profile.email ?? null,
      name: profile.name ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        email: profile.email ?? null,
        name: profile.name ?? null,
        updatedAt: new Date(),
      },
    });
}

/**
 * Loads a user by primary key (Clerk `user_id`).
 */
export async function getUserById(id: string): Promise<UserRow | undefined> {
  const db = getDb();
  const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return rows[0];
}
