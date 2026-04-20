"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2Icon } from "lucide-react";

import { EditPostForm } from "@/components/edit-post/edit-post-form";
import { Button } from "@/components/ui/button";
import { usePost } from "@/hooks/use-post";

export type EditPostClientProps = {
  initialPostId: string | null;
  formKey: string;
};

/**
 * Client shell for `/edit-post`: loads an existing post via `usePost` before rendering the editor.
 */
export function EditPostClient({ initialPostId, formKey }: EditPostClientProps) {
  const postQuery = usePost(initialPostId);

  if (initialPostId) {
    if (postQuery.isPending) {
      return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2Icon className="size-4 animate-spin" aria-hidden />
          Loading post…
        </div>
      );
    }
    if (postQuery.isError) {
      return (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          <p className="font-medium text-destructive">Could not load this post</p>
          <p className="mt-1 text-muted-foreground">{postQuery.error.message}</p>
          <Button type="button" variant="secondary" className="mt-3" asChild>
            <Link href="/posts">Back to posts</Link>
          </Button>
        </div>
      );
    }
  }

  return (
    <EditPostForm
      key={formKey}
      initialPostId={initialPostId}
      initialPostSnapshot={
        initialPostId && postQuery.isSuccess ? postQuery.data : null
      }
    />
  );
}
