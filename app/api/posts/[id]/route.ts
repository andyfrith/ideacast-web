import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

import {
  deletePostForUser,
  getPostByIdForUser,
  updatePostForUser,
} from "@/db/queries/posts";
import { patchPostSchema } from "@/lib/validations/post-request";
import { upsertUserFromClerk } from "@/db/queries/users";

type RouteContext = {
  params: Promise<{ id: string }>;
};

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

function parsePostId(id: string): string | null {
  return z.uuid().safeParse(id).success ? id : null;
}

/**
 * Returns a single post when it belongs to the signed-in user.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const postId = parsePostId(id);
  if (!postId) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  await ensureUserMirrored();

  const post = await getPostByIdForUser({ postId, userId });
  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

/**
 * Updates a post owned by the signed-in user.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const postId = parsePostId(id);
  if (!postId) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  await ensureUserMirrored();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchPostSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues,
      },
      { status: 422 },
    );
  }

  const post = await updatePostForUser({
    postId,
    userId,
    rawContent: parsed.data.rawContent,
    formattedContent: parsed.data.formattedContent,
    imageUrl: parsed.data.imageUrl,
    status: parsed.data.status,
  });

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

/**
 * Deletes a post owned by the signed-in user.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const postId = parsePostId(id);
  if (!postId) {
    return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
  }

  await ensureUserMirrored();

  const removed = await deletePostForUser({ postId, userId });
  if (!removed) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
