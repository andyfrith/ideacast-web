# Ideacast implementation roadmap

This document is the **engineering phased plan** for building Ideacast. It complements the product spec (`prd.md`), system design (`srs.md`), and UX notes (`ux-design.md`). Scope and priorities can shift; update this file when phases complete or reprioritize.

**V1 focus:** LinkedIn + X (Twitter) for generated copy, previews, and (later) OAuth; post statuses `draft` → `pending` → `published`; image upload early; video and extra platforms later.

---

## Phase 0 — Foundations

- Environment template (`.env.example`) and conventions for secrets  
- Document v1 scope and env sections (Clerk, Neon, LLM, OAuth placeholders)  
- `.gitignore` allows committing `.env.example` while ignoring real env files

---

## Phase 1 — Authentication & app shell

- Clerk (`ClerkProvider`, middleware, sign-in / sign-up routes)  
- App routes: `/dashboard`, `/edit-post`, `/posts`, `/settings`, `/templates`; `/` → `/dashboard`  
- Collapsible sidebar, header with theme toggle, `UserButton`  
- Theming: `next-themes`, default dark, yellow accent tokens in `globals.css`  
- Hydration-safe theme and Clerk UI (`useMounted` pattern where needed)

---

## Phase 2 — Database & server data layer

- Drizzle ORM + Neon (`DATABASE_URL`), `drizzle.config.ts` loading `.env` + `.env.local`  
- Schema: `users` (Clerk id), `posts`, `templates`, `social_integrations` (+ enums)  
- Migrations (`db/migrations`) and scripts: `db:generate`, `db:migrate`, `db:push`, `db:studio`  
- Lazy `getDb()` for serverless-friendly Neon HTTP driver  
- Thin queries: e.g. `upsertUserFromClerk`, template listing / seed hooks

---

## Phase 3 — LLM formatting & New Post (core loop)

- Configurable LLM: `**LLM_PROVIDER=gemini`** (Google Gemini) or `**ollama`** (local HTTP API)  
- `POST /api/format` — template-driven JSON output (`linkedin`, `twitter`)  
- `GET /api/templates` — global templates + idempotent default template seed  
- `POST /api/posts` — create **draft** posts  
- New Post UI: raw textarea, template picker, optional image (vision when supported), generate + save draft, Sonner toasts  
- Side-by-side preview panels (LinkedIn / X) — extended with inline editing in Phase 4

---

## Phase 4 — Previews & editing polish

- Richer platform-faithful preview components (avatar/name chrome, typography, spacing, character counts — X 280 hard hint, LinkedIn soft guidance)  
- Inline edit of generated copy via `Textarea` in each preview; hint text for edit vs save lifecycle  
- Per-platform **Regenerate** (LinkedIn-only or X-only) via `regeneratePlatform` + `existingFormatted` on `POST /api/format`  
- Full **Generate both** still replaces both fields; partial regen preserves the other platform’s current text (including manual edits)

*(Debounced autosave deferred to Phase 5 optional item.)*

---

## Phase 5 — Posts lifecycle & dashboard data

- List/grid **Recent Posts** with status badges and filters  
- Full **CRUD** for posts (server actions or REST), always scoped by Clerk `userId`  
- Open/edit existing draft from list  
- **TanStack Query** for loading a post on `/edit-post` (`usePost` in `hooks/use-post.ts`), `QueryProvider` + **React Query DevTools** (development only) in the authenticated shell  
- Optional: autosave draft while editing

---

## Phase 6 — OAuth & publishing

- Register OAuth apps (LinkedIn, X) and secure token storage (`social_integrations`; encrypt at rest in production)  
- Callback routes and connection UX in Settings  
- `POST` (or action) **publish** — call platform APIs, update status, handle partial failure  
- Clarify `pending` vs scheduled vs awaiting publish (product decision)

---

## Phase 7 — Settings & templates (product)

- Settings: connected accounts, preferences, accessibility options from `ux-design.md`  
- Templates screen: list system + user templates; admin CRUD if required  
- Optional: Clerk webhooks to keep `users` in sync

---

## Phase 8 — Billing, quality, operations

- **Stripe** (only when billing scope is defined: plans, webhooks, portal)  
- E2E / integration tests for auth + critical API paths  
- Structured logging and optional audit trail for publish events  
- Performance pass (LLM timeouts, rate limits, image size limits)

---

## Related files


| File                                      | Purpose                                               |
| ----------------------------------------- | ----------------------------------------------------- |
| `.env.example`                            | Env vars by concern (mirrors many phase boundaries)   |
| `README.md`                               | Setup, LLM providers, scripts, TanStack Query notes   |
| `middleware.ts`                           | Public vs protected routes                            |
| `components/providers/query-provider.tsx` | TanStack Query client + DevTools (dev)                |
| `hooks/use-post.ts`                       | `usePost` / `fetchPostById` for `GET /api/posts/[id]` |
| `hooks/use-posts.ts`                      | `usePosts` / `fetchPostsList` for `GET /api/posts`    |
| `lib/queries/post-keys.ts`                | Query key factory for posts                           |


---

## Branch / release notes

Engineering has used feature branches such as `cursor/phase-`*; merge strategy and tagging are team preference. Update this section if you adopt named releases or milestones.