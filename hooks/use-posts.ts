"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import { postKeys } from "@/lib/queries/post-keys";

export type PostStatus = "draft" | "pending" | "published";

export type PostsListFilter = PostStatus | "all";

/** Row shape for list cards (`GET /api/posts`). */
export type PostListItemDto = {
  id: string;
  rawContent: string;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
};

/**
 * Fetches posts for the signed-in user (`GET /api/posts`, optional `?status=`).
 *
 * @param statusFilter - `all` or a concrete post status.
 */
export async function fetchPostsList(
  statusFilter: PostsListFilter,
): Promise<PostListItemDto[]> {
  const q =
    statusFilter === "all"
      ? ""
      : `?status=${encodeURIComponent(statusFilter)}`;
  const res = await fetch(`/api/posts${q}`);
  const body = (await res.json()) as {
    posts?: PostListItemDto[];
    error?: string;
  };
  if (!res.ok) {
    throw new Error(body.error ?? "Could not load posts");
  }
  return body.posts ?? [];
}

/**
 * TanStack Query wrapper for the recent posts list.
 *
 * @param statusFilter - Filter sent as `?status=`; use `"all"` to omit the param.
 */
export function usePosts(
  statusFilter: PostsListFilter,
): UseQueryResult<PostListItemDto[], Error> {
  const keySegment = statusFilter === "all" ? "all" : statusFilter;

  return useQuery({
    queryKey: postKeys.list(keySegment),
    queryFn: () => fetchPostsList(statusFilter),
  });
}
