import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { formatContentWithLlm } from "@/lib/ai/format-content";
import { formatRequestSchema } from "@/lib/validations/format-request";
import { getTemplateById } from "@/db/queries/templates";
import { upsertUserFromClerk } from "@/db/queries/users";

/**
 * Returns true when the error indicates missing LLM config or unavailable local Ollama.
 */
function isConfigurationError(message: string): boolean {
  const m = message.toLowerCase();
  return (
    m.includes("not configured") ||
    m.includes("is not set") ||
    m.includes("unknown llm_provider") ||
    m.includes("econnrefused")
  );
}

/**
 * Runs the selected template against raw content (optional image for vision).
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  if (user) {
    await upsertUserFromClerk({
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName ?? user.firstName ?? undefined,
    });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = formatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues,
      },
      { status: 422 },
    );
  }

  const data = parsed.data;
  const template = await getTemplateById(data.templateId);
  if (!template) {
    return NextResponse.json({ error: "Template not found" }, { status: 404 });
  }

  try {
    const formatted = await formatContentWithLlm({
      systemPrompt: template.prompt,
      rawContent: data.rawContent,
      imageBase64: data.imageBase64,
      imageMediaType: data.imageMediaType,
    });
    return NextResponse.json({ formatted });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Format failed";
    const status = isConfigurationError(message) ? 503 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
