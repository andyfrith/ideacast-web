import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";

import {
  parseAndMergeSinglePlatform,
  parseFormattedJson,
} from "@/lib/ai/parse-formatted-json";
import { singlePlatformJsonSuffix } from "@/lib/ai/single-platform";
import type { FormattedOutput } from "@/lib/validations/format-request";

const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Resolves the Google AI Studio / Gemini API key.
 */
export function getGeminiApiKey(): string {
  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!key) {
    throw new Error(
      "GEMINI_API_KEY (or GOOGLE_GENERATIVE_AI_API_KEY) is not configured",
    );
  }
  return key;
}

/**
 * Formats content with Google Gemini (JSON output, optional vision).
 */
export async function formatWithGemini(params: {
  systemPrompt: string;
  rawContent: string;
  imageBase64?: string;
  imageMediaType?: string;
  regeneratePlatform?: "linkedin" | "twitter";
  existingFormatted?: { linkedin: string; twitter: string };
}): Promise<FormattedOutput> {
  const apiKey = getGeminiApiKey();
  const modelName =
    process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;

  const single = params.regeneratePlatform;
  const systemInstruction =
    single && params.existingFormatted
      ? `${params.systemPrompt}${singlePlatformJsonSuffix(single)}`
      : params.systemPrompt;

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction,
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const textBlock = `Raw notes / ideas from the user:\n\n${params.rawContent}`;

  const parts: ({ text: string } | { inlineData: { data: string; mimeType: string } })[] =
    [{ text: textBlock }];

  if (params.imageBase64 && params.imageMediaType) {
    parts.push({
      inlineData: {
        data: params.imageBase64,
        mimeType: params.imageMediaType,
      },
    });
  }

  const result = await model.generateContent(parts);
  const raw = result.response.text();
  if (!raw?.trim()) {
    throw new Error("Empty response from Gemini");
  }

  if (single && params.existingFormatted) {
    return parseAndMergeSinglePlatform(
      raw,
      single,
      params.existingFormatted,
    );
  }

  return parseFormattedJson(raw);
}
