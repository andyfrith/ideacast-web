"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";

import { postKeys } from "@/lib/queries/post-keys";

/** Post row shape returned by `GET /api/posts/[id]`. */
export type PostDto = {
  id: string;
  rawContent: string;
  formattedContent: Record<string, unknown>;
  imageUrl: string | null;
  status?: string;
};

function isUuid(value: string): boolean {
  return z.string().uuid().safeParse(value).success;
}

/**
 * Fetches one post for the signed-in user (`GET /api/posts/[id]`).
 *
 * @param postId - Post UUID.
 */
export async function fetchPostById(postId: string): Promise<PostDto> {
  const res = await fetch(`/api/posts/${postId}`);
  const body = (await res.json()) as { post?: PostDto; error?: string };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not load post");
  }
  if (!body.post) {
    throw new Error("Invalid response");
  }
  return body.post;
}

/**
 * TanStack Query wrapper for retrieving one post by id.
 *
 * @param postId - UUID from the URL, or `null` for a new post (query disabled).
 */
export function usePost(postId: string | null): UseQueryResult<PostDto, Error> {
  const id = postId && isUuid(postId) ? postId : null;

  return useQuery({
    queryKey: postKeys.detail(id ?? "__none__"),
    queryFn: () => fetchPostById(id!),
    enabled: Boolean(id),
  });
}
