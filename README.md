# Ideacast

Web app for capturing ideas, generating **LinkedIn** and **X (Twitter)** copy with templates, previewing posts, and (later) publishing via OAuth. Stack: **Next.js**, **Clerk**, **Drizzle** + **Neon**, **TanStack Query** (client server state for posts), **Tailwind** / **shadcn-style** UI.

## Prerequisites

- [Bun](https://bun.sh) (or npm/pnpm)
- [Clerk](https://clerk.com) application keys
- [Neon](https://neon.tech) Postgres `DATABASE_URL`, **or** local Postgres via Docker (see below)

## Setup

```bash
bun install
cp .env.example .env.local
```

Fill `.env.local` with at least Clerk keys, `DATABASE_URL`, and LLM settings (see below).

Apply the database schema:

```bash
bun run db:migrate
```

Run the dev server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local Postgres (Docker)

The app’s default DB client targets **Neon’s HTTP driver** (`@neondatabase/serverless`). A **standard Postgres** instance (e.g. `docker-compose.yml` in this repo) speaks TCP only, so the app **auto-switches to the `pg` driver** when `DATABASE_URL` points at `localhost` / `127.0.0.1` (see `db/index.ts`). Override anytime with `DATABASE_DRIVER=pg` or `DATABASE_DRIVER=neon`.

1. Start Postgres: `docker compose up -d`
2. In `.env.local`, set a URL that matches `docker-compose.yml` and disables SSL from the host (typical for local Docker):

   `DATABASE_URL=postgresql://postgres:mypassword@localhost:5432/postgres?sslmode=disable`

3. Apply schema: `bun run db:migrate`

If you omit `?sslmode=disable`, Node may try TLS and fail with SSL-related connection errors.

## TanStack Query (client data)

The authenticated app shell wraps routes in a shared [`QueryClient`](https://tanstack.com/query/latest) (`components/providers/query-provider.tsx`). Loading an existing post on **`/edit-post`** uses the **`usePost`** hook in `hooks/use-post.ts` (backed by `GET /api/posts/[id]`). The **Recent Posts** list on **`/posts`** uses **`usePosts`** in `hooks/use-posts.ts` (`GET /api/posts` with optional `?status=`). Query keys for posts live in `lib/queries/post-keys.ts`.

In **development**, [React Query DevTools](https://tanstack.com/query/latest/docs/framework/react/devtools) appear as a floating control (bottom-left by default). They are not bundled for production UI.

## LLM configuration (content generation)

Formatting uses **`LLM_PROVIDER`** — either **`gemini`** or **`ollama`**. There is no OpenAI integration.

### Google Gemini (recommended for Vercel / cloud)

Set in `.env.local`:

```bash
LLM_PROVIDER=gemini
GEMINI_API_KEY=your_key_from_google_ai_studio
```

Optional: `GEMINI_MODEL` (default `gemini-2.0-flash`).  
The SDK also accepts `GOOGLE_GENERATIVE_AI_API_KEY` if you already use that name.

Get a key: [Google AI Studio](https://aistudio.google.com/apikey).

### Ollama (local)

Install [Ollama](https://ollama.com), pull a model, then run the server locally.

```bash
LLM_PROVIDER=ollama
# Optional — defaults shown
# OLLAMA_BASE_URL=http://127.0.0.1:11434
# OLLAMA_MODEL=llama3.2
```

**Images:** use a vision-capable model (e.g. `llava`) and set `OLLAMA_MODEL` accordingly.

**Deploying to Vercel:** serverless functions cannot reach `127.0.0.1` on your laptop. Use **Gemini** in production, or run Ollama on a host reachable from the internet and set `OLLAMA_BASE_URL` to that URL (treat access control seriously).

## Scripts

| Script            | Description                |
| ----------------- | -------------------------- |
| `bun dev`         | Next.js dev server         |
| `bun run build`   | Production build           |
| `bun run lint`    | ESLint                     |
| `bun run db:migrate` | Apply Drizzle migrations |
| `bun run db:studio`  | Drizzle Studio           |

## Docs in repo

- `ROADMAP.md` — phased implementation plan (engineering roadmap)  
- `prd.md` — product requirements  
- `srs.md` — system / technical design  
- `ux-design.md` — UI notes  

---

This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). See [Next.js documentation](https://nextjs.org/docs) for framework details.
