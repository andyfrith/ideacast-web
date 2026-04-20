<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

**Client/server data:** The `(app)` layout wraps the shell in `QueryProvider` (TanStack Query). Prefer **`usePost`** in `hooks/use-post.ts` for a single post (`GET /api/posts/[id]`) and **`usePosts`** in `hooks/use-posts.ts` for the list (`GET /api/posts`), with **`postKeys`** in `lib/queries/post-keys.ts` for invalidation; avoid ad-hoc list `fetch` in feature code. Keep React Query DevTools development-only via `QueryProvider`.
<!-- END:nextjs-agent-rules -->
