import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { listGlobalTemplates } from "@/db/queries/templates";

/**
 * Returns global LLM templates for the New Post picker.
 */
export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const templates = await listGlobalTemplates();
  return NextResponse.json({ templates });
}
