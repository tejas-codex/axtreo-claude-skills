---
allowed-tools: Bash, Read, Grep, WebSearch, WebFetch
description: Competitive gap analysis — researches what advanced features exist in the PR's product domain at competitors, then surfaces what Axtreo is missing
argument-hint: "[domain] e.g. billing, MRR, reconciliation, AI, close (optional — auto-detected from git diff if omitted)"
---

## Purpose

Find what **advanced features Axtreo should build** in the domain this change touches. Not bugs, not missing guardrails — strategic product gaps. Research real competitors, identify what they do, and surface the delta so the team knows what to build next.

## Output format (strict — no exceptions)

```
LENS:feature B:<n> M:<n> m:<n> t:<n> i:<n> s:<n> FEAT:<total>
FEAT: <feature-name> — <Competitor|"none">: <what they do / what's outdated> → Build: <one-sentence action>  [B|M|m|t|i|s]
COMPETITOR: <comma-separated list of competitors researched>
PATTERN: <new reusable research pattern not in PATTERNS.md, or "none">
```

- `B` = table stakes — all major competitors have it, customers expect it, churn risk if absent
- `M` = significant gap — most competitors have it, comes up in sales calls
- `m` = nice-to-have — some competitors have it, differentiator but not blocking
- `t` = future / early-stage — 1 competitor has it or it's niche/beta
- `i` = innovation — no competitor has it yet; Axtreo could own the category by shipping it first (genuine product leap, not gap-closing)
- `s` = stack currency — the domain relies on a deprecated API version, outdated SDK, superseded pattern, OR has not yet adopted a now-mature technology (e.g. RAG/vector search, streaming LLM responses, tool-use APIs, edge-native patterns) that meaningfully changes what the domain can do; competitor = "none" if purely internal tech debt

Max **8 FEAT lines**. Highest-severity first. No prose outside these lines. ~400 tokens max.

---

## Step 0 — Bootstrap context (runs automatically)

This command works standalone (after building a feature) OR as a subagent called by cr-review.

**If `$ARGUMENTS` contains a domain keyword** (e.g. `/feature-review billing` or `/feature-review MRR tracking`):
- Use that as the domain. Skip file scanning.

**Otherwise, auto-detect from git:**

```bash
# Detect changed files vs main
CHANGED_FILES=$(git diff main...HEAD --name-only 2>/dev/null || git diff origin/main...HEAD --name-only 2>/dev/null || echo "")

# If no diff vs main, use staged + unstaged changes
if [ -z "$CHANGED_FILES" ]; then
  CHANGED_FILES=$(git diff --name-only HEAD 2>/dev/null)
fi

echo "Changed files:"
echo "$CHANGED_FILES"
```

Then read a representative sample of those files to understand what was built.

**If called by cr-review** (i.e. `$SHARED_CTX` is already populated): skip the git step and use `$SHARED_CTX` as the primary context.
If `$CHANGED_FILES` is present, use it; otherwise infer from `Changed symbols:` and lens/domain hints inside `$SHARED_CTX`.

---

## Step 1 — Identify the product domain

From the changed file paths and file content, determine which domain this touches:

| Domain | What it means |
|--------|---------------|
| Revenue recognition | ASC 606 rules, deferred revenue, SSP, revenue waterfall |
| Reconciliation | Bank feed matching, exception workflows, auto-categorization |
| Subscription billing | MRR/ARR tracking, dunning, proration, churn cohorts |
| Close workflow | Period lock, sign-offs, audit pack generation, CFO reporting |
| Integration (Stripe/QBO) | OAuth flows, data sync, webhook processing, field mapping |
| Financial reporting | Cohort charts, segment breakdowns, investor dashboards |
| AI / assistant | NL queries, anomaly detection, smart categorization suggestions |
| Access control | RBAC, entity-level permissions, audit log viewer |

If `$ARGUMENTS` explicitly names a domain, use that instead of inferring.

---

## Step 2 — Pick 3–5 relevant competitors

Choose based on domain. Do NOT research all — only the 3–5 most relevant.

| Domain | Competitors to check first |
|--------|---------------------------|
| Revenue recognition / close | FloQast, Numeric, Leapfin, BlackLine, Coda (accounting layer) |
| Reconciliation | Synder, Ramp, Mercury, Coda Payments, Puzzle |
| MRR / subscription billing | ChartMogul, Baremetrics, Maxio, Chargebee, Recurly, Stripe Billing |
| Accounting integrations | QuickBooks, Xero, NetSuite, Sage Intacct |
| Financial reporting | Mosaic, Jirav, Pigment, Causal, Vareto |
| AI in finance | Basis, Trullion, Docyt, Kore.ai Finance |
| AR / revenue operations | Stripe Revenue Recognition, Avalara, Chargify |

---

## Step 3 — Research their features

Use **WebSearch** to find relevant pages:
- `"[Competitor] [domain] features 2024 2025"`
- `"[Competitor] changelog"`
- `"[Competitor] vs [Competitor2] comparison"`
- `"best [domain] features SaaS finance 2025"`

Use **WebFetch** to read their feature pages, changelog entries, or comparison articles.

Focus on: what does their UI advertise? What does their API expose? What do their docs describe that Axtreo doesn't have?

---

## Step 4 — Cross-reference with Axtreo

From the changed files and CLAUDE.md context, identify what Axtreo currently implements in this domain. Then find the delta: what do competitors offer that this feature doesn't address?

---

## Step 5 — Score and output

- **B**: Every major competitor has it, it's in their hero marketing copy, customers will ask for it in the first demo
- **M**: Most competitors have it (≥3 of your 5 researched), would surface in competitive sales situations
- **m**: Some competitors (1–2) have it, nice differentiator, not blocking
- **t**: Only in beta at 1 competitor, or niche segment feature
- **i**: No competitor has it — proactive opportunity. Ask: "Could AI, automation, or a novel UX pattern eliminate a pain point in this domain that everyone else still does manually?" Examples: AI-predicted close anomalies before they happen, zero-touch revenue waterfall from webhook data alone, smart dunning that adapts retry timing to payment method type.
- **s**: Stack currency issue in this domain. Two sub-checks:
  1. **Deprecated/outdated**: Is the code using a deprecated API version (Stripe API date, QuickBooks OAuth version)? Is there a newer SDK with materially better capabilities (e.g. Prisma v7 features not yet adopted, Hono middleware patterns superseded)? Is a dependency approaching EOL?
  2. **New tech not yet adopted**: Has a now-mature technology that changes the domain's capabilities NOT been adopted? Examples — AI/data domain: RAG pipeline missing where competitors surface documents in context; vector similarity search (pgvector) not used for customer deduplication; streaming LLM responses not implemented where latency matters; tool-use / function-calling not used where structured extraction would replace prompt parsing. Finance domain: webhook-native processing not used where polling is still in place; edge-runtime patterns not adopted for time-critical reconciliation paths. Mark the gap, what tech/version to adopt, and the concrete capability unlock it enables.

`i` and `s` items can appear even if competitors don't have them — they are Axtreo-internal signals, not gap-vs-competitor signals.

Output top 8 FEAT gaps by severity, then PATTERN line.

---

## Axtreo context (always apply)

- **Product**: Revenue Close OS for SaaS $0–$50M ARR
- **Core promise**: replaces ChartMogul + Synder + bookkeeper + AR tool ($690–$2,674/mo) with one reconciled, audit-ready platform
- **Not a general ledger**: it's a reconciliation + recognition + close layer on top of QuickBooks / Xero
- **Current integrations**: Stripe OAuth, QuickBooks OAuth
- **AI model**: credit-based ("printer and ink") — Arc AI + Gemini 2.0 Flash
- **Tiers**: FREE / SOLO ($29) / STARTER ($75) / GROWTH ($499) / SCALE ($799)
- **Stack**: React 19 + Cloudflare Worker + PostgreSQL + Prisma
- **Team**: 2 people. Research depth matters more than breadth.

## Axtreo-specific gap checks (always run these)

On top of competitor research, check these known Axtreo-specific gaps (from the domain):

- **Dunning workflows**: if domain touches billing — does Axtreo have automated retry + email sequences for failed payments?
- **Revenue waterfall**: if domain touches recognition — does Axtreo produce a period-over-period waterfall chart?
- **Audit trail export**: if domain touches audit — can users export the full audit log as CSV / PDF?
- **Multi-currency close**: if domain touches fiscal/close — does Axtreo handle FX translation for multi-entity closes?
- **Cohort churn**: if domain touches MRR — does Axtreo show logo churn vs revenue churn separately?
- **GL push**: if domain touches journal entries — can users push GL entries directly to QBO / Xero?
- **Anomaly alerts**: if domain touches AI/data — does Axtreo alert on unusual revenue spikes or drop-offs?
- **Investor metrics**: if domain touches reporting — does Axtreo generate an investor-ready metrics PDF?
