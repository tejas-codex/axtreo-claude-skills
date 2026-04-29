---
description: Run ALL pre-production reviews (QA + security + compliance + finance + bypass) in parallel via subagents. Aggregates verdicts, blocks on any blocker. The single command to run before pushing to production.
argument-hint: [PR_NUMBER]
allowed-tools: Bash, Read, Grep, TodoWrite, Task
---

## Purpose

The single gate before any change ships to production. Combines five perspective reviews — **QA, Security, Compliance, Finance, Adversarial** — plus the local `npm run qa` pipeline, plus a CodeRabbit-comment sweep.

Each perspective runs in PARALLEL as a subagent so the whole thing finishes in ~3-5 min instead of 25 min sequentially.

If ANY perspective returns a Blocker → push is **NOT SAFE**.
If only Major / Minor issues → push is conditional, developer's call after reviewing.
If all clean → push is **SAFE**.

---

## Step 0 — Determine the change set

```bash
if [ -n "$ARGUMENTS" ]; then
  REPO=$(git remote get-url origin | sed -E 's|.*github\.com[:/]([^/]+)/([^/.]+).*|\1/\2|')
  PR=$ARGUMENTS
  gh pr checkout $PR --repo $REPO 2>&1 | tail -3
  BASE=$(gh pr view $PR --repo $REPO --json baseRefName --jq '.baseRefName')
  TARGET="PR #$PR"
else
  BASE=main
  TARGET="local branch $(git rev-parse --abbrev-ref HEAD)"
fi
git fetch origin $BASE 2>&1 | tail -1
DIFF_FILES=$(git diff --name-only origin/$BASE...HEAD | grep -v '^$')
N=$(echo "$DIFF_FILES" | wc -l)
echo "Pre-prod review on $TARGET — $N changed files vs origin/$BASE"
echo ""
```

---

## Step 1 — Local QA pipeline (foundation)

```bash
echo "→ running npm run qa..."
set -o pipefail
npm run qa 2>&1 | tail -25
QA_EXIT=${PIPESTATUS[0]}
set +o pipefail
```

If `QA_EXIT != 0`, the local foundation failed — record it but continue with perspective reviews so the developer gets the FULL report in one pass.

---

## Step 2 — Spawn perspective subagents in parallel

Use the Task tool to launch FIVE subagents simultaneously. Each gets a focused prompt and returns its findings. Spawn ALL FIVE in a single message with multiple Task tool calls so they execute concurrently.

**Subagent 1: QA**
> Run the workflow described in `.claude/commands/qa-review.md` against the current branch (BASE=$BASE, files=$DIFF_FILES). Report findings under 400 words: Blocker/Major/Minor counts and one-line summaries of the 3 most important issues.

**Subagent 2: Security**
> Run the workflow described in `.claude/commands/security-review.md`. Report under 400 words.

**Subagent 3: Compliance**
> Run the workflow described in `.claude/commands/compliance-review.md`. Report under 400 words.

**Subagent 4: Finance**
> Run the workflow described in `.claude/commands/finance-review.md`. Report under 400 words.

**Subagent 5: Adversarial**
> Run the workflow described in `.claude/commands/bypass-review.md`. Report under 400 words.

Wait for all five to return.

---

## Step 3 — CodeRabbit sweep (if PR mode)

If `$ARGUMENTS` was a PR number, also pull CodeRabbit's findings:

```bash
gh api "repos/$REPO/pulls/$PR/comments?per_page=100" --paginate \
  --jq "[.[] | select(.user.login==\"coderabbitai[bot]\")] | length"
```

If there are unresolved CodeRabbit comments, add them to the report: "CodeRabbit has N open comments on PR #$PR — run `/cr-review $PR` to address them."

---

## Step 4 — Aggregate the verdict

Build a unified report combining all five perspectives + local QA + CodeRabbit:

```
# Pre-Production Review — <TARGET>

## Verdict: <SAFE | CONDITIONAL | UNSAFE>

| Lens                   | Blockers | Major | Minor | Status |
|------------------------|----------|-------|-------|--------|
| Local QA pipeline      |    -     |   -   |   -   | <PASS/FAIL> |
| QA (functional)        |   <N>    |  <N>  |  <N>  | <PASS/FAIL> |
| Security               |   <N>    |  <N>  |  <N>  | <PASS/FAIL> |
| Compliance (GAAP/audit)|   <N>    |  <N>  |  <N>  | <PASS/FAIL> |
| Finance (CFO/CFA)      |   <N>    |  <N>  |  <N>  | <PASS/FAIL> |
| Adversarial            |   <N>    |  <N>  |  <N>  | <PASS/FAIL> |
| CodeRabbit comments    |   <N>    |   -   |   -   | <CLEAN/OPEN> |

## Blockers (must fix before push)
- [Lens] file:line — finding
- ...

## Major (should fix; conditional push)
- ...

## Recommended actions
1. <numbered next steps>
```

Save the full report to `/tmp/pre-prod-$(date +%s).md`. Print the table to stdout.

---

## Step 5 — Final gate decision

```
SAFE        → all perspectives PASS, zero Blockers, zero failed local-QA steps
CONDITIONAL → no Blockers, but one or more perspective has Major findings
UNSAFE      → any Blocker, any failed local-QA step, any FAIL from a perspective subagent
```

Print exactly one line at the end:
- `✅ SAFE — push approved by all five perspectives + local QA.`
- `⚠️  CONDITIONAL — no blockers, but review Major findings before pushing. (See report.)`
- `❌ UNSAFE — DO NOT push. Fix blockers first. (See report for details.)`

If UNSAFE, list the highest-priority Blocker inline so the developer knows exactly what to fix first.

---

## When to use this command

- Before opening a PR for review → catches issues before the team's eyes are on it.
- Before merging a green PR → final sign-off.
- Before a manual `wrangler deploy` (emergency) → don't ship without the gate.
- After resolving CodeRabbit feedback (`/cr-review`) → confirm the fixes didn't introduce new issues.

For day-to-day work, the git pre-push hook (`npm run preflight`) is enough. Use `/pre-prod-review` for material changes that touch financial logic, auth, or production data flows.
