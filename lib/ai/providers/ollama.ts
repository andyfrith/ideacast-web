import "server-only";

import { parseFormattedJson } from "@/lib/ai/parse-formatted-json";
import type { FormattedOutput } from "@/lib/validations/format-request";

const DEFAULT_OLLAMA_BASE = "http://127.0.0.1:11434";
const DEFAULT_OLLAMA_MODEL = "llama3.2";

type OllamaChatResponse = {
  message?: {
    role?: string;
    content?: string;
  };
  error?: string;
};

/**
 * Returns the Ollama HTTP base URL (no trailing slash).
 */
export function getOllamaBaseUrl(): string {
  const raw = process.env.OLLAMA_BASE_URL?.trim() || DEFAULT_OLLAMA_BASE;
  return raw.replace(/\/+$/, "");
}

/**
 * Formats content via a local Ollama `/api/chat` request (`format: "json"`).
 * Use a vision-capable model (e.g. `llava`) when passing images.
 */
export async function formatWithOllama(params: {
  systemPrompt: string;
  rawContent: string;
  imageBase64?: string;
  imageMediaType?: string;
}): Promise<FormattedOutput> {
  const base = getOllamaBaseUrl();
  const model = process.env.OLLAMA_MODEL?.trim() || DEFAULT_OLLAMA_MODEL;

  const textBlock = `Raw notes / ideas from the user:\n\n${params.rawContent}`;

  const userMessage: {
    role: "user";
    content: string;
    images?: string[];
  } = {
    role: "user",
    content: textBlock,
  };

  if (params.imageBase64) {
    userMessage.images = [params.imageBase64];
  }

  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: params.systemPrompt },
        userMessage,
      ],
      stream: false,
      format: "json",
    }),
  });

  const body = (await res.json()) as OllamaChatResponse;
  if (!res.ok) {
    const detail = body.error ?? res.statusText;
    throw new Error(
      `Ollama request failed (${res.status}): ${detail}. Is Ollama running at ${base}?`,
    );
  }

  const raw = body.message?.content;
  if (!raw?.trim()) {
    throw new Error("Empty response from Ollama");
  }

  return parseFormattedJson(raw);
}
