---
description: Show all open PRs in the current repo with CI status and unresolved CodeRabbit threads. Run this to see what needs review, then use /cr-review <number> to start working.
allowed-tools: Bash
---

Fetch and display every open PR in the current repo as a clean table.

## Step 1 — Detect the repo

```bash
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
echo "Repo: $REPO"
```

If `gh` returns nothing, stop — this isn't a GitHub repo, or `gh` isn't authed.

## Step 2 — Fetch open PRs

```bash
gh pr list \
  --repo "$REPO" \
  --state open \
  --limit 50 \
  --json number,title,headRefName,author,updatedAt,isDraft,reviewDecision,statusCheckRollup
```

## Step 3 — Count unresolved CodeRabbit threads per PR

For each PR number:
```bash
gh api "repos/$REPO/pulls/<number>/comments?per_page=100" --paginate \
  | python3 -c "
import json, re, sys
comments = json.load(sys.stdin)
roots = [c for c in comments if c.get('user', {}).get('login') == 'coderabbitai[bot]' and not c.get('in_reply_to_id')]
replies = {}
for c in comments:
    p = c.get('in_reply_to_id')
    if p:
        replies.setdefault(p, []).append(c)
resolved_re = re.compile(r'(Addressed in|done\s+[0-9a-f]{7,40}|✅|Resolved|wontfix:|deferred\s+—)', re.I)
open_n = sum(1 for r in roots if not any(resolved_re.search(rep.get('body') or '') for rep in replies.get(r['id'], [])))
print(f'{open_n} open / {len(roots)} total')
"
```

## Step 4 — Print the table

| PR # | Title (≤50 chars) | Branch | Author | Updated | CI | Review | CodeRabbit |
|------|-------------------|--------|--------|---------|----|--------|------------|

Column values:
- **CI**: `✅ green` / `❌ failing` / `⏳ pending` / `—`
- **Review**: `✅ approved` / `🔄 changes needed` / `⏳ pending` / `—`
- **CodeRabbit**: `N open / M total` — highlight rows where N > 0

## Step 5 — End with

```text
To work on a PR:      /cr-review <number>
To push & review:     /ship-cr
```
