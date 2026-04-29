---
description: Security review on a PR or current branch. Acts like a security engineer — looks for OWASP Top 10, auth bypass, injection, secrets exposure, cross-tenant access. Reports findings; does NOT auto-fix.
argument-hint: [PR_NUMBER]
allowed-tools: Bash, Read, Grep, TodoWrite
---

## Purpose

Security-focused review BEFORE production. Maps to OWASP Top 10 + Axtreo-specific concerns (multi-tenant accountId boundary, Cloudflare Worker secrets model, Gmail API service account).

This is the kind of pass an external security auditor or red team would do. Output is a structured findings list — no auto-fix; security changes require human judgment.

---

## Step 0 — Determine the change set

Same as `/qa-review` step 0 — get $DIFF_FILES vs origin/$BASE.

---

## Step 1 — Static security scans

### 1a. Sensitive value logging
```bash
bash scripts/qa/check-patterns.sh
```

### 1b. Gitleaks (full history) — costly locally; rely on GitHub PR-gate, but quick local pass on the diff:
```bash
git diff origin/$BASE...HEAD | grep -iE "AKIA[0-9A-Z]{16}|sk_live_|sk_test_|ghp_[a-zA-Z0-9]{36}|xox[bps]-[a-zA-Z0-9-]+|-----BEGIN.*KEY-----" | head -20
```
Any hit = BLOCKER. Rotate the secret AND rewrite history before merging.

### 1c. npm audit
```bash
npm audit --audit-level=high 2>&1 | head -30
```
HIGH+ CVEs in production deps = MAJOR (block production push if exploit path is reachable).

---

## Step 2 — OWASP Top 10 lens

For every changed file, check each applicable category:

### A01 — Broken Access Control
- Every `prisma.findX` / `prisma.update` / `prisma.delete` must be scoped to `accountId` (from session, NEVER from request body).
- Search the diff for: `prisma\.\w+\.(find|update|delete)` — is `accountId` in the where clause?
- Cross-tenant query = **BLOCKER**.
- Operator/admin routes: are they gated by role rank? (See `src/backend/rbac/`.)

### A02 — Cryptographic Failures
- New code using `Math.random()` for tokens / IDs → **BLOCKER**. Use `crypto.randomUUID()` / `crypto.randomBytes()`.
- Hashing passwords/secrets with anything other than argon2 / bcrypt / scrypt → **BLOCKER**.
- Storing tokens unhashed → **MAJOR**. Session tokens must be stored as SHA-256 hash, raw token only in cookie.

### A03 — Injection
- SQL: only Prisma is allowed. Raw `prisma.$queryRaw` with template strings = **MAJOR** unless using `Prisma.sql` parameterized.
- Shell: `child_process.exec` with user input = **BLOCKER**. Use `execFile` with array args.
- HTML: dangerouslySetInnerHTML in changed React = **MAJOR** unless input is sanitized.

### A04 — Insecure Design
- New rate-limiter? Verify per-user, not just per-IP (NAT defeats per-IP).
- New OTP / token issuance? Verify max-attempts and lockout.
- Magic-link / reset flows: verify single-use and expiry.

### A05 — Security Misconfiguration
- New CORS config: must NOT include `origin: '*'` or `credentials: true` with broad origin.
- New CSP entry: verify it's not overly permissive (`*`, `unsafe-eval`, `unsafe-inline` for scripts = **MAJOR**).
- New cookie: verify `HttpOnly`, `Secure` (in prod), `SameSite=Strict`.

### A06 — Vulnerable Components
- See npm audit (Step 1c).
- Look for pinned-to-major (e.g., `^1.2.0`) changes in the diff — are they getting silent transitive updates?

### A07 — Identification and Authentication Failures
- New login path: rate-limited?
- Session fixation: does login regenerate the session ID?
- Logout: does it actually invalidate server-side?
- Account enumeration: does login error message reveal whether the email exists?

### A08 — Software and Data Integrity
- New webhooks: signature verification (HMAC) before processing?
- New ingestion: is the audit trail (`AuditEvent`) appended for every state change?
- Append-only invariant: no `deletedAt` added to `AuditEvent`/`OperatorAuditEvent`?

### A09 — Logging and Monitoring Failures
- Sensitive values in logs (Step 1a). 
- Error responses leaking stack traces or DB errors (Step 1a).

### A10 — SSRF
- Any `fetch()` / `http.get` with user-controlled URL = **MAJOR**. Whitelist allowed domains.

---

## Step 3 — Axtreo-specific security checks

### 3a. accountId boundary (THE Golden Rule)
For every new DB query in the diff, verify accountId comes from the session (`req.user.accountId` / `c.get('accountId')`), NEVER from `req.body.accountId` / `req.query.accountId`.

### 3b. Worker env access
- Worker code uses `c.env.X`, never `process.env.X`. (Captured by check-patterns.sh.)
- Worker secrets list is in `.claude/memory/cloudflare_deployment.md` — any new secret added must also be added there + via `wrangler secret put`.

### 3c. Public-vs-private VITE_ vars
- `VITE_*` vars are baked into the public JS bundle. Any name that suggests a server secret = **BLOCKER**.

### 3d. Auth bypass paths
- `DEV_AUTH_BYPASS` only honored when `NODE_ENV !== 'production'`.
- Support access grants: scoped, time-limited, audit-logged.

---

## Step 4 — Output the security report

```
## Security Review — <PR or branch>

**Static scans:** patterns: <PASS/FAIL>; gitleaks-on-diff: <PASS/FAIL>; npm audit HIGH+: <count>

### Blockers (N)
[OWASP category | file:line] one-sentence finding + impact

### Major (N)
...

### Minor (N)
...

### Verified safe
- <files reviewed and cleared>
```

Save to `/tmp/security-review-$(date +%s).md`.

---

## Final report

```
Security review complete:
  Files reviewed:        <N>
  Blockers:              <N>
  Major:                 <N>
  Minor:                 <N>
  Patterns scan:         <PASS/FAIL>
  npm audit HIGH+:       <N CVEs>
  Report saved:          /tmp/security-review-<ts>.md
```

Any **Blocker** = `❌ Do NOT push. Security gate failed.` Otherwise = `✅ Security review clean.`
