import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  createDraftPost,
  listPostsForUser,
} from "@/db/queries/posts";
import {
  createPostDraftSchema,
  postsListStatusQuerySchema,
} from "@/lib/validations/post-request";
import { upsertUserFromClerk } from "@/db/queries/users";

async function ensureUserMirrored() {
  const user = await currentUser();
  if (user) {
    await upsertUserFromClerk({
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress,
      name: user.fullName ?? user.firstName ?? undefined,
    });
  }
}

/**
 * Lists the signed-in user's posts, optionally filtered by `?status=`.
 */
export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserMirrored();

  const url = new URL(request.url);
  const raw = url.searchParams.get("status");
  const statusParsed = postsListStatusQuerySchema.safeParse(
    raw === null || raw === "" ? undefined : raw,
  );
  const status = statusParsed.success ? statusParsed.data : "all";

  const rows = await listPostsForUser({ userId, status });
  return NextResponse.json({ posts: rows });
}

/**
 * Creates a draft post with raw + formatted content.
 */
export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureUserMirrored();

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
