/**
 * Recent posts list/grid with status badges — backed by Neon in Phase 5.
 */
export default function PostsPage() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold tracking-tight">Recent Posts</h1>
      <p className="text-muted-foreground">
        Saved drafts and published posts will show here once persistence is
        wired up.
      </p>
    </div>
  );
}
