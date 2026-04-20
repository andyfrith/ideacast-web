"use client";

import * as React from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2Icon, PencilIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  usePosts,
  type PostStatus,
  type PostsListFilter,
} from "@/hooks/use-posts";
import { postKeys } from "@/lib/queries/post-keys";
import { cn } from "@/lib/utils";

const FILTERS: Array<{ value: PostsListFilter; label: string }> = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "pending", label: "Pending" },
  { value: "published", label: "Published" },
];

function statusStyles(status: PostStatus) {
  switch (status) {
    case "draft":
      return "bg-muted text-muted-foreground";
    case "pending":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
    case "published":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    default:
      return "bg-muted text-muted-foreground";
  }
}

function previewSnippet(raw: string, max = 120) {
  const oneLine = raw.replace(/\s+/g, " ").trim();
  if (oneLine.length <= max) {
    return oneLine || "No raw notes yet";
  }
  return `${oneLine.slice(0, max)}…`;
}

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

/**
 * Recent posts backed by TanStack Query (`usePosts` → `GET /api/posts`), with status filter, edit and delete actions.
 */
export default function PostsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = React.useState<PostsListFilter>("all");
  const postsQuery = usePosts(filter);
  const posts = postsQuery.data ?? [];
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!globalThis.confirm("Delete this post? This cannot be undone.")) {
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(body.error ?? "Delete failed");
      }
      toast.success("Post deleted");
      void queryClient.invalidateQueries({ queryKey: postKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: postKeys.details() });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Recent Posts</h1>
        <p className="text-muted-foreground">
          Open a draft to keep editing, or remove posts you no longer need.
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by status">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            type="button"
            size="sm"
            variant={filter === f.value ? "default" : "outline"}
            className={cn("rounded-full")}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {postsQuery.isPending ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
          Loading posts…
        </div>
      ) : postsQuery.isError ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">Could not load posts</p>
          <p className="mt-1 text-muted-foreground">{postsQuery.error.message}</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-3"
            onClick={() => void postsQuery.refetch()}
          >
            Retry
          </Button>
        </div>
      ) : posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No posts in this view yet.{" "}
          <Link href="/edit-post" className="font-medium text-primary underline-offset-4 hover:underline">
            Create a new post
          </Link>
          .
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.id}>
              <article className="flex h-full flex-col rounded-xl border border-border bg-card p-4 shadow-sm">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      statusStyles(post.status),
                    )}
                  >
                    {post.status}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Updated {formatWhen(post.updatedAt)}
                  </span>
                </div>
                <p className="line-clamp-3 flex-1 text-sm text-foreground">
                  {previewSnippet(post.rawContent)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-3">
                  <Button type="button" size="sm" variant="secondary" asChild>
                    <Link href={`/edit-post?postId=${post.id}`}>
                      <PencilIcon className="size-3.5" aria-hidden />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={deletingId === post.id}
                    onClick={() => void handleDelete(post.id)}
                  >
                    {deletingId === post.id ? (
                      <Loader2Icon className="size-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Trash2Icon className="size-3.5" aria-hidden />
                    )}
                    Delete
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
