---
description: axtreo-app — process CodeRabbit feedback AND auto-run all 5 perspective reviews in parallel. The single command for "review everything before this ships."
argument-hint: <PR_NUMBER>
allowed-tools: Bash, Read, Edit, Write, Grep, TodoWrite, Task
---

## axtreo-app override of `/cr-review`

Phases: 0 smart-triage → 1 global CR fix loop → 1.5 perspective planning → 2 parallel subagents → 3 local QA → 4 verdict.

---

## Phase 0 — Smart Triage (fast gate before any git work)

### 0.1 — Detect repo and resolve PR number

```bash
REPO=$(gh repo view --json nameWithOwner --jq '.nameWithOwner')
PR="$ARGUMENTS"
if [ -z "$PR" ]; then
  gh pr list --repo $REPO --state open --limit 30 \
    --json number,title,headRefName,isDraft,updatedAt,reviewDecision,statusCheckRollup,author
  # Print table and ask user which PR to work on, then continue with chosen number.
fi
case "$PR" in
  ''|*[!0-9]*) echo "Invalid PR number: $PR" >&2; exit 1 ;;
esac
```

### 0.2 — Fetch PR snapshot (one API call, no git required)

```bash
PR_SNAP=$(gh pr view $PR --repo $REPO \
  --json isDraft,mergeable,mergeStateStatus,statusCheckRollup,author,baseRefName,headRefName,title)
IS_DRAFT=$(echo "$PR_SNAP" | jq -r '.isDraft')
MERGE_STATE=$(echo "$PR_SNAP" | jq -r '.mergeStateStatus')
BASE=$(echo "$PR_SNAP" | jq -r '.baseRefName')
BRANCH=$(echo "$PR_SNAP" | jq -r '.headRefName')
PR_AUTHOR=$(echo "$PR_SNAP" | jq -r '.author.login')
PR_TITLE=$(echo "$PR_SNAP" | jq -r '.title // ""')
FAILING_CHECKS=$(echo "$PR_SNAP" | jq '[
  .statusCheckRollup // [] |
  .[] |
  select(
    .conclusion == "FAILURE" or .conclusion == "ACTION_REQUIRED" or
    .state == "ERROR" or .state == "FAILURE"
  )
] | length')
PENDING_CHECKS=$(echo "$PR_SNAP" | jq '[
  .statusCheckRollup // [] |
  .[] |
  select(.state == "PENDING" or .state == "QUEUED" or .state == "IN_PROGRESS")
] | length')
```

### 0.3 — Count unaddressed CodeRabbit threads + build compressed stub cache (one API call)

```bash
CACHE_DIR=/tmp/cr_review/$(echo "$REPO" | tr '/' '_')/$PR
mkdir -p "$CACHE_DIR"
UNADDRESSED=$(gh api "repos/$REPO/pulls/$PR/comments?per_page=100" --paginate \
  | python3 -c "
import json, sys, re, hashlib, os

comments = json.load(sys.stdin)
PR = os.environ.get('PR', '$PR')

def compress(body):
    # Drop analysis-chain blocks — everything inside <details>…</details>
    body = re.sub(r'<details>.*?</details>', '', body, flags=re.DOTALL)
    body = re.sub(r'<[^>]+>', '', body)   # remaining HTML tags
    body = re.sub(r'\n{3,}', '\n\n', body)
    return body.strip()[:300]             # hard cap: 300 chars per stub

def severity(body):
    if any(x in body for x in ['🟠 Major', '🔴', '_🟠_']):  return 'MAJOR'
    if any(x in body for x in ['🟡 Minor', '_🟡_']):         return 'MINOR'
    if any(x in body for x in ['🔵 Trivial', '🟣', '_🔵_']): return 'TRIVIAL'
    return 'MINOR'

threads = {}
for c in comments:
    tid = c.get('in_reply_to_id') or c['id']
    threads.setdefault(tid, []).append(c)

stubs = []
count = 0
for tid, msgs in threads.items():
    root = msgs[0]
    if root.get('user', {}).get('login', '') != 'coderabbitai[bot]':
        continue
    if any('Addressed in' in (m.get('body') or '')
           or '✅' in (m.get('body') or '')
           or 'Reviewed —' in (m.get('body') or '')
           or re.search(r'\bdone\s+[0-9a-f]{7,40}\b', (m.get('body') or ''))
           or (m.get('body') or '').lstrip().startswith('wontfix:')
           or 'deferred —' in (m.get('body') or '')
           for m in msgs):
        continue
    count += 1
    body = root.get('body', '')
    sev = severity(body)
    stub = compress(body)
    cid = root['id']
    path = root.get('path', '?')
    line = root.get('line') or root.get('original_line') or '?'
    body_sha = hashlib.sha256(body.encode()).hexdigest()[:8]
    with open(f'$CACHE_DIR/{cid}.txt', 'w') as f:
        f.write(f'ID={cid} | {path}:{line} | {sev} | sha={body_sha}\n{stub}\n')
    stubs.append({'id': cid, 'path': path, 'line': line, 'severity': sev, 'sha': body_sha})

with open(f'$CACHE_DIR/stubs.json', 'w') as f:
    json.dump(stubs, f, separators=(',', ':'))

print(count)
" 2>/dev/null || echo 0)
```

### 0.4 — Triage decision

```bash
echo "Triage PR #$PR: draft=$IS_DRAFT mergeState=$MERGE_STATE failingChecks=$FAILING_CHECKS pendingChecks=$PENDING_CHECKS unaddressedCR=$UNADDRESSED author=$PR_AUTHOR"
```

**Exit early (no work needed) if ALL of the following are true:**
- `IS_DRAFT` is `"false"`
- `FAILING_CHECKS` is `0` (no failed checks)
- `PENDING_CHECKS` is `0` (all checks completed — not still running)
- `UNADDRESSED` is `0`
- `MERGE_STATE` is `CLEAN` or `HAS_HOOKS` (not DIRTY/UNKNOWN/BLOCKED/UNSTABLE)

```bash
if [ "$IS_DRAFT" = "false" ] && \
   [ "$FAILING_CHECKS" -eq 0 ] && \
   [ "$PENDING_CHECKS" -eq 0 ] && \
   [ "$UNADDRESSED" -eq 0 ] && \
   ( [ "$MERGE_STATE" = "CLEAN" ] || [ "$MERGE_STATE" = "HAS_HOOKS" ] ); then

  if echo "$PR_AUTHOR" | grep -qE '^(dependabot|renovate)(\[bot\])?$'; then
    MSG="<!-- cr-review-triage -->Bot PR (${PR_AUTHOR}) — CI green, no conflicts. Safe to merge when ready."
  else
    MSG="<!-- cr-review-triage -->CodeRabbit clean, CI green — ready for human review. (Claude has no action to take.)"
  fi

  gh pr comment $PR --repo $REPO --body "$MSG"
  echo "✅ Triage: nothing for Claude to do on PR #$PR. Exiting."
  exit 0
fi
```

**Proceed** (print why before continuing to Phase 1):
```bash
REASONS=()
[ "$IS_DRAFT" = "true" ]         && REASONS+=("PR is still a draft — will still run reviews")
[ "$FAILING_CHECKS" -gt 0 ]     && REASONS+=("$FAILING_CHECKS failing CI check(s)")
[ "$PENDING_CHECKS" -gt 0 ]     && REASONS+=("$PENDING_CHECKS check(s) still running")
[ "$UNADDRESSED" -gt 0 ]        && REASONS+=("$UNADDRESSED unaddressed CodeRabbit thread(s)")
[[ ! "$MERGE_STATE" =~ ^(CLEAN|HAS_HOOKS)$ ]] && REASONS+=("merge state: $MERGE_STATE")
echo "🔧 Triage: work needed — $(IFS=', '; echo "${REASONS[*]}")"
```

---

## Phase 1 — Run the global /cr-review flow (steps 0–9)

Read and execute the complete workflow at `~/.claude/commands/cr-review.md` for the PR number provided in `$ARGUMENTS`. That file's steps 0 through 9 cover:
- Step 0: Detect repo + pick PR (if not in arg)
- Step 1, 1.5: Checkout branch, sync with base
- Steps 2–3: Inventory CodeRabbit comments + CI failures
- Step 4: Fix everything (Major → Minor → Trivial)
- Step 5: Smart safety gate (tsc, vite build, lint, diff, debug, scope)
- Steps 6–7: Commit, push, reply to threads
- Step 7.5: Wait for CodeRabbit re-review on the fix commit (commit-id-locked, no premature exit)
- Steps 8–9: Top-level summary, final CI check

**Local overrides for the global flow (apply these, ignore global defaults):**

| Global setting | This project override | Reason |
|---|---|---|
| `MAX_WAIT_MINS=30` (Step 7.5) | `MAX_WAIT_MINS=10` | CodeRabbit either responds in ≤10 min or is rate-limited; 30-min wait wastes tokens on dead ticks |
| `POLL_INTERVAL=30` (Step 7.5) | `POLL_INTERVAL=60` | 60s is the minimum meaningful gap; 30s doubles API call count for no benefit |
| `TICKS = 30*60/30 = 60` | `TICKS = 10*60/60 = 10` | **10 ticks max per round** instead of 60 — 6x fewer polling API calls |
| `LOOP_COUNT > 3` cap | keep as-is | 3 fix cycles is the right cap |
| **Step 2 — comment inventory** | **Use stub cache from Phase 0.3** | Phase 0.3 already fetched + compressed all comment bodies. Reading stubs is ~30 tokens/comment vs ~300 for raw body |
| **Step 4 — read comment body** | **Fetch single comment on demand** | `gh api repos/$REPO/pulls/comments/<id>` for the ONE comment being fixed right now. Never bulk-load all bodies at once |
| **Step 7 — thread reply format** | **`done $REPLY_SHA — <file>: <what changed>`** | Canonical reply token per `axtreo-pr-discipline` SKILL. CodeRabbit resolver matches `done <SHA>` prefix, not `Addressed in <SHA>` |

**Step 2 override — use the Phase 0.3 cache:**
```bash
# DO NOT re-fetch comment bodies. Read the compressed stubs built in Phase 0.3.
STUBS=$(cat "$CACHE_DIR/stubs.json" 2>/dev/null || echo '[]')
echo "Worklist from cache: $(echo "$STUBS" | python3 -c "import json,sys; s=json.load(sys.stdin); [print(f'  {x[\"severity\"]} | {x[\"path\"]}:{x[\"line\"]} | id={x[\"id\"]}') for x in s]")"
# Stubs are in $CACHE_DIR/<id>.txt — one per comment, pre-compressed.
# Print: Found N unaddressed CodeRabbit comments (from Phase 0.3 count = $UNADDRESSED).
```

**Step 4 override — fetch full body only when fixing:**
```bash
# When Step 4 is about to fix comment <id>, fetch its full body now (not before):
FULL_BODY=$(gh api "repos/$REPO/pulls/comments/<id>" --jq '.body')
CACHED_SHA=$(grep 'sha=' "$CACHE_DIR/<id>.txt" | grep -oE 'sha=[a-f0-9]+' | cut -d= -f2)
LIVE_SHA=$(echo "$FULL_BODY" | python3 -c "import sys,hashlib; print(hashlib.sha256(sys.stdin.read().encode()).hexdigest()[:8])")
# CACHED_SHA == LIVE_SHA: stub sufficient. Different: comment updated, use FULL_BODY.
```

**Step 7 override — canonical thread reply format:**
```bash
# Every inline reply MUST start with "done $REPLY_SHA — " (not "Addressed in").
# CodeRabbit's resolver matches the "done <SHA>" prefix to auto-close threads.
gh api --method POST \
  repos/$REPO/pulls/$PR/comments/<id>/replies \
  -f "body=done $REPLY_SHA — <file>: <what changed>."
```

**Step 3 override — CI failure investigation (NEVER skip without proof):**

A failing CI check is NEVER dismissed as "pre-existing" or "not related to this PR" without running all three of the following checks:

```bash
# 1. Fetch the actual failure log
gh run list --repo $REPO --branch $BRANCH --limit 5 \
  --json databaseId,name,status,conclusion
gh run view <failed-run-id> --log-failed --repo $REPO 2>&1 | tail -40

# 2. Check if the SAME check also fails on the base branch right now
gh run list --repo $REPO --branch $BASE --limit 5 \
  --json databaseId,name,status,conclusion,headBranch \
  | jq '.[] | select(.name == "<failing-check-name>")'

# 3. Verify the error message is identical (not just the check name)
# Compare the tail of the base branch failure log vs the PR failure log.
```

**Decision rules:**
- Logs show error AND same check fails on `$BASE` with the same error → **pre-existing, skip with note**
- Logs show error AND check passes on `$BASE` → **this PR broke it, must fix before proceeding**
- Can't fetch logs (permissions/timeout) → **report the check name and raw status, do not assume pre-existing**
- Cloudflare Pages preview failures → check if `vite build` succeeds locally (`npx vite build`); if local build passes, the Pages failure is an infrastructure issue, not a code issue — note it but do not block

**Step 7.5 override — wait for CodeRabbit to COMPLETE before posting Phase 4 verdict:**

After pushing fixes and triggering re-review, do NOT post the Phase 4 verdict while CodeRabbit's review shows as `⏳` / "in progress". Check completion status:

```bash
FIX_SHA=$(git rev-parse HEAD)

# Poll every 2 minutes, up to 3 checks (6 min total)
for i in 1 2 3; do
  CR_DONE=$(gh api "repos/$REPO/pulls/$PR/reviews?per_page=50" \
    --jq "[.[] | select(.user.login==\"coderabbitai[bot]\" and .commit_id==\"$FIX_SHA\")] | length" 2>/dev/null || echo 0)
  case "$CR_DONE" in
    ''|*[!0-9]*) CR_DONE=0 ;;
  esac
  if [ "$CR_DONE" -gt 0 ]; then
    echo "✅ CodeRabbit re-review complete on $FIX_SHA after check $i"
    break
  fi
  echo "⏳ Check $i/3 — CodeRabbit not yet done on $FIX_SHA, waiting 2 min..."
  sleep 120
done

if [ "$CR_DONE" -eq 0 ]; then
  echo "⚠️ CodeRabbit did not complete re-review within 6 min — posting verdict anyway, flagging as pending"
  CR_STATUS="⏳ re-review still pending"
else
  CR_STATUS="✅ re-review confirmed on $FIX_SHA"
fi
```

Include `$CR_STATUS` in the Phase 4 verdict CI line. Never report the final summary with CodeRabbit showing `⏳` without this polling having run.

If Step 7.5 hits the LOOP_COUNT > 3 cap or times out, **proceed to Phase 1.5 anyway** — perspective reviews are still valuable signal.

---

## Phase 1.5 — Perspective Planning (decide which lenses and which model)

### 1.5.a — Get the list of changed files

```bash
CHANGED_FILES=$(gh pr diff $PR --repo $REPO --name-only 2>/dev/null || \
  git diff --name-only "origin/$BASE"...HEAD)
echo "Changed files ($( echo "$CHANGED_FILES" | wc -l | tr -d ' ') total):"
echo "$CHANGED_FILES"
```

### 1.5.b — Layer 1: path-based lens + model selection

```bash
PLAN=$(echo "$CHANGED_FILES" | python3 -c "
import sys, json

files = [f.strip() for f in sys.stdin.read().splitlines() if f.strip()]
paths = ' '.join(files).lower()

# QA always active — any change can introduce regressions
perspectives = {'qa': True}

# gaps: active when PR touches real source files (not pure test/config/lock changes)
TRIVIAL_ONLY = bool(files) and all(
    f.endswith('.json') or f.endswith('.lock') or f.endswith('.yml') or
    f.endswith('.yaml') or f.endswith('.toml') or
    '.test.' in f or '__tests__' in f or '.spec.' in f
    for f in files
)
GAP_PATHS = [
    'src/backend/', 'src/pages/', 'src/components/', 'schema.prisma',
    'migrations/', 'worker.ts', 'server.ts', 'wrangler',
]
if not TRIVIAL_ONLY and any(p in paths for p in GAP_PATHS):
    perspectives['gaps'] = True

# feature_research: high bar — only for PRs that introduce new user-facing capability
# Requires: branch or title signals "feat" + at least 1 real source file + not trivial
PR_BRANCH = '$BRANCH'
PR_TITLE_VAR = '$PR_TITLE'.lower()
FEAT_BRANCH = PR_BRANCH.startswith('feat/') or 'feature' in PR_BRANCH
FEAT_TITLE = PR_TITLE_VAR.startswith('feat') or any(kw in PR_TITLE_VAR for kw in [
    'add ', 'new ', 'introduce', 'implement', 'build ', 'support ',
])
FEAT_PATHS = [
    'src/pages/', 'src/backend/routes/', 'src/backend/services/',
    'src/components/', 'integrations/', 'assistant', 'aura', 'arc',
]
feat_path_hit = sum(1 for f in files if any(p in f for p in FEAT_PATHS))
if (FEAT_BRANCH or FEAT_TITLE) and feat_path_hit >= 1 and len(files) >= 2 and not TRIVIAL_ONLY:
    perspectives['feature_research'] = True

# Security signals → activate security + adversarial (they pair)
SEC_PATTERNS = [
    'auth/', 'session', 'passkey', 'rbac/', 'worker.ts', 'middleware',
    'jwt', 'hmac', 'encrypt', 'token', 'otp', 'totp', 'permission',
    'webauthn', 'credential', 'secret', 'cors', 'csp', 'xss', 'sanitize',
    'cookie', 'bearer', 'identity', 'signin', 'signup', 'login',
    'entity-access', 'access-request', 'grant', 'revoke',
]
if any(p in paths for p in SEC_PATTERNS):
    perspectives['security'] = True
    perspectives['adversarial'] = True  # adversarial always pairs with security

# Adversarial-only signals (attack surface even without pure auth changes)
ADV_PATTERNS = [
    'rate-limit', 'rate_limit', 'ratelimit', 'webhook', 'ingest',
    'oauth', 'pow', 'turnstile', 'bypass', 'challenge',
]
if any(p in paths for p in ADV_PATTERNS):
    perspectives['adversarial'] = True

# Compliance signals → audit trail, DB schema, soft-delete, tenant scoping
# entity-access/rbac/session/auth are included here so entity-access PRs
# always trigger compliance (PATTERNS.md line 18 — never skip for these paths)
COMP_PATTERNS = [
    'schema.prisma', 'migrations/', 'audit', 'deletedat', 'accountid',
    'gljournalentry', 'auditevent', 'closepack', 'fiscal_month',
    'soft-delete', 'softdelete', 'gdpr', 'compliance', 'tenant',
    'account_id', 'entity_id', 'append-only',
    'entity-access', 'access-request', 'rbac/', 'session', 'auth/',
]
if any(p in paths for p in COMP_PATTERNS):
    perspectives['compliance'] = True

# Finance signals → money, billing, revenue recognition
FIN_PATTERNS = [
    'mrr', 'arr', 'revenue', 'reconcil', 'fiscal', 'journal', 'ledger',
    'billing', 'stripe', 'chargebee', 'subscription', 'amount', 'cents',
    'bridge', 'recognition', 'pricing', 'invoice', 'payment', 'refund',
    'cashledger', 'revenuebridge', 'mrrsnap', 'contractfact', 'asc606',
]
if any(p in paths for p in FIN_PATTERNS):
    perspectives['finance'] = True

# Performance signals → frontend bundle, animations, CSS, Vite config
PERF_PATTERNS = [
    'src/components', 'src/pages', '.css', 'tailwind', 'motion', 'gsap',
    'animation', 'vite.config', 'bundle', 'lazy', 'src/app', 'src/ui',
    'icons', 'assets', 'public/', '.svg', 'chunk', 'perf-budget',
]
if any(p in paths for p in PERF_PATTERNS):
    perspectives['performance'] = True

# Model tier selection
# opus  → auth/payments/schema migrations (highest stakes — money + security)
OPUS_SIGNALS = [
    'auth/', 'passkey', 'rbac/', 'session', 'webauthn', 'schema.prisma',
    'migrations/', 'stripe', 'chargebee', 'billing', 'payment', 'invoice',
    'worker.ts', 'hmac', 'encrypt', 'jwt', 'entity-access', 'access-request',
]
# sonnet → backend logic, finance reads, compliance, API routes
SONNET_SIGNALS = [
    'src/backend/', 'api/', 'server', 'mrr', 'arr', 'reconcil',
    'journal', 'ledger', 'revenue', 'fiscal', 'prisma', 'routes',
    'services/', 'middleware',
]
# haiku  → ONLY when the entire diff is CSS / docs / static assets
HAIKU_ONLY = bool(files) and all(
    f.endswith('.css') or f.endswith('.md') or '/assets/' in f or
    '/public/' in f or f.endswith('.svg') or f.endswith('.png') or
    f.endswith('.jpg') or f.endswith('.ico')
    for f in files
)
if HAIKU_ONLY:
    perspectives.pop('gaps', None)           # no code gaps in pure CSS/docs/asset diffs
    perspectives.pop('feature_research', None)  # no competitive research for pure assets

if any(p in paths for p in OPUS_SIGNALS):
    model = 'opus'
elif HAIKU_ONLY:
    model = 'haiku'
elif any(p in paths for p in SONNET_SIGNALS):
    model = 'sonnet'
else:
    model = 'sonnet'  # safe default for mixed/unknown changes

active = sorted(perspectives.keys())
all_lenses = ['qa', 'gaps', 'security', 'adversarial', 'compliance', 'finance', 'performance', 'feature_research']
skipped = [p for p in all_lenses if p not in perspectives]

print(json.dumps({
    'perspectives': active,
    'model': model,
    'file_count': len(files),
    'skipped': skipped,
}))
")

ACTIVE_PERSPECTIVES=$(echo "$PLAN" | python3 -c "import json,sys; d=json.load(sys.stdin); print(' '.join(d['perspectives']))")
RECOMMENDED_MODEL=$(echo "$PLAN" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['model'])")
FILE_COUNT=$(echo "$PLAN" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d['file_count'])")
SKIPPED_PERSPECTIVES=$(echo "$PLAN" | python3 -c "import json,sys; d=json.load(sys.stdin); print(', '.join(d['skipped']) or 'none')")
```

### 1.5.c — Layer 2: diff content scan (catches semantic signals path-matching misses)

```bash
DIFF_SAMPLE=$(gh pr diff $PR --repo $REPO 2>/dev/null | head -300 | tr '[:upper:]' '[:lower:]')

# Finance: money values, subscription IDs, MRR logic embedded in non-finance files
if echo "$DIFF_SAMPLE" | grep -qE '\b(amount|_cents|cents_|price_id|subscription_id|mrr|arr|fiscal_month|refund)\b'; then
  echo "   [L2+finance] money/subscription signal in diff content"
  ACTIVE_PERSPECTIVES="$ACTIVE_PERSPECTIVES finance"
fi

# Compliance: tenant scoping, soft-delete, audit append-only in code
if echo "$DIFF_SAMPLE" | grep -qE '\b(account_id|accountid|entity_id|deletedat|\.deletedat|append.only|auditevent)\b'; then
  echo "   [L2+compliance] tenant/audit signal in diff content"
  ACTIVE_PERSPECTIVES="$ACTIVE_PERSPECTIVES compliance"
fi

# Security: isInternal guard changed, secrets, raw SQL
if echo "$DIFF_SAMPLE" | grep -qiE '(^-.*isinternal|!isinternal|isinternal\s*===\s*false|raw\s*sql|exec\s*\(|eval\s*\()'; then
  echo "   [L2+security] guard change / raw exec in diff — escalating security+adversarial"
  ACTIVE_PERSPECTIVES="$ACTIVE_PERSPECTIVES security adversarial"
  RECOMMENDED_MODEL="opus"  # escalate model too — guard removal is critical
fi

# Model escalation: $transaction / TOCTOU patterns → needs deep review
if echo "$DIFF_SAMPLE" | grep -qE '\$transaction|\btoctou\b|serializable|optimistic.lock|for.update'; then
  echo "   [L2+opus] transaction/concurrency pattern → model escalated to opus"
  RECOMMENDED_MODEL="opus"
fi

# De-duplicate perspective list (preserves order, removes dupes)
ACTIVE_PERSPECTIVES=$(echo "$ACTIVE_PERSPECTIVES" | tr ' ' '\n' | awk '!seen[$0]++' | tr '\n' ' ' | sed 's/[[:space:]]*$//')
# Feature research: L2 escalation — activate if diff shows multiple new route handlers
FEAT_ROUTE_COUNT=$(echo "$DIFF_SAMPLE" | grep -cE '^\+(router\.|app\.)(get|post|put|patch|delete)\s*\(' 2>/dev/null || echo 0)
if [ "${FEAT_ROUTE_COUNT:-0}" -ge 2 ]; then
  echo "   [L2+feature_research] $FEAT_ROUTE_COUNT new route handlers in diff — activating feature research"
  ACTIVE_PERSPECTIVES="$ACTIVE_PERSPECTIVES feature_research"
fi

SKIPPED_PERSPECTIVES=$(python3 -c "
active=set('$ACTIVE_PERSPECTIVES'.split())
all_l=['qa','gaps','security','adversarial','compliance','finance','performance','feature_research']
print(', '.join(l for l in all_l if l not in active) or 'none')
")

# Capture human-readable skip reasons for the two high-signal lenses.
# These are printed in the verdict table and PR comment so skips are never silent.
GAPS_SKIP_REASON="not triggered"
FEAT_SKIP_REASON="not triggered"
if ! echo " $ACTIVE_PERSPECTIVES " | grep -q " gaps "; then
  # Check whether any substantive source-code lens fired — if none did, the diff is trivial/style-only
  if echo " $ACTIVE_PERSPECTIVES " | grep -qE " (security|compliance|finance|adversarial|performance) "; then
    GAPS_SKIP_REASON="no backend/frontend source paths matched gap heuristics (CSS/docs/config-only diff)"
  else
    GAPS_SKIP_REASON="trivial or style-only diff — gaps lens requires changed source files"
  fi
fi
if ! echo " $ACTIVE_PERSPECTIVES " | grep -q " feature_research "; then
  FEAT_SKIP_REASON="no new-feature signals — branch/title don't indicate new capability and diff has < 2 new route handlers"
fi

echo ""
echo "📊 Perspective plan (path + diff analysis):"
echo "   Active  : $ACTIVE_PERSPECTIVES"
echo "   Skipped : $SKIPPED_PERSPECTIVES"
echo "   Model   : $RECOMMENDED_MODEL"
echo "   Files   : $FILE_COUNT changed"
[ "$GAPS_SKIP_REASON" != "not triggered" ] && echo "   gaps skip reason      : $GAPS_SKIP_REASON"
[ "$FEAT_SKIP_REASON" != "not triggered" ] && echo "   feature_res skip reason: $FEAT_SKIP_REASON"
echo ""
```

### 1.5.d — SHA disambiguation table (set once, used everywhere — prevents model confusion)

```bash
# MERGE_BASE_SHA = branch point (read-only). FIX_SHA / REPLY_SHA set by global flow per round.
# NEVER use MERGE_BASE_SHA or PRE_PUSH_SHA in inline reply text.
MERGE_BASE_SHA=$(git merge-base HEAD "origin/$BASE" 2>/dev/null || echo "unknown")
echo "SHA table: MERGE_BASE=$MERGE_BASE_SHA (FIX_SHA and REPLY_SHA set by global flow per round)"
```

---

## Phase 2 — Spawn only the relevant perspective subagents in parallel (Step 10)

### 2.0 — Build the shared context block (one extraction, injected into all subagents)

```bash
# Pattern hints from outcome history (fast-load, skip re-discovery)
PATTERNS=""
[ -f ".claude/memory/cr-outcomes/PATTERNS.md" ] && PATTERNS=$(head -60 .claude/memory/cr-outcomes/PATTERNS.md)

# Changed function/class names from diff — gives subagents precise targets, not just file names
# head -400 lines ≈ 500 tokens; grep for declaration lines only
CHANGED_SYMBOLS=$(gh pr diff $PR --repo $REPO 2>/dev/null | head -400 \
  | grep '^+' \
  | grep -E '^\+\s*(export\s+)?(async\s+)?(function|const|class|def|interface|type)\s+[A-Za-z]' \
  | sed 's/^+//' | sed 's/[[:space:]]\{2,\}/ /g' | head -12 | tr '\n' ' | ')

# Shared context block — injected verbatim into every subagent prompt
SHARED_CTX="PR #$PR | branch=$BRANCH | base=$BASE | model=$RECOMMENDED_MODEL | files=$FILE_COUNT
Changed symbols: ${CHANGED_SYMBOLS:-'(none extracted)'}
Active lenses: $ACTIVE_PERSPECTIVES | Skipped: $SKIPPED_PERSPECTIVES
Known bug patterns (check FIRST before general scan):
$PATTERNS"

echo "Context block built ($(echo "$SHARED_CTX" | wc -w) words). Dispatching subagents."
```

### 2.1 — Dispatch active perspectives in ONE parallel batch

Spawn **only** perspectives in `$ACTIVE_PERSPECTIVES`. Never spawn unlisted ones.
Use `general-purpose` subagent_type. Model = `$RECOMMENDED_MODEL`. All Tasks in one message — parallel dispatch.

**Required output format (every subagent — no exceptions):**
```
LENS:<name> B:<blockers> M:<major> m:<minor> t:<trivial>
FINDING: <file:line — one sentence> [max 5 findings]
PATTERN: <new reusable pattern not in PATTERNS.md, or "none">
```
No prose. No headers. ~200 tokens max output per subagent.

```
# Spawn ONLY Tasks whose perspective name is in $ACTIVE_PERSPECTIVES.
# $SHARED_CTX is pre-built above — inject as-is, do not re-derive it inside the subagent.

if "qa" in ACTIVE_PERSPECTIVES:
  Task — QA (model: $RECOMMENDED_MODEL):
    prompt: |
      $SHARED_CTX
      Run .claude/commands/qa-review.md. Focus: broken flows, regressions, edge cases,
      missing null guards, error handling gaps. Prioritize changed symbols above.
      Return ONLY the compressed format: LENS:qa B:N M:N m:N t:N / FINDING / PATTERN

if "security" in ACTIVE_PERSPECTIVES:
  Task — Security (model: $RECOMMENDED_MODEL):
    prompt: |
      $SHARED_CTX
      Run .claude/commands/security-review.md. Focus: OWASP top 10, auth bypass,
      IDOR, secrets in code, isInternal guard correctness (must be === true not truthy).
      Prioritize changed symbols above — scan their callers too.
      Return ONLY: LENS:security B:N M:N m:N t:N / FINDING / PATTERN

if "compliance" in ACTIVE_PERSPECTIVES:
  Task — Compliance (model: $RECOMMENDED_MODEL):
    prompt: |
      $SHARED_CTX
      Run .claude/commands/compliance-review.md. Focus: deletedAt on new models,
      accountId from session (never req.body), audit append-only, fiscal_month from entity.
      Return ONLY: LENS:compliance B:N M:N m:N t:N / FINDING / PATTERN

if "finance" in ACTIVE_PERSPECTIVES:
  Task — Finance (model: $RECOMMENDED_MODEL):
    prompt: |
      $SHARED_CTX
      Run .claude/commands/finance-review.md. Focus: integer cent arithmetic (no floats),
      MRR/ARR delta correctness, ASC 606 recognition triggers, reconciliation invariants.
      Return ONLY: LENS:finance B:N M:N m:N t:N / FINDING / PATTERN

if "adversarial" in ACTIVE_PERSPECTIVES:
  Task — Adversarial (model: $RECOMMENDED_MODEL):
    prompt: |
      $SHARED_CTX
      Run .claude/commands/bypass-review.md. Focus: TOCTOU (re-fetch state INSIDE $transaction),
      race on approve/deny/revoke, rate-limit bypass, replay attacks, IDOR via param tampering.
      Return ONLY: LENS:adversarial B:N M:N m:N t:N / FINDING / PATTERN

if "performance" in ACTIVE_PERSPECTIVES:
  Task — Performance (model: $RECOMMENDED_MODEL):
    prompt: |
      $SHARED_CTX
      Run .claude/commands/perf-review.md. Focus: bundle delta vs perf-budget.json budgets,
      render-storms, unnecessary re-renders, Core Web Vitals impact, chunk size regressions.
      Return ONLY: LENS:performance B:N M:N m:N t:N / FINDING / PATTERN

if "gaps" in ACTIVE_PERSPECTIVES:
  Task — Gaps (model: $RECOMMENDED_MODEL):
    prompt: |
      $SHARED_CTX
      Run .claude/commands/gaps-review.md. Focus: missing implementations, absent guardrails,
      incomplete flows. 10 checks: TODOs/stubs, missing auditEvent.create, missing deletedAt,
      unscoped data (no accountId), missing zod.parse on write routes, missing requireAuth,
      missing try/catch on external calls, missing loading/error UI states, missing null guards,
      dead-end form flows. Also Axtreo-specific: fiscal_month from entity, accountId from session,
      rate limiting on Worker endpoints, Gemini lazy-init, OAuth HMAC state, encryptedCredentials.
      Return ONLY: LENS:gaps B:N M:N m:N t:N GAP:N / GAP: file:line — missing → Add: action [sev] / PATTERN

if "feature_research" in ACTIVE_PERSPECTIVES:
  Task — Feature Research (model: $RECOMMENDED_MODEL):
    prompt: |
      $SHARED_CTX
      Run .claude/commands/feature-review.md. Identify the product domain from the changed files,
      research 3-5 relevant competitors (choose the most relevant from: ChartMogul, Synder,
      Stripe Billing, Chargebee, Recurly, FloQast, Numeric, Mosaic, Baremetrics, QuickBooks,
      Xero, Leapfin, Maxio, Paddle — match to the domain this PR touches).
      Use WebSearch + WebFetch for live competitor research when available.
      Surface 3-8 advanced features Axtreo is missing in this domain.
      Return ONLY: LENS:feature B:N M:N m:N t:N i:N s:N FEAT:N / FEAT: name — Competitor: desc → Build: action [sev] / COMPETITOR: list / PATTERN
```

Skipped perspectives → record as `SKIP: <reason>` (not bare `N/A`) in Phase 4 table using `$GAPS_SKIP_REASON` / `$FEAT_SKIP_REASON`. The reason must be present so a reader knows exactly why the lens didn't fire, not just that it didn't.

---

## Phase 3 — Local QA foundation in parallel (Step 11)

In the same parallel batch as Phase 2 (seventh Task), also run:

```
Task 7 — Local QA pipeline:
  description: "Run npm run qa locally for PR #$PR"
  prompt: |
    Run `npm run qa` and capture exit code + tail of output. Then run
    `npm run qa:browser` if Playwright is installed; skip if not. Return:
    - QA exit: PASS/FAIL
    - Browser smoke exit: PASS/FAIL/SKIPPED
    - Top 3 issues if either failed
```

---

## Phase 4 — Aggregate verdict + save compressed outcome

```bash
REPLY_SHA=${SHA:-$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")}  # fallback to HEAD if global flow timed out
LOOP_COUNT=${LOOP_COUNT:-0}
FIXED_COUNT=${FIXED_COUNT:-0}
MAJOR_COUNT=${MAJOR_COUNT:-0}
MINOR_COUNT=${MINOR_COUNT:-0}
TRIVIAL_COUNT=${TRIVIAL_COUNT:-0}
THREAD_COUNT=${THREAD_COUNT:-0}
echo "REPLY_SHA=$REPLY_SHA (final fix commit — used in inline thread replies and outcome JSON)"
```

Subagents returned compressed blocks inline. No file reads needed — parse inline returns directly.

### 4.1 — Build terse verdict table from inline subagent returns

```
PR #$PR | $BRANCH → $BASE | model=$RECOMMENDED_MODEL | files=$FILE_COUNT | reply_sha=$REPLY_SHA
CR: cycles=$LOOP_COUNT fixed=$FIXED_COUNT ($MAJOR_COUNT M/$MINOR_COUNT m/$TRIVIAL_COUNT t) | threads=$THREAD_COUNT

| Lens        | B | M | m | t | GAP | Status    | Finding (top 1)              |
|-------------|---|---|---|---|-----|-----------|------------------------------|
| qa          | N | N | N | N | —   | ✅/❌     | file:line — desc             |
| gaps        | N | N | N | N | N   | ✅/❌/SKIP: <$GAPS_SKIP_REASON> | file:line — missing feature |
| security    | N | N | N | N | —   | ✅/❌/N/A                       | ...                          |
| compliance  | N | N | N | N | —   | ✅/❌/N/A                       | ...                          |
| finance     | N | N | N | N | —   | ✅/❌/N/A                       | ...                          |
| adversarial | N | N | N | N | —   | ✅/❌/N/A                       | ...                          |
| performance | N | N | N | N | —   | ✅/❌/N/A                       | ...                          |
| feature_res | N | N | N | N | N   | ✅/❌/SKIP: <$FEAT_SKIP_REASON> | top feature gap (i:N s:N)    |
| local-qa    | — | — | — | — | —   | ✅/❌                           | npm run qa exit              |

When `gaps` or `feature_res` is skipped, the Status cell MUST read `SKIP: <reason>` — not `N/A`, not blank. Use the exact value of `$GAPS_SKIP_REASON` / `$FEAT_SKIP_REASON`.

CI: <check-name> ✅/❌ (pre-existing on $BASE / fixed in $REPLY_SHA / infrastructure — not code) | CodeRabbit: $CR_STATUS
VERDICT: SAFE / CONDITIONAL / UNSAFE
BLOCKER: [lens] file:line — desc  (only if VERDICT != SAFE)
GAPS: N total — top: <file:line — what's missing>  (only if gaps lens found issues)
FEATS: N total (i:N s:N) — top: <feature-name @ competitor — action>  (only if feature_research ran)
```

**Verdict rules:**
- `SAFE` = zero blockers across all active lenses + local QA pass
- `CONDITIONAL` = no blockers but ≥1 Major finding; human judgment needed
- `UNSAFE` = any blocker in any lens; DO NOT MERGE

### 4.2 — Save compressed outcome JSON

```bash
# Before running python3 below, parse LENS: lines from subagent inline returns and export:
#   BLOCKER_COUNT=<sum of all B: values>   MAJOR_COUNT=<sum of M:>
#   MINOR_COUNT=<sum of m:>                TRIVIAL_COUNT=<sum of t:>
#   LOCAL_QA_STATUS=<PASS|FAIL>  (from npm run qa exit code — MUST be PASS for SAFE verdict)
#   VERDICT_CALC=<SAFE|CONDITIONAL|UNSAFE — SAFE only when BLOCKER_COUNT==0 AND LOCAL_QA_STATUS==PASS>
#   PATTERNS_JSON=<JSON array of non-"none" PATTERN: lines, e.g. '["p1","p2"]'>
#   GAPS_COUNT=<GAP: total from gaps lens — sum of all GAP lines returned>
#   GAPS_JSON=<JSON array of GAP: line strings, e.g. '["file:line — missing → Add: action [B]"]'>
#   FEAT_COUNT=<FEAT: total from feature_research lens>
#   FEAT_I_COUNT=<i: value from LENS:feature line — innovation opportunity count>
#   FEAT_S_COUNT=<s: value from LENS:feature line — stack currency count>
#   FEAT_JSON=<JSON array of FEAT: line strings, e.g. '["name — Competitor: desc → Build: action [B]"]'>
OUTCOME_FILE=".claude/memory/cr-outcomes/pr-$PR.json"
python3 -c "
import json, os

total_b  = int(os.environ.get('BLOCKER_COUNT',  '0'))
total_m  = int(os.environ.get('MAJOR_COUNT',    '0'))
total_sm = int(os.environ.get('MINOR_COUNT',    '0'))
total_t  = int(os.environ.get('TRIVIAL_COUNT',  '0'))
verdict  = os.environ.get('VERDICT_CALC', 'SAFE')
try:    new_patterns = json.loads(os.environ.get('PATTERNS_JSON', '[]'))
except: new_patterns = []
gaps_count = int(os.environ.get('GAPS_COUNT', '0'))
try:    gaps = json.loads(os.environ.get('GAPS_JSON', '[]'))
except: gaps = []
feat_count = int(os.environ.get('FEAT_COUNT', '0'))
feat_i = int(os.environ.get('FEAT_I_COUNT', '0'))
feat_s = int(os.environ.get('FEAT_S_COUNT', '0'))
try:    feats = json.loads(os.environ.get('FEAT_JSON', '[]'))
except: feats = []

d = {
  'pr': $PR,
  'sha': '$REPLY_SHA',
  'date': '$(date -u +%Y-%m-%d)',
  'branch': '$BRANCH',
  'model': '$RECOMMENDED_MODEL',
  'files': $FILE_COUNT,
  'active_lenses': '$ACTIVE_PERSPECTIVES'.split(),
  'skipped_lenses': [s for s in '$SKIPPED_PERSPECTIVES'.split(', ') if s and s != 'none'],
  'cr': {'cycles': $LOOP_COUNT, 'fixed': $FIXED_COUNT, 'threads': $THREAD_COUNT},
  'findings': {'blockers': total_b, 'major': total_m, 'minor': total_sm, 'trivial': total_t},
  'gaps': {'count': gaps_count, 'items': gaps, 'skip_reason': '' if gaps_count > 0 else os.environ.get('GAPS_SKIP_REASON', '')},
  'feature_research': {'count': feat_count, 'innovation': feat_i, 'stack': feat_s, 'items': feats, 'skip_reason': '' if feat_count > 0 else os.environ.get('FEAT_SKIP_REASON', '')},
  'verdict': verdict,
  'new_patterns': new_patterns,
}
print(json.dumps(d, separators=(',',':')))
" > "$OUTCOME_FILE"
echo "Outcome saved: $OUTCOME_FILE"

# Append net-new patterns to PATTERNS.md (only lines not already present)
# For each PATTERN: line returned by subagents that is NOT already in PATTERNS.md:
# grep -qF "pattern text" .claude/memory/cr-outcomes/PATTERNS.md || echo "- pattern text" >> .claude/memory/cr-outcomes/PATTERNS.md
```

### 4.3 — Post terse PR comment

```bash
gh pr comment $PR --repo $REPO --body "$(cat <<EOF
## /cr-review — PR #$PR @ \`$REPLY_SHA\`

\`\`\`
<verdict table from 4.1 — exact text, no paraphrase>
\`\`\`

$(if [ "$GAPS_COUNT" -gt 0 ] 2>/dev/null; then
echo "### Gaps ($GAPS_COUNT — what this PR is missing)"
echo ""
echo "These are **omissions**, not bugs. Each needs an action before merge (B) or as a follow-up (M/m/t)."
echo ""
# Print each GAP item from GAPS_JSON as a markdown list item
python3 -c "
import json, os
gaps = json.loads(os.environ.get('GAPS_JSON', '[]'))
for g in gaps:
    print(f'- {g}')
"
fi)

$(if [ "${FEAT_COUNT:-0}" -gt 0 ] 2>/dev/null; then
echo "### Feature Research ($FEAT_COUNT — what competitors do that Axtreo doesn't)"
echo ""
echo "Strategic gaps from competitive analysis. Not bugs — product opportunities."
echo ""
python3 -c "
import json, os
feats = json.loads(os.environ.get('FEAT_JSON', '[]'))
for f in feats:
    print(f'- {f}')
"
fi)

$(python3 -c "
import os
skipped = os.environ.get('SKIPPED_PERSPECTIVES', 'none')
gaps_reason = os.environ.get('GAPS_SKIP_REASON', '')
feat_reason = os.environ.get('FEAT_SKIP_REASON', '')
gaps_count = int(os.environ.get('GAPS_COUNT', '0'))
feat_count = int(os.environ.get('FEAT_COUNT', '0'))

lines = []
# Only surface skip disclosure for the two product-signal lenses
if 'gaps' in skipped and gaps_count == 0 and gaps_reason:
    lines.append(f'- **gaps lens**: not run — {gaps_reason}')
if 'feature_research' in skipped and feat_count == 0 and feat_reason:
    lines.append(f'- **feature_research lens**: not run — {feat_reason}')

if lines:
    print('### Lenses not run')
    print('')
    print('These lenses were skipped for this PR. If you believe they should have fired, re-run with a broader diff or manually invoke the lens.')
    print('')
    for l in lines:
        print(l)
")
EOF
)"
```

---

## Phase 5 — Final exit

Print exactly one line:

- `✅ SAFE — CodeRabbit clean, all five perspectives clean, local QA pass.` → ready for human review / merge.
- `⚠️  CONDITIONAL — no blockers, but Major findings exist. (See PR comment + /tmp reports.)`
- `❌ UNSAFE — blockers found. DO NOT MERGE. (See PR comment for top blocker.)`

If UNSAFE: list the highest-priority blocker inline so the developer knows exactly what to fix first. They can then either fix and re-run `/cr-review $PR`, or address the blocker and let the next CI cycle catch it.

---

> For CodeRabbit-only (no perspective reviews), use the global `~/.claude/commands/cr-review.md` directly.
