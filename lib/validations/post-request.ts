import { z } from "zod";

const postStatusSchema = z.enum(["draft", "pending", "published"]);

/**
 * Request body for POST /api/posts (create draft).
 */
export const createPostDraftSchema = z.object({
  rawContent: z.string().max(50_000).default(""),
  formattedContent: z
    .record(z.string(), z.string())
    .default(() => ({})),
  imageUrl: z.union([z.string().url(), z.null()]).optional(),
});

export type CreatePostDraftInput = z.infer<typeof createPostDraftSchema>;

/**
 * Request body for PATCH /api/posts/[id].
 */
export const patchPostSchema = z
  .object({
    rawContent: z.string().max(50_000).optional(),
    formattedContent: z.record(z.string(), z.string()).optional(),
    imageUrl: z.union([z.string().url(), z.null()]).optional(),
    status: postStatusSchema.optional(),
  })
  .refine(
    (data) =>
      data.rawContent !== undefined ||
      data.formattedContent !== undefined ||
      data.imageUrl !== undefined ||
      data.status !== undefined,
    { message: "At least one field is required to update a post." },
  );

export type PatchPostInput = z.infer<typeof patchPostSchema>;

/**
 * Query param for GET /api/posts list filter.
 */
export const postsListStatusQuerySchema = z
  .enum(["all", "draft", "pending", "published"])
  .optional()
  .default("all");
