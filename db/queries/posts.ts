import "server-only";

import { getDb, posts, type PostRow } from "@/db";

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
