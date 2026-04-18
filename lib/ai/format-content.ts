import "server-only";

import { formatWithGemini } from "@/lib/ai/providers/gemini";
import { formatWithOllama } from "@/lib/ai/providers/ollama";
import type { FormattedOutput } from "@/lib/validations/format-request";

export type LlmProviderId = "ollama" | "gemini";

/**
 * Active LLM backend from `LLM_PROVIDER` (`ollama` | `gemini`).
 */
export function getConfiguredLlmProvider(): LlmProviderId {
  const p = process.env.LLM_PROVIDER?.trim().toLowerCase();
  if (p === "ollama" || p === "gemini") {
    return p;
  }
  if (!p) {
    throw new Error(
      'LLM_PROVIDER is not set. Use "ollama" (local Ollama) or "gemini" (Google Gemini API).',
    );
  }
  throw new Error(`Unknown LLM_PROVIDER "${p}". Use "ollama" or "gemini".`);
}

/**
 * Runs the configured provider to produce LinkedIn + X copy as JSON (`linkedin`, `twitter`).
 */
export async function formatContentWithLlm(params: {
  systemPrompt: string;
  rawContent: string;
  imageBase64?: string;
  imageMediaType?: string;
}): Promise<FormattedOutput> {
  const provider = getConfiguredLlmProvider();
  if (provider === "gemini") {
    return formatWithGemini(params);
  }
  return formatWithOllama(params);
}
