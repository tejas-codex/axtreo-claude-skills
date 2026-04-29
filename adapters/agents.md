# Axtreo Agent Instructions

## Project
Axtreo — Revenue Close OS for SaaS $0–$50M ARR.
Stack: React 19 + TypeScript + Cloudflare Worker (Hono) + PostgreSQL 16 + Prisma v7.5.0

## Security Constraints (Non-Negotiable)
- `accountId` must come from authenticated session. Never from request body or URL params.
- No API keys, secrets, or tokens in any client-side code or git-tracked files.
- Server-side validation required on all inputs (type, shape, length).
- CORS restricted to: https://app.axtreo.com, https://axtreo.com, https://axtreo-app.pages.dev
- All financial records use soft deletes (deletedAt field). No hard deletes.
- AuditEvent table is append-only. Never issue DELETE on it.

## Stack Constraints
- Production backend: Cloudflare Worker + Hono (worker.ts). Dev: Express (server.ts).
- Database: PostgreSQL 16 via Prisma with @prisma/adapter-pg. Decimal for money.
- Auth: Custom implementation (magic link + OTP + TOTP + Google GIS). No Firebase.
- Email: Gmail API via service account. No Resend, SES, or SMTP.
- Hosting: Cloudflare Pages (frontend) + Workers (API). No Vercel/Render.
- Animations: motion/react for UI, GSAP for scroll sequences.

## Code Rules
- Branch → PR → merge. Never commit directly to main.
- Prisma $transaction() for any multi-step writes.
- fiscal_month computed on write, never at read time.
- Dashboard reads from ReconciliationRun / RevenueBridgeRun (compute layer), not raw tables.
- Tailwind: stone-* classes for warm cream palette (#FAF8F3 background, #E85820 accent).

## Before Implementing Features
1. Check if feature already exists in src/ and prisma/schema.prisma
2. Identify accountId scoping level (workspace / entity / user / global)
3. Plan: does this need a new Prisma model? New route? New component?
4. Write types and validation first, then implementation.
