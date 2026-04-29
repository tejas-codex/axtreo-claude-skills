---
description: Push your current work, open a PR if one doesn't exist, wait for CodeRabbit to review, then fix every comment automatically. The full zero-to-merged loop.
argument-hint: [optional PR title — only needed if no PR exists yet for this branch]
allowed-tools: Bash, Read, Edit, Write, Grep, TodoWrite
---

## What this does

You've been working on something. Run `/ship-cr` and this agent will:

1. Commit your uncommitted changes (if any)
2. Push the branch
3. Open a PR if one doesn't exist yet
4. Wait up to 5 minutes for CodeRabbit to review
5. Fix every CodeRabbit comment + failing CI check automatically
6. Commit the fixes, push, reply inline to every thread
7. Wait for CodeRabbit's re-review on the fix commit — fix any new comments it raises
8. Repeat until CodeRabbit has zero open comments (max 3 fix cycles)
9. Post a summary and report the final status

**It will not ask you questions** except one: if you are on `main` (safety check), or if a fix would delete a feature or change a public API.

---

## Phase 0 — Detect the repo

```bash
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
echo "Working in: $REPO"
```

If `gh` returns nothing (not a GitHub repo), stop and tell the user.

---

## Phase A — Figure out the current state

```bash
git status --short
git branch --show-current
git log --oneline origin/$(git branch --show-current)..HEAD 2>/dev/null || git log --oneline -3
```

**Decision:**

| Situation | Action |
|---|---|
| On `main` branch | STOP. Tell the user: "You're on `main` — I won't push here. Please tell me a branch name and I'll create it." Wait. |
| Dirty working tree | Commit changes (see below), then push |
| Clean, ahead of origin | Just push |
| Clean, already up to date | Skip to Phase B |

**If committing:** stage only changed files explicitly, write a HEREDOC commit message inferred from the diff:
```bash
git add <file1> <file2> ...
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject derived from the diff>

<body: 2-3 bullets describing what changed>

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
EOF
)"
```

**Push:**
```bash
git push -u origin "$(git branch --show-current)"
PUSHED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
```

---

## Phase B — Find or open the PR

```bash
BRANCH=$(git branch --show-current)
gh pr list --repo $REPO --head "$BRANCH" \
  --state open --json number,url,title,headRefName
```

- **PR exists** → capture `PR=<number>`. The push already re-triggered CodeRabbit. Print: `Updating PR #$PR — <URL>`
- **No PR** → create one:
  ```bash
  gh pr create \
    --repo $REPO \
    --base main \
    --title "<use $ARGUMENTS if provided, else derive from the most recent commit subject>" \
    --body "$(cat <<'EOF'
  ## Summary
  <1-3 bullets from git log since main>

  ## Test plan
  - [ ] npx vite build passes
  - [ ] No new TypeScript errors
  - [ ] Checked in browser

  🤖 Generated with [Claude Code](https://claude.com/claude-code)
  EOF
  )"
  ```
  Capture `PR` from the output URL. Print: `Opened PR #$PR — <URL>`

---

## Phase C — Wait for CodeRabbit (max 5 minutes)

```bash
for i in $(seq 1 10); do
  HIT=$(gh api \
    "repos/$REPO/pulls/$PR/reviews?per_page=100" \
    --paginate \
    --jq "[.[] | select(.user.login==\"coderabbitai[bot]\" and .submitted_at >= \"$PUSHED_AT\")] | length")
  echo "Waiting for CodeRabbit... attempt $i/10 (${HIT} reviews found)"
  [ "$HIT" -gt 0 ] && break
  sleep 30
done
```

- If CodeRabbit posted → continue automatically
- If still no review after 5 min → tell user: `"CodeRabbit hasn't reviewed yet. Run /cr-review $PR once it does."` and exit

---

## Phase D → onwards: run the full /cr-review loop

From this point, follow **every step of `/cr-review`** starting at **Step 1.5** (Sync with base branch — conflict check), then Step 2 onwards — using the `$PR` number captured above.

> **Why start at Step 1.5, not Step 2:** The PR may have become non-mergeable since the branch was last pushed. Running conflict detection before any fix work ensures you're not applying patches on top of a dirty base that will need to be re-done after a merge.

The steps are:
- **Step 1.5**: Sync with base branch (check mergeability, resolve conflicts if any, push merge commit)
- Step 2: Inventory CodeRabbit comments
- Step 3: Inventory CI/CD
- Step 4: Fix everything (Major → Minor → Trivial)
- Step 5: Verify build
- Step 6: Commit and push
- Step 7: Reply to every CodeRabbit thread
- Step 8: Post top-level PR summary
- Step 9: Final CI check
- Final report

Do not pause between phases. Run all of them to completion.
