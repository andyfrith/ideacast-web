import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { createDraftPost } from "@/db/queries/posts";
import { createPostDraftSchema } from "@/lib/validations/post-request";
import { upsertUserFromClerk } from "@/db/queries/users";

/**
 * Creates a draft post with raw + formatted content.
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

  const parsed = createPostDraftSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues,
      },
      { status: 422 },
    );
  }

  const post = await createDraftPost({
    userId,
    rawContent: parsed.data.rawContent,
    formattedContent: parsed.data.formattedContent,
    imageUrl: parsed.data.imageUrl ?? null,
  });

  return NextResponse.json({ post });
}
