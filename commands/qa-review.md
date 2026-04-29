---
description: Functional QA review on a PR or current branch. Acts like a QA engineer — finds broken flows, regressions, edge cases, and untested paths. Reports findings; does NOT auto-fix.
argument-hint: [PR_NUMBER]
allowed-tools: Bash, Read, Grep, TodoWrite
---

## Purpose

Run a full QA-engineer-style review of a code change BEFORE it ships. Catches the kind of issues a manual QA pass would catch:

- Broken user flows (login → dashboard → settings → save → reload)
- Console errors visible to end users
- Failed network requests on critical paths
- Missing input validation
- Edge cases not tested (empty states, error states, loading states)
- Latency / loading-time regressions
- Browser compatibility (does it render correctly?)

This is **a report**, not auto-fix. Output is a structured findings list the developer addresses manually.

---

## Step 0 — Determine the change set

```bash
if [ -n "$ARGUMENTS" ]; then
  # PR mode: check out the PR and diff against base
  REPO=$(git remote get-url origin | sed -E 's|.*github\.com[:/]([^/]+)/([^/.]+).*|\1/\2|')
  PR="$ARGUMENTS"
  gh pr checkout "$PR" --repo "$REPO"
  BASE=$(gh pr view "$PR" --repo "$REPO" --json baseRefName --jq '.baseRefName')
else
  # Local-branch mode: diff against main
  BASE=main
fi
git fetch origin "$BASE" 2>/dev/null
DIFF_FILES=$(git diff --name-only "origin/$BASE...HEAD" | grep -v '^$')
echo "Reviewing $(echo "$DIFF_FILES" | wc -l) changed files vs origin/$BASE"
```

---

## Step 1 — Run the local QA pipeline

```bash
npm run qa 2>&1 | tail -40
```

Capture exit code. If `npm run qa` fails, that's automatically a blocker — record it and continue with manual review for additional findings.

**If Playwright is installed**, also run browser smoke:
```bash
npm run qa:browser 2>&1 | tail -30
```

Capture: console errors per page, failed network requests, page load times.

---

## Step 2 — Functional flow analysis

For every changed file in `$DIFF_FILES`, ask the QA questions:

### 2a. UI / page changes (`src/pages/**`, `src/components/**`)
- Does the change touch a critical user flow? (login, signup, dashboard load, settings save, integration connect, close pack creation)
- Are there empty states? Loading states? Error states? Are they handled?
- Does the UI degrade gracefully when an API call fails?
- Is there optimistic UI that could lie to the user if the backend rejects?
- Are forms validated on both client AND server?

### 2b. API / route changes (`src/backend/routes/**`, `worker.ts`)
- Does every new route have auth middleware?
- Is input validated (zod schema or equivalent)?
- Are error responses generic (no stack traces)?
- Is rate limiting in place for sensitive endpoints?
- Does pagination exist on list endpoints? Default + max page size?

### 2c. Data layer changes (`prisma/schema.prisma`, `src/backend/db/**`, `src/backend/services/**`)
- Are queries scoped by `accountId`?
- Are soft-delete patterns respected (`where: { deletedAt: null }`)?
- New indexes for new query patterns?
- Migration safety: no data-destructive changes without explicit migration

### 2d. Auth changes (`src/backend/auth/**`, `src/contexts/AuthContext.tsx`)
- Token validation correctness
- Session cookie attributes (HttpOnly, Secure, SameSite=Strict)
- Logout actually invalidates the session
- Bypass paths (DEV_AUTH_BYPASS, support access grants) gated to non-prod

For each finding, classify severity:
- **BLOCKER** — would cause a user-visible failure or data loss
- **MAJOR** — degraded UX, missing edge case, latent bug
- **MINOR** — code quality, minor inconsistency

---

## Step 3 — Latency & performance check

```bash
# bundle size
node scripts/qa/check-bundle-budget.cjs 2>&1
```

Check critical-path response times by reading the smoke server output (`smoke-server.cjs` already captured response sizes; compare against typical baselines). If a page now takes >2× its prior latency, flag as MAJOR.

For frontend: check whether the diff added a large new dependency (`grep -E "^\\+.*\"dependencies\"" package.json`) — if yes, weigh against bundle budget.

---

## Step 4 — Output the QA report

Write the report as a comment-ready markdown block. Print it to stdout AND save to `/tmp/qa-review-$(date +%s).md` so the developer can paste it into the PR.

```
## QA Review — <PR or branch>

**Local pipeline:** npm run qa: <PASS/FAIL>; npm run qa:browser: <PASS/FAIL/SKIP>

### Blockers (N)
- <file:line>: <one-sentence finding>
- ...

### Major (N)
- ...

### Minor (N)
- ...

### Verified working
- <list of flows / routes that the smoke pass exercised cleanly>

### Not tested (gaps)
- <list of changed surfaces that smoke didn't exercise — e.g., a new admin route the smoke server doesn't hit>
```

---

## Final report

```
QA review complete:
  Files reviewed:    <N>
  Blockers:          <N>
  Major:             <N>
  Minor:             <N>
  Local QA exit:     <PASS / FAIL>
  Browser smoke:     <PASS / FAIL / SKIP>
  Report saved:      /tmp/qa-review-<ts>.md
```

If any **Blocker** found → tell the developer: `❌ Do NOT push to production. Fix blockers first.`
Otherwise → `✅ QA review clean — proceed to other perspective reviews.`
