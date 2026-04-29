---
description: Performance perspective review on a PR or current branch. Bundle bloat, dead code, render-storms, Lighthouse-style targets. Reports findings; does NOT auto-fix.
argument-hint: [PR_NUMBER]
allowed-tools: Bash, Read, Grep, TodoWrite
---

## Purpose

Performance is a perspective like security or compliance — code that compiles and ships can still be too big, too slow, or render too many times per user action. This command reviews a diff (or current branch) through a performance engineer's lens.

What it catches that the other lenses don't:
- Bundle size regressions per route
- Dead-code shipped to users (eliminated dependencies still imported)
- React render storms (inline JSX, missing keys, no-deps useEffect)
- Component-size bombs (4000-line single-file pages)
- Page latency / Core Web Vitals regressions (with optional Lighthouse)

---

## Step 0 — Determine the change set

```bash
if [ -n "$ARGUMENTS" ]; then
  REPO=$(git remote get-url origin | sed -E 's|.*github\.com[:/]([^/]+)/([^/.]+).*|\1/\2|')
  PR=$ARGUMENTS
  gh pr checkout $PR --repo $REPO
  BASE=$(gh pr view $PR --repo $REPO --json baseRefName --jq '.baseRefName')
else
  BASE=main
fi
git fetch origin $BASE 2>/dev/null
DIFF_FILES=$(git diff --name-only origin/$BASE...HEAD)
```

---

## Step 1 — Build + run the perf gates

```bash
npx vite build 2>&1 | tail -20
node scripts/perf/check-perf-budget.cjs 2>&1
node scripts/perf/check-dead-code.cjs 2>&1
node scripts/perf/check-render-perf.cjs 2>&1 | head -40
```

Capture each script's findings.

If Lighthouse is installed, also run:
```bash
node scripts/perf/lighthouse.cjs 2>&1 | tail -20
```

---

## Step 2 — Map findings to the diff

For each finding, ask: did THIS PR cause it, or is it pre-existing?

```bash
# For a flagged file like src/pages/Login.tsx, check whether the PR touched it:
echo "$DIFF_FILES" | grep "Login.tsx" && echo "this PR touches it" || echo "pre-existing"
```

Classify:
- **NEW**: PR touched the file AND introduced the issue → owner of this PR fixes it.
- **REGRESSION**: PR didn't touch the file but its bundle / size grew → likely transitive; investigate which import chain changed.
- **PRE-EXISTING**: file is flagged but PR didn't touch it → not this PR's job, but track in a follow-up.

---

## Step 3 — Compute baselines

If the PR description includes a "## Baseline" block with chunk sizes from main, compare. Otherwise:

```bash
# Stash current branch, checkout BASE, build, capture sizes
git stash push -u -m "perf-review-snapshot"
git checkout origin/$BASE
npx vite build 2>&1 > /dev/null
ls -la dist/assets/*.js | awk '{print $5, $9}' | sort > /tmp/perf-base.txt
git checkout -
git stash pop
npx vite build 2>&1 > /dev/null
ls -la dist/assets/*.js | awk '{print $5, $9}' | sort > /tmp/perf-head.txt

diff /tmp/perf-base.txt /tmp/perf-head.txt | head -30
```

Note any chunk that grew by >10% or 50 KB.

---

## Step 4 — Output the perf review

```
## Performance Review — <PR or branch>

**Total bundle:** <kb> KB (vs base <kb> KB, <±%>)
**Largest chunk:** <name> = <kb> KB
**Dead-code shipped:** <kb> KB (<count> eliminated deps)
**Render-perf flags:** <major> major, <minor> minor

### NEW issues introduced by this PR (Blockers)
- [Type | file:line] one-sentence finding + suggested fix

### REGRESSIONS (chunk sizes grew, possibly transitive)
- chunk-name: <prev kb> → <new kb> (<reason if findable>)

### PRE-EXISTING issues touching changed files
- ...

### CFO-style summary
- "Are users downloading bytes they don't need?" → <YES + how many KB / NO>
- "Will this PR make the app slower?" → <YES + estimated impact / NO>
- "What's the single biggest perf win available right now?" → <one concrete action>
```

Save full report to `/tmp/perf-review-$(date +%s).md`.

---

## Step 5 — Final exit

```
Performance review complete:
  Files reviewed:        <N>
  Total bundle:          <kb> KB
  Dead-code waste:       <kb> KB
  Render-perf flags:     <major>+<minor>
  Lighthouse:            <N targets passed / SKIPPED>
```

If NEW Blockers → `❌ Do NOT push. Performance regression introduced.`
If REGRESSIONS only → `⚠️  Bundle grew. Review the diff and confirm intentional.`
If only PRE-EXISTING flags → `✅ This PR doesn't worsen performance — but track the existing flags as separate work.`
Otherwise → `✅ Performance review clean.`
