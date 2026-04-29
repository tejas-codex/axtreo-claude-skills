---
allowed-tools: Bash, Read, Grep
description: Gap analysis — finds incomplete implementations, missing guardrails, and feature completeness issues in changed code
---

## Purpose

Find what is **MISSING** from this PR: incomplete implementations, absent guardrails, unfinished flows, missing audit trails, and feature gaps. Not bugs — omissions. Surface them so the team can ship something complete, not just something that compiles.

## Output format (strict — no exceptions)

```
LENS:gaps B:<n> M:<n> m:<n> t:<n> GAP:<total>
GAP: <file:line> — <what's missing> → Add: <one-sentence action>  [B|M|m|t]
PATTERN: <new reusable gap pattern not in PATTERNS.md, or "none">
```

- `B` = blocks merge (e.g. missing auth guard on new route, missing input validation on write endpoint)
- `M` = major completeness issue (e.g. missing audit event on state mutation, missing soft-delete on financial model)
- `m` = minor gap (e.g. missing null guard on non-critical path, missing error state in UI)
- `t` = trivial (e.g. missing loading spinner, missing JSDoc on exported function)
- `GAP` = total count of all gap lines (sum of B+M+m+t in this lens)

Max **8 GAP lines**. Highest-severity first. No prose outside these lines. ~250 tokens max.

---

## What to scan

### Always check (every PR)

**1. Incomplete implementations**
Grep for: `TODO`, `FIXME`, `throw new Error('not implemented')`, `throw new Error('TODO')`, `return null // TODO`, `return [] // TODO`, placeholder strings like `'stub'` or `'mock'` in non-test files, empty function bodies `{ }` on exported functions.

**2. Missing audit trail**
Any function that changes state (create / update / delete / approve / revoke / seal / grant / deny) without a `prisma.auditEvent.create()` call nearby (within the same function or explicit transaction). AuditEvent is append-only — missing entries are unrecoverable data loss for compliance.

**3. Missing soft-delete**
New Prisma models in `schema.prisma` that hold financial data, user data, or audit evidence without a `deletedAt DateTime?` field. Hard deletes on these models violate GAAP audit trail requirements.

**4. Unscoped data**
New Prisma models or queries that handle per-workspace data without `accountId String` on the model AND `where: { accountId }` in every query. Missing scope = cross-tenant data leak.

**5. Missing input validation**
New API route handlers (`router.post`, `router.put`, `router.patch`) that touch `req.body` without a `zod.parse()` / `z.object().parse()` or equivalent. Every write endpoint must validate shape + type + length at the boundary.

**6. Missing auth guard**
New route files or router registrations that attach routes without `requireAuth` / `requireSession` / `isAuthenticated` middleware. Public routes must be explicitly opt-in; default is protected.

**7. Missing error handling**
New `async` functions that call external services (Stripe, QuickBooks, Gmail API, Gemini, Supabase) without a `try/catch` or `.catch()`. External calls WILL fail — unhandled rejections crash the Worker.

**8. Missing UI states**
New React components that fetch data (via `useEffect`, `useSWR`, `useQuery`) but render no loading indicator and no error fallback. Users see blank screens on slow connections or API errors.

**9. Missing null guards**
Accessing `.id`, `.name`, `.amount`, `.accountId`, `.entityId` on values typed as `T | null | undefined` without an explicit null check. TypeScript `!` assertions on nullable fields count as missing guards.

**10. Dead-end flows**
New form submissions or mutation calls that have no success feedback (toast, redirect, state update) or error feedback (error message, retry option) after completion. Users can't tell if their action worked.

---

## Axtreo-specific checks

- `fiscal_month` must be set from `entity.fiscal_timezone` — never `account.fiscal_timezone`, never re-derived at read time
- `accountId` in API handlers must come from `req.session` / `req.user` — never from `req.body` or `req.query`
- New Cloudflare Worker endpoints without `RATE_LIMIT_KV` rate limiting (especially write/mutation endpoints)
- Gemini / AI calls without graceful degradation if `GEMINI_API_KEY` is absent (lazy-init pattern required)
- New OAuth flows without HMAC-signed `state` parameter verification before token exchange
- New `IntegrationConnection` records without `encryptedCredentials` field-level encryption

---

## Process

1. Read `$CHANGED_FILES` and `$CHANGED_SYMBOLS` from the shared context block
2. For each changed backend file: grep for patterns 1–9 above
3. For each changed frontend file: check patterns 8, 9, 10
4. For schema changes: check patterns 3, 4
5. Score each gap: B if it enables data loss or auth bypass, M if it breaks audit/compliance/scoping, m if it degrades reliability, t if it degrades UX/DX
6. Output top 8 gaps by severity, then PATTERN line
