# Ideacast implementation roadmap

This document is the **engineering phased plan** for building Ideacast. It complements the product spec (`prd.md`), system design (`srs.md`), and UX notes (`ux-design.md`). Scope and priorities can shift; update this file when phases complete or reprioritize.

**V1 focus:** LinkedIn + X (Twitter) for generated copy, previews, and (later) OAuth; post statuses `draft` → `pending` → `published`; image upload early; video and extra platforms later.

---

## Phase 0 — Foundations

- [x] Environment template (`.env.example`) and conventions for secrets  
- [x] Document v1 scope and env sections (Clerk, Neon, LLM, OAuth placeholders)  
- [x] `.gitignore` allows committing `.env.example` while ignoring real env files  

---

## Phase 1 — Authentication & app shell

- [x] Clerk (`ClerkProvider`, middleware, sign-in / sign-up routes)  
- [x] App routes: `/dashboard`, `/edit-post`, `/posts`, `/settings`, `/templates`; `/` → `/dashboard`  
- [x] Collapsible sidebar, header with theme toggle, `UserButton`  
- [x] Theming: `next-themes`, default dark, yellow accent tokens in `globals.css`  
- [x] Hydration-safe theme and Clerk UI (`useMounted` pattern where needed)  

---

## Phase 2 — Database & server data layer

- [x] Drizzle ORM + Neon (`DATABASE_URL`), `drizzle.config.ts` loading `.env` + `.env.local`  
- [x] Schema: `users` (Clerk id), `posts`, `templates`, `social_integrations` (+ enums)  
- [x] Migrations (`db/migrations`) and scripts: `db:generate`, `db:migrate`, `db:push`, `db:studio`  
- [x] Lazy `getDb()` for serverless-friendly Neon HTTP driver  
- [x] Thin queries: e.g. `upsertUserFromClerk`, template listing / seed hooks  

---

## Phase 3 — LLM formatting & New Post (core loop)

- [x] Configurable LLM: **`LLM_PROVIDER=gemini`** (Google Gemini) or **`ollama`** (local HTTP API)  
- [x] `POST /api/format` — template-driven JSON output (`linkedin`, `twitter`)  
- [x] `GET /api/templates` — global templates + idempotent default template seed  
- [x] `POST /api/posts` — create **draft** posts  
- [x] New Post UI: raw textarea, template picker, optional image (vision when supported), generate + save draft, Sonner toasts  
- [x] Side-by-side preview panels (LinkedIn / X) — extended with inline editing in Phase 4  

---

## Phase 4 — Previews & editing polish

- [x] Richer platform-faithful preview components (avatar/name chrome, typography, spacing, character counts — X 280 hard hint, LinkedIn soft guidance)  
- [x] Inline edit of generated copy via `Textarea` in each preview; hint text for edit vs save lifecycle  
- [x] Per-platform **Regenerate** (LinkedIn-only or X-only) via `regeneratePlatform` + `existingFormatted` on `POST /api/format`  
- [x] Full **Generate both** still replaces both fields; partial regen preserves the other platform’s current text (including manual edits)  

*(Debounced autosave deferred to Phase 5 optional item.)*

---

## Phase 5 — Posts lifecycle & dashboard data

- [ ] List/grid **Recent Posts** with status badges and filters  
- [ ] Full **CRUD** for posts (server actions or REST), always scoped by Clerk `userId`  
- [ ] Open/edit existing draft from list  
- [ ] Optional: autosave draft while editing  

---

## Phase 6 — OAuth & publishing

- [ ] Register OAuth apps (LinkedIn, X) and secure token storage (`social_integrations`; encrypt at rest in production)  
- [ ] Callback routes and connection UX in Settings  
- [ ] `POST` (or action) **publish** — call platform APIs, update status, handle partial failure  
- [ ] Clarify `pending` vs scheduled vs awaiting publish (product decision)  

---

## Phase 7 — Settings & templates (product)

- [ ] Settings: connected accounts, preferences, accessibility options from `ux-design.md`  
- [ ] Templates screen: list system + user templates; admin CRUD if required  
- [ ] Optional: Clerk webhooks to keep `users` in sync  

---

## Phase 8 — Billing, quality, operations

- [ ] **Stripe** (only when billing scope is defined: plans, webhooks, portal)  
- [ ] E2E / integration tests for auth + critical API paths  
- [ ] Structured logging and optional audit trail for publish events  
- [ ] Performance pass (LLM timeouts, rate limits, image size limits)  

---

## Related files

| File | Purpose |
|------|---------|
| `.env.example` | Env vars by concern (mirrors many phase boundaries) |
| `README.md` | Setup, LLM providers, scripts |
| `middleware.ts` | Public vs protected routes |

---

## Branch / release notes

Engineering has used feature branches such as `cursor/phase-*`; merge strategy and tagging are team preference. Update this section if you adopt named releases or milestones.
