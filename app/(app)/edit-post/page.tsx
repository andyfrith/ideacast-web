import { EditPostForm } from "@/components/edit-post/edit-post-form";

/**
 * Content creation: raw input, optional image, LLM formatting, previews, draft save.
 */
export default function EditPostPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">New Post</h1>
        <p className="text-muted-foreground">
          Add rough notes, pick a template, then generate polished LinkedIn and X
          copy. Save a draft anytime.
        </p>
      </div>
      <EditPostForm />
    </div>
  );
}
