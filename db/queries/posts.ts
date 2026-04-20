import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { getDb, posts, type PostRow } from "@/db";

export type PostStatus = "draft" | "pending" | "published";

/**
 * Creates a new draft post for the given Clerk user.
 */
export async function createDraftPost(input: {
  userId: string;
  rawContent: string;
  formattedContent: Record<string, string>;
  imageUrl?: string | null;
}): Promise<PostRow> {
  const db = getDb();
  const [row] = await db
    .insert(posts)
    .values({
      userId: input.userId,
      rawContent: input.rawContent,
      formattedContent: input.formattedContent,
      imageUrl: input.imageUrl ?? null,
      status: "draft",
    })
    .returning();
  if (!row) {
    throw new Error("Failed to create post");
  }
  return row;
}

/**
 * Lists posts for a user, newest first. Pass `status` to filter, or `"all"`.
 */
export async function listPostsForUser(input: {
  userId: string;
  status?: PostStatus | "all";
}): Promise<PostRow[]> {
  const db = getDb();
  const status = input.status ?? "all";
  if (status === "all") {
    return db
      .select()
      .from(posts)
      .where(eq(posts.userId, input.userId))
      .orderBy(desc(posts.updatedAt));
  }
  return db
    .select()
    .from(posts)
    .where(and(eq(posts.userId, input.userId), eq(posts.status, status)))
    .orderBy(desc(posts.updatedAt));
}

/**
 * Loads a single post if it belongs to the user.
 */
export async function getPostByIdForUser(input: {
  postId: string;
  userId: string;
}): Promise<PostRow | undefined> {
  const db = getDb();
  const rows = await db
    .select()
    .from(posts)
    .where(and(eq(posts.id, input.postId), eq(posts.userId, input.userId)))
    .limit(1);
  return rows[0];
}

/**
 * Updates fields on a post owned by the user.
 */
export async function updatePostForUser(input: {
  postId: string;
  userId: string;
  rawContent?: string;
  formattedContent?: Record<string, string>;
  imageUrl?: string | null;
  status?: PostStatus;
}): Promise<PostRow | undefined> {
  const db = getDb();
  const [row] = await db
    .update(posts)
    .set({
      ...(input.rawContent !== undefined && { rawContent: input.rawContent }),
      ...(input.formattedContent !== undefined && {
        formattedContent: input.formattedContent,
      }),
      ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
      ...(input.status !== undefined && { status: input.status }),
      updatedAt: new Date(),
    })
    .where(and(eq(posts.id, input.postId), eq(posts.userId, input.userId)))
    .returning();
  return row;
}

/**
 * Deletes a post owned by the user. Returns whether a row was removed.
 */
export async function deletePostForUser(input: {
  postId: string;
  userId: string;
}): Promise<boolean> {
  const db = getDb();
  const removed = await db
    .delete(posts)
    .where(and(eq(posts.id, input.postId), eq(posts.userId, input.userId)))
    .returning();
  return removed.length > 0;
}
