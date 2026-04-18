import { z } from "zod";

/**
 * Request body for POST /api/format.
 */
export const formatRequestSchema = z.object({
  rawContent: z.string().min(1, "Content is required").max(50_000),
  templateId: z.uuid("Select a valid template"),
  imageBase64: z.string().max(12_000_000).optional(),
  imageMediaType: z
    .enum(["image/jpeg", "image/png", "image/webp", "image/gif"])
    .optional(),
});

export type FormatRequestInput = z.infer<typeof formatRequestSchema>;

/**
 * Expected JSON shape from the LLM for LinkedIn + X outputs.
 */
export const formattedOutputSchema = z.object({
  linkedin: z.string(),
  twitter: z.string(),
});

export type FormattedOutput = z.infer<typeof formattedOutputSchema>;
