# Ideacast

Web app for capturing ideas, generating **LinkedIn** and **X (Twitter)** copy with templates, previewing posts, and (later) publishing via OAuth. Stack: **Next.js**, **Clerk**, **Drizzle** + **Neon**, **Tailwind** / **shadcn-style** UI.

## Prerequisites

- [Bun](https://bun.sh) (or npm/pnpm)
- [Clerk](https://clerk.com) application keys
- [Neon](https://neon.tech) Postgres `DATABASE_URL` (after schema migrations)

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

- `prd.md` — product requirements  
- `srs.md` — system / technical design  
- `ux-design.md` — UI notes  

---

This project was bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app). See [Next.js documentation](https://nextjs.org/docs) for framework details.
