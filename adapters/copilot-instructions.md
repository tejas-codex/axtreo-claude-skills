# Axtreo GitHub Copilot Instructions

## Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS 4 (stone-* classes only)
- Backend (dev): Express.js + tsx
- Backend (prod): Cloudflare Worker + Hono framework
- Database: PostgreSQL 16 on Supabase, Prisma v7.5.0
- Auth: Custom (magic link + OTP + TOTP + Google GIS) — no Firebase Auth
- Email: Gmail API via Google Workspace service account
- AI: Gemini 2.0 Flash (lazy-init), Arc AI (credit-based)
- Hosting: Cloudflare Pages + Workers

Do NOT suggest: Firebase, Resend, SES, Render, Vercel, Fastify, SQLite for production, MongoDB.

## Security Rules
1. accountId always from session — never from request body or query params
2. No API keys or secrets in any client-side code
3. Validate input on the server (shape, type, length) — Prisma prevents SQL injection but not schema violations
4. CORS restricted to named domains only, never wildcard *
5. Soft delete financial records with deletedAt — never hard delete
6. Append-only audit tables — never delete AuditEvent rows

## Design System
- Background: #FAF8F3 (warm cream), Accent: #E85820 (coral)
- Text: #1C1210 on light backgrounds, white on dark
- Tailwind: use stone-* utilities only, never zinc-* or slate-*

## Data
- Money: always Decimal type, never Float
- Multi-step DB writes: always use Prisma $transaction()
- fiscal_month: computed on write from entity.fiscal_timezone, never at read time
- Read dashboard data from ReconciliationRun / RevenueBridgeRun compute tables

## Code Style
- Terse variable names, concise functions
- No console.log in production paths
- Explicit error handling, never swallow errors silently
- TypeScript strict mode — no implicit any
