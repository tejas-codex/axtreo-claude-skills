# Axtreo Engineering Rules

> Master context file. All tools read this. Generated from axtreo-app source of truth.

---

## What We Build

**Axtreo** — Revenue Close OS for SaaS $0–$50M ARR. Replaces ChartMogul + Synder + bookkeeper + AR tool with one reconciled, audit-ready platform.

Tagline: "Your books should close themselves."  
Model: printer (data sync free) + ink (AI credits paid).

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS 4 |
| Backend (dev) | Express.js via `tsx server.ts` |
| Backend (prod) | Cloudflare Worker + Hono framework (`worker.ts`) |
| Database | PostgreSQL 16 on Supabase |
| ORM | Prisma v7.5.0 + `@prisma/adapter-pg` |
| Auth | Custom: magic link + OTP + TOTP 2FA + Google GIS |
| AI | Gemini 2.0 Flash (lazy-init) + Arc AI (credit-based) |
| Email | Gmail API via Google Workspace service account |
| Hosting | Cloudflare Pages (frontend) + Cloudflare Workers (API) |
| Animations | motion/react (UI) + GSAP + ScrollTrigger (scroll sequences) |

Never suggest: SQLite for production, MongoDB, Firebase Auth, Resend, SES, Render, Vercel, Fastify.

---

## The Golden Rule

**Account = Workspace = Company.**  
`accountId` is the security boundary. Always from session — NEVER from `req.body` or query params. No cross-tenant data ever.

---

## Security Rules (Always Active)

1. **No secrets client-side.** API keys live in server env vars only. Never ship in JS bundle.
2. **Validate all input server-side.** Frontend validation = suggestion. Backend = law. Prisma handles SQL injection but validate shape/type/length.
3. **No plain-text passwords.** Not relevant now (magic link + OTP) but enforce if ever added.
4. **CORS: allowed origins only.** Never `*` in production. Only Axtreo domains.
5. **CSP must list all external scripts.** `apis.google.com` + `accounts.google.com` in both dev and prod `scriptSrc`. Missing = silent breakage.
6. **Validate post-login redirects.** `resolvePostLoginRoute()` uses `/^\/[^/]/` to prevent open redirect.

---

## Design System (Warm Cream — Non-Negotiable)

```
Background:    #FAF8F3   (warm cream)
Surface/Card:  #FFFEFB
Border:        rgba(139,58,20,0.10)   (warm brown, subtle)
Text primary:  #1C1210   (warm charcoal)
Text muted:    rgba(139,58,20,0.55)
Accent coral:  #E85820   (primary)
Hover coral:   #C94A10
```

**Tailwind**: `stone-*` only. Never `zinc-*` or `slate-*` on light sections.  
**Anti-pattern**: `text-background-dark` on cream = INVISIBLE. Use `text-[#1C1210]` on light, `text-white` on dark.

---

## Data Architecture Rules

**4 scoping levels:**
- Workspace (`accountId` only) — settings, sessions, members
- Entity (`accountId + entityId`) — financial data, journal entries
- User (`userId` only) — personal auth tokens, TOTP
- Global (no scope) — FX rates, feature flags

**Always:**
- `accountId` from session, never from request
- Soft deletes: `deletedAt DateTime?` on all financial models (no hard deletes)
- Audit tables: append-only, never delete `AuditEvent` rows
- `fiscal_month` computed ONCE on write from `entity.fiscal_timezone` — never re-derived at read time
- Dashboard reads from compute tables (`ReconciliationRun`, `RevenueBridgeRun`) — never raw facts

---

## Coding Standards

- **Prisma**: `$transaction()` for multi-step writes. `Decimal` types for money. Never `Float`.
- **Routes**: `accountId` extracted from session middleware, not body.
- **Error handling**: Never expose internal stack traces to client.
- **Soft delete**: `where: { deletedAt: null }` on every query touching financial models.
- **Audit**: Write `AuditEvent` before + after JSON on every state change.
- **No `console.log`** in production paths. Use structured logging.

---

## PR Workflow (Non-Negotiable)

Always: `branch → commit → PR → merge`. Never push directly to `main`.

Why: CodeRabbit reviews every PR automatically. Direct pushes bypass review.

```bash
git checkout -b feat/my-feature
# code, commit
git push -u origin feat/my-feature
gh pr create --base main
# wait for CodeRabbit, fix comments, merge
```

---

## Pre-Build Research Process

Before coding any new feature, run this research flow:

1. **Codebase scan** — does it exist? Check `src/` + Prisma schema + routes
2. **Jira check** — is it in-progress or already done? Never re-spec shipped work
3. **Confluence check** — any architecture decisions already made?
4. **Competitor research** — what do FloQast, ChartMogul, Maxio, Puzzle do here?
5. **Classify**: A (moat/build first) | B (standard/replicate) | C (copy) | D (skip)
6. **Ship order**: P0 (hours) | P1 (quick wins) | P2 (strategic, days)

Only build after this. No assumptions.

---

## Prompt Framework (Auto-Applied)

Every interaction runs this decision gate silently:

| Context | Mode |
|---|---|
| New question | STRUCTURE — 5-part framework |
| "yes/proceed/ok/next" | EXECUTE — skip restructure |
| Established system active | CONSTRAIN — work within it |
| Vague / <8 words | CLARIFY — state interpretation, ask ONE question |
| Image only | ANALYZE — extract → infer → apply |

**5-part framework:**
1. Role + Goal (infer from input: debug→Debugger, design→Architect, UI→React Engineer, API→Backend)
2. Context (inject user_input + project_context + read actual files — never guess)
3. Framework: Debug→CoT | Design→RODES | Explain→RACE | Diagnose→RISE | Task→RTF
4. Examples (only when format non-obvious, 2–3 max)
5. Constraints: `accountId=session | branch→PR→merge | cream palette | no secrets client-side | soft delete | audit=append-only`

Output length: quick=1-4 sentences | bug=diff+1 line | feature=full impl | design=rec+tradeoff+next

---

## Communication Style

Terse. No fluff. All substance stays.

Drop: articles (a/an/the), filler (just/really/basically/actually), pleasantries (sure/happy to/certainly), hedging.  
Fragments OK. Short synonyms. Technical terms exact.

Pattern: `[thing] [action] [reason]. [next step].`

**Not:** "Sure! I'd be happy to help. The issue is likely caused by..."  
**Yes:** "Bug in auth middleware. Token expiry check `<` not `<=`. Fix:"

Exception: security warnings, irreversible ops — write full sentences.

---

## Multi-Model Strategy

| Task | Model |
|---|---|
| Context lookups, cheap searches | Haiku |
| Main coding, reviews, analysis | Sonnet (default) |
| Complex architecture, critical security decisions | Opus |
| Web research, competitor analysis | Sonnet |

---

## Pricing Tiers

FREE · SOLO ($29) · STARTER ($75, "Most Popular") · GROWTH ($499) · SCALE ($799)

LTD: 150 licenses ($59/$149/$299), infrastructure fee after 24 months.

---

## Never Do

- Direct push to `main`
- `accountId` from request body
- Secrets in client code
- Hard delete financial records
- `zinc-*` or `slate-*` on light backgrounds
- `Float` for money fields
- Re-derive `fiscal_month` at read time
- Suggest SQLite/MongoDB/Firebase/Render/Vercel for production
