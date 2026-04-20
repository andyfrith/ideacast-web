import { z } from "zod";

import { EditPostClient } from "./edit-post-client";

type EditPostPageProps = {
  searchParams: Promise<{ postId?: string | string[] }>;
};

/**
 * Content creation: raw input, optional image, LLM formatting, previews, draft save.
 * When `postId` is present, the client loads that post with TanStack Query (`usePost` in `edit-post-client.tsx`).
 */
export default async function EditPostPage({ searchParams }: EditPostPageProps) {
  const sp = await searchParams;
  const raw = sp.postId;
  const fromQuery =
    typeof raw === "string" && raw.length > 0 ? raw : null;
  const postId =
    fromQuery && z.string().uuid().safeParse(fromQuery).success
      ? fromQuery
      : null;
  const invalidId = Boolean(fromQuery) && !postId;
  const formKey = postId ?? "new";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">
          {postId ? "Edit post" : "New Post"}
        </h1>
        <p className="text-muted-foreground">
          {postId
            ? "Your saved content is loaded below. Regenerate, edit previews, and save to update the draft."
            : "Add rough notes, pick a template, then generate copy. Edit previews inline, regenerate one platform at a time, and save a draft anytime."}
        </p>
        {invalidId ? (
          <p className="text-sm text-destructive" role="alert">
            The post id in the URL is not valid. Start a new post below or fix the link.
          </p>
        ) : null}
      </div>
      <EditPostClient initialPostId={postId} formKey={formKey} />
    </div>
  );
}
