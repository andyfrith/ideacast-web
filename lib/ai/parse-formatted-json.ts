import { z } from "zod";

import {
  formattedOutputSchema,
  type FormattedOutput,
} from "@/lib/validations/format-request";

/**
 * Strips optional ```json fences some models add around JSON.
 */
export function unwrapMarkdownJson(raw: string): string {
  const t = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/im.exec(t);
  return fence ? fence[1].trim() : t;
}

/**
 * Parses and validates model output into `linkedin` / `twitter` fields.
 */
export function parseFormattedJson(raw: string): FormattedOutput {
  const cleaned = unwrapMarkdownJson(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Model returned invalid JSON");
  }
  return formattedOutputSchema.parse(parsed);
}

const partialKeysSchema = z.object({
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
});

/**
 * Parses a single-platform JSON response and merges with existing copy.
 */
export function parseAndMergeSinglePlatform(
  raw: string,
  platform: "linkedin" | "twitter",
  existing: { linkedin: string; twitter: string },
): FormattedOutput {
  const cleaned = unwrapMarkdownJson(raw);
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Model returned invalid JSON");
  }
  const obj = partialKeysSchema.parse(parsed);
  const next =
    platform === "linkedin" ? obj.linkedin : obj.twitter;
  if (next === undefined || next.trim() === "") {
    throw new Error(`Model did not return "${platform}" text`);
  }
  return {
    linkedin: platform === "linkedin" ? next : existing.linkedin,
    twitter: platform === "twitter" ? next : existing.twitter,
  };
}
