import {
  formattedOutputSchema,
  type FormattedOutput,
} from "@/lib/validations/format-request";

/**
 * Strips optional ```json fences some models add around JSON.
 */
function unwrapMarkdownJson(raw: string): string {
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
