import { z } from "zod";

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
