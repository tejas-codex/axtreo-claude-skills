---
allowed-tools: Bash, Read, Grep, WebSearch, WebFetch, TodoWrite, mcp__e08f194c-bdd8-4061-828c-bab1e7a8adf2__getVisibleJiraProjects, mcp__e08f194c-bdd8-4061-828c-bab1e7a8adf2__searchJiraIssuesUsingJql, mcp__e08f194c-bdd8-4061-828c-bab1e7a8adf2__getConfluenceSpaces, mcp__e08f194c-bdd8-4061-828c-bab1e7a8adf2__searchConfluenceUsingCql, mcp__e08f194c-bdd8-4061-828c-bab1e7a8adf2__getConfluencePage
description: Pre-build feature intelligence — domain detection, perspective lens activation, 10x deep research, Class A/B/C/D classification, and Innovation Delta report. Standalone pre-build tool. NOT a PR review. Run before writing any code.
---

## Input Structuring — Prompt Framework (runs before Step 0, every invocation)

Apply the 5-part prompt framework to every raw feature description. Silent — never explain the
framework to the user. Produce a **FEATURE BRIEF** and pass it (not the raw input) into Step 0.

---

### Decision Gate

Read the user's input. Select ONE mode — never explain the choice:

| Signal | Mode |
|--------|------|
| Fresh `/feature-intel` with a new description | **STRUCTURE** — apply all 5 parts, produce FEATURE BRIEF |
| "yes" / "go ahead" / "proceed" / continuation of prior run | **EXECUTE** — skip restructure, resume coordinator directly |
| "as discussed" / "as built" / prior model/phase is established | **CONSTRAIN** — apply framework within the established feature context |
| Input < 8 words with no clear domain | **CLARIFY** — state your interpretation, ask ONE question, stop |

---

### Part 1 — Role + Goal

> You are a **Product Intelligence Analyst and System Architect** for Axtreo.
> Goal: Produce a structured, unambiguous FEATURE BRIEF that eliminates vague scope, names the
> pipeline stage, identifies the affected persona, and surfaces the correct domain signal — so the
> coordinator produces actionable intelligence rather than generic research.

---

### Part 2 — Context

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS 4 · Cloudflare Worker (Hono) · Prisma v7 · PostgreSQL 16 · Supabase

**Product:** Axtreo is the Revenue Close OS for SaaS $0–$50M ARR. It replaces ChartMogul + Synder + bookkeeper + AR tool. Core promise: reconciled, audit-ready books. Monetisation: credit-based AI ("ink") on top of free data sync ("printer"). Tiers: FREE / SOLO ($29) / STARTER ($75) / GROWTH ($499) / SCALE ($799).

**Pipeline stages:** ingest → normalise → identity → ledger → reconcile → recognise → metrics → intelligence → evidence

**Personas:** Sophie (FR controller, multi-entity), Priya (4-country CFO), Marcus (freelancer, Stripe-only), Linda (auditor, read-only)

---

### Part 3 — Framework (RODES applied to feature-intel as an architecture/design task)

| Dimension | Extract from the raw input |
|-----------|---------------------------|
| **Role** | Who is the user making the request? (Sophie / Priya / Marcus / Linda / internal ops / general ICP) |
| **Objective** | What outcome does the user want? (1 sentence — the "so that I can…" not the "build a…") |
| **Details** | Which pipeline stage(s)? Which models/routes are touched? Is there a money-touch? Compliance surface? |
| **Examples** | Any concrete data flows or UI interactions mentioned in the raw input? Extract them verbatim. |
| **Sense check** | Is the scope internally consistent? Any contradictions or unstated assumptions to flag? |

---

### Part 4 — Skill Router (auto-detect domain signal)

Match the RODES output to the domain signal. Wrap findings in `<skill>` XML so the coordinator
knows which lens library is most relevant:

```
<skill name="{domain-skill}">{domain context applied to this feature}</skill>
```

| Domain signal in raw input | Skill name |
|---------------------------|-----------|
| Revenue recognition / ASC 606 / deferred revenue | `revenue-recognition` |
| Reconciliation / bank feed / exception workflow | `reconciliation` |
| MRR / ARR / churn / subscription billing | `subscription-metrics` |
| Close workflow / period lock / audit pack / CFO | `close-workflow` |
| Stripe / QuickBooks / Xero / OAuth / webhooks | `integration-engineering` |
| AI assistant / NL query / anomaly / embedding | `ai-product` |
| Auth / session / OTP / passkey / security | `security-review` |
| Pricing / tier / upgrade / credit / billing UI | `pricing-product` |
| Dashboard / chart / report / investor metrics | `financial-reporting` |

---

### Part 5 — Constraints (repeat on every run — non-negotiable)

```
accountId = session ONLY (never req.body or query param)
branch → PR → merge (never push to main)
palette: #FAF8F3 bg + #E85820 accent + stone-* Tailwind (never zinc/slate on light sections)
no secrets client-side (all keys in Worker env vars / KV)
soft delete: deletedAt on financial models (no hard deletes)
audit: AuditEvent append-only (no updates, no deletes ever)
```

---

### FEATURE BRIEF output (produce this block, then pass to Step 0)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FEATURE BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Raw input:        {verbatim user input}
Core action:      {what the system computes or stores — 1 sentence}
User value:       {the "so that I can…" — 1 sentence}
Persona:          {Sophie | Priya | Marcus | Linda | general ICP}
Pipeline stage:   {ingest | normalise | identity | ledger | reconcile | recognise | metrics | intelligence | evidence}
Domain signal:    {skill name matched above, or "cross-domain"}
Scope note:       {any ambiguity, contradiction, or unstated assumption surfaced by sense check}
Mode:             {STRUCTURE | EXECUTE | CONSTRAIN | CLARIFY}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Pass `Core action` + `Pipeline stage` + `Domain signal` as the feature description into Step 0.**
Do NOT pass the raw input — use the structured fields only.

---

## Step 0 — Spawn Coordinator (always the first action, no exceptions)

**Do this before reading anything else in this file.**

Spawn one **coordinator** agent on Sonnet. The coordinator runs Phase 0 inline (the reasoning core),
then spawns purpose-built sub-agents for every other phase using the model assigned in MODEL ROUTING.
Each sub-agent receives only the context it needs — not the full accumulated conversation.
**MODEL ROUTING is produced in Phase 0 and governs every sub-agent spawn. Never override it.**

```
Agent({
  description: "feature-intel: {first 6 words of feature description}",
  subagent_type: "researcher",
  model: "sonnet",
  prompt: `
Feature: {paste the full feature description from the user here}
Working directory: {current working directory}

You are the feature-intel COORDINATOR running on Sonnet. Execute the COORDINATOR PROTOCOL:

1. Read .claude/commands/feature-intel.md — find the COORDINATOR PROTOCOL section and follow it exactly.
2. MODEL ROUTING (produced inline in Phase 0) dictates every sub-agent model. Never override it.
3. Collect all sub-agent return blocks, synthesize, then return the result block below.

Return ONLY this block when done (≤ 300 words total — nothing else):

REPORT: /tmp/feature-intel-{slug}-{YYYYMMDD}.md
VERDICT: {2 sentences — what exists today, what is the 10x gap}
RISKS: {≤ 3 lines — security or delivery blockers only}
SHIP ORDER:
  P0 (hours): {must-fix items}
  P1 (hours): {quick wins}
  P2 (days):  {strategic items}
CLASS A: {moat features}
DO NOT BUILD: {1 line}
PATTERN: {one reusable research or architecture pattern discovered this run — or "none"}
`
})
```

When the coordinator returns: output its block verbatim, add the report as a clickable link.
**Do not read the report. Do not run any other tool calls. The pipeline is complete.**

---

## COORDINATOR PROTOCOL

The coordinator (Sonnet) owns Phase 0 reasoning. Every other phase is delegated to the model
assigned in MODEL ROUTING. Follow these 7 steps in order — no skipping, no reordering.

**Available models (only these three values are valid):** `haiku` · `sonnet` · `opus`

---

### Step C1 — Context Harvest (spawn Haiku)

```
Agent({
  subagent_type: "researcher",
  model: "haiku",
  prompt: `
Run Phase 0-A from .claude/commands/feature-intel.md.
Feature: {feature description}
Working directory: {working directory}
Return ONLY the CONTEXT BRIEF block (the ━━━ delimited block at the end of Phase 0-A).
No other output.
`
})
```
Store the returned CONTEXT BRIEF as **$SHARED_CTX**. Proceed to Step C2.

---

### Step C2 — Activation Plan (run inline — you are the reasoning core)

Read Phase 0 from feature-intel.md. Apply $SHARED_CTX + Hard Activation Rules.
Score all 40 lenses. Produce the **full Activation Plan including MODEL ROUTING block** (see Step 4.5).
Write it to your output now — this is the source of truth every subsequent step obeys.

**Opus gate** — after writing the Activation Plan, check all three:
- compliance = HIGH **AND** money_touch = HIGH **AND** DEEP lens count ≥ 4

If all three true → spawn Opus to validate:
```
Agent({
  subagent_type: "researcher",
  model: "opus",
  prompt: `
You are a senior financial compliance reviewer. Challenge any DEEP lens in this Activation Plan
that touches financial correctness, audit chain, or regulatory obligation. If a lens should be
deeper, say so and why. Return: the same Activation Plan with any depth upgrades annotated.
Activation Plan: {paste full Activation Plan}
$SHARED_CTX: {paste}
`
})
```
Apply any depth upgrades, then update MODEL ROUTING accordingly before proceeding.

---

### Step C3 — Phase 1 ALL lenses (run inline on yourself)

Execute ALL activated lenses (DEEP, MODERATE, and LIGHT) inline. You are Sonnet — all lens work
runs here. LIGHT lenses are cheap; spawning a sub-agent adds latency and complexity for negligible
savings. One sentence per LIGHT lens finding is sufficient.

**Output format per lens:**
- DEEP: `{LENS-ID} [DEEP]: {paragraph finding}`
- MODERATE: `{LENS-ID} [MODERATE]: {short paragraph finding}`
- LIGHT: `{LENS-ID} [LIGHT]: {one-sentence finding}`

**Opus exception**: if MODEL ROUTING assigns `opus` to Phase 1 DEEP lenses → spawn one Opus agent
for those specific lenses only, then merge findings:
```
Agent({
  subagent_type: "researcher",
  model: "opus",
  prompt: `
Execute these DEEP lenses only: {list lenses assigned opus in MODEL ROUTING}.
Use Phase 1 playbooks from .claude/commands/feature-intel.md.
$SHARED_CTX: {paste}
Return findings per lens in the format: {LENS-ID} [DEEP]: {finding}
`
})
```

---

### Step C4 — Phase 2 Country Routing (inline if active)

If Activation Plan shows `COUNTRY: SKIP` → skip this step entirely.
If active → run Phase 2 inline on yourself (Sonnet). Compliance work never runs on Haiku.

---

### Step C5 — Phase 3 Web Research (spawn — model from MODEL ROUTING)

**Model = MODEL ROUTING → Phase 3 value. Never override.**

```
Agent({
  subagent_type: "researcher",
  model: "{MODEL ROUTING Phase 3 value — haiku or sonnet}",
  prompt: `
Run Phase 3 research lenses from .claude/commands/feature-intel.md using the Research Plan below.
For each activated lens: execute the assigned search budget. Synthesize findings into FEAT lines.
Output format (one line per gap):
FEAT: <feature-name> — <Competitor>: <what they do> → Build: <one-sentence action>  [B|M|m|t]
At end: COMPETITOR: <comma-separated list researched>

Research Plan: {paste RESEARCH PLAN section from Activation Plan}
Competitors (Lens 2): {named list}
$SHARED_CTX: {paste}
`
})
```

After this agent returns, proceed to **Step C6 (Quality Gate)** before moving to Step C7.

---

### Step C6 — Phase 3 Quality Gate (run inline — always)

After Step C5 returns (web research), review the FEAT lines before passing to Phase 4.
This step runs on you (Sonnet coordinator) — no sub-agent spawn.

**Check three things:**
1. **Coverage**: Are the top 3 competitors from the Research Plan all represented? If a named competitor has no FEAT line, the research missed it.
2. **Severity calibration**: Is every `B` (table-stakes) gap truly something all major competitors have? Downgrade if not.
3. **Actionability**: Does each `Build:` line name a concrete Axtreo deliverable? Flag and rewrite any that say "consider" or "explore".

**If coverage fails** (≥ 1 named competitor missing AND research was MODERATE or deeper):
```
Agent({
  subagent_type: "researcher",
  model: "haiku",
  prompt: `
Research ONLY this competitor: {missing competitor name}.
Domain: {domain signal from FEATURE BRIEF}
Find their top 3 features in this domain. Output FEAT lines only:
FEAT: <feature-name> — <Competitor>: <what they do> → Build: <one-sentence action>  [B|M|m|t]
`
})
```
Merge the new lines, re-run the three checks, then proceed.

If all three checks pass → proceed directly to Step C7 without any spawn.

---

### Step C7 — Phase 4 + Phase 5 (spawn Haiku)

```
Agent({
  subagent_type: "researcher",
  model: "haiku",
  prompt: `
Run Phase 4 (classify A/B/C/D) then Phase 5 (write full report) from .claude/commands/feature-intel.md.
Use the findings below — do NOT re-run any lens or web research.
Write the report to /tmp/feature-intel-{slug}-{YYYYMMDD}.md.
Return ONLY the worker return block (REPORT / VERDICT / RISKS / SHIP ORDER / CLASS A / DO NOT BUILD / PATTERN).

Phase 1 lens findings (all depths): {paste all findings from Step C3}
Phase 3 research findings (FEAT lines, quality-gated): {paste from Step C6}
Country findings (if any): {paste from Step C4 or "none"}
$SHARED_CTX: {paste}
`
})
```

Return the result block from Step C7 verbatim as your own output.

---

## Purpose

Run this **before writing a single line of code** for any feature or domain. Describe the feature you want to build and this command will:

1. Run a Meta-Orchestrator that reasons about the feature and produces a scored Activation Plan
2. Execute only the lenses that earned activation — at the depth they earned, nothing more
3. Route to country compliance lenses only when the Activation Plan confirms it is necessary
4. Run each research lens at its prescribed depth — from 1 targeted search to unlimited, based on relevance
5. Classify every feature component as Class A / B / C / D
6. Output a full Innovation Delta report

**Input:** The feature description you provide when invoking this command.
**Output:** `/tmp/feature-intel-{slug}-{timestamp}.md` — complete pre-build intelligence report.

Use TodoWrite to track each phase. Mark phases done as they complete.

---

## Phase 0-A — Context Harvest (no web, runs before everything)

**Run this first.** The Meta-Orchestrator cannot score lenses accurately without knowing what already exists. This phase builds `$SHARED_CTX` — the single context block every subsequent phase reads. It prevents every agent from operating blind: re-building shipped features, re-speccing in-progress work, or missing documented constraints.

Run all four queries. Combine results into the CONTEXT BRIEF block at the end of this phase.

---

### Query 1 — Codebase (graphify)

Extract 2–5 domain keywords from the feature description (e.g., for "email OTP login": `auth login otp session email`).

**If `graphify-out/graph.json` exists in the project root**, query the knowledge graph:
```bash
$(which graphify 2>/dev/null || echo "graphify") query "{keywords}" --budget 1500
```
Read the output: god nodes (most-connected concepts in this domain), source_file references, edge relations. These reveal which files are the core of this domain and what's already connected.

**If the graph does not exist** (fall back to grep — note it in CONTEXT BRIEF):
```bash
grep -rl "{keyword1}\|{keyword2}" src --include="*.ts" --include="*.tsx" 2>/dev/null | head -20
grep -r "{keywords}" src/backend --include="*.ts" -l 2>/dev/null | head -10
```

Extract from the codebase scan:
- Route files that handle this domain (e.g., `auth.routes.ts`)
- Prisma models involved (search `prisma/schema.prisma` for model names matching domain)
- Services with relevant logic (e.g., `session.service.ts`, `otp.service.ts`)
- UI components already built (e.g., `Login.tsx`)

---

### Query 2 — Jira

**Step 1 — Discover the project key** (skip if already known from a prior run):
Call `getVisibleJiraProjects` → find the Axtreo project key (e.g., `AX`).

**Step 2 — Search for domain tickets:**
Call `searchJiraIssuesUsingJql` with:
```
project = {key} AND text ~ "{keywords}" ORDER BY updated DESC
```
Fetch up to 15 results. For each result record: key, summary, status (To Do / In Progress / Done / Blocked), and assignee.

Extract:
- **In Progress / Blocked** — what's actively being built; do not duplicate this work
- **To Do / Backlog** — what's planned; align with it or explicitly supersede it
- **Done (recent, last 60 days)** — what's already shipped; never re-spec these
- **Epics** — which initiative this feature belongs to

If Jira is unreachable or returns 0 results: write `JIRA: no results` and proceed — do not block.

---

### Query 3 — Confluence

**Step 1 — Discover the space key** (skip if already known):
Call `getConfluenceSpaces` → find the Axtreo engineering space (e.g., `ENG`, `AX`, `TECH`).

**Step 2 — Search for relevant pages:**
Call `searchConfluenceUsingCql` with:
```
space = {key} AND text ~ "{keywords}" ORDER BY lastModified DESC
```
Fetch up to 10 results.

**Step 3 — Read relevant pages:**
For each result that looks like an architecture doc, spec, ADR, or decision record: call `getConfluencePage` and extract:
- Key decisions already made (do not re-decide these)
- Open questions explicitly documented
- Gaps or TODOs the team has already identified

If Confluence is unreachable or returns 0 results: write `CONFLUENCE: no results` and proceed — do not block.

---

### Query 4 — PATTERNS.md (prior run learnings)

Read `.claude/commands/PATTERNS.md`. Find all entries whose domain header matches the current feature's domain keywords. Extract any patterns that apply — these are pre-validated research findings from prior runs that skip redundant web searches.

If no domain match: write `PATTERNS: no match — fresh domain` and proceed.
If file doesn't exist: write `PATTERNS: file not found` and proceed.

---

### Output — CONTEXT BRIEF

Produce this block before Phase 0. The Meta-Orchestrator reads `$SHARED_CTX` before scoring a single lens — it must know what exists before it decides what to investigate.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONTEXT BRIEF  ($SHARED_CTX)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Domain keywords:  {keywords used for all four queries}
Graph status:     BUILT — queried | NOT BUILT — grep fallback used

CODEBASE STATE
  Route files:     {e.g. src/backend/auth/auth.routes.ts}
  Prisma models:   {e.g. Session, EmailOtpToken, MagicLinkToken}
  Services:        {e.g. session.service.ts, otp.service.ts}
  UI components:   {e.g. Login.tsx}
  Graph god nodes: {top 3 most-connected nodes in this domain — or "n/a: graph not built"}

EXISTING FEATURES  (do not re-suggest these)
  • {e.g. "Email OTP — EmailOtpToken, 10-min TTL, single-use flag, bcrypt hash"}
  • {e.g. "Magic link — MagicLinkToken, HMAC-signed, 24-hr TTL"}
  • {e.g. "Google sign-in — GIS popup, jose JWT verify, axtreo_sid httpOnly cookie"}

JIRA CONTEXT
  In-progress:   {AX-NNN} — {summary}  ({assignee})
  To Do:         {AX-NNN} — {summary}
  Done (recent): {AX-NNN} — {summary}
  Epic:          {epic name or "none found"}
  Status:        FOUND ({N} tickets) | NO RESULTS

CONFLUENCE CONTEXT
  "{Page title}": {one-line key decision or gap documented}
  "{Page title}": {one-line key decision or gap documented}
  Status:         FOUND ({N} pages) | NO RESULTS

PRIOR RUN PATTERNS  (apply these — skip re-researching)
  • {AUTH-001: rate-limit key format — or "none applicable"}
  • {SEC-001: relevant pattern — or "none applicable"}

KNOWN GAPS  (explicitly documented — Meta-Orchestrator must address these)
  • {e.g. "AX-142 (To Do): passkey support planned, design not started"}
  • {e.g. "Auth Architecture page: OTP retry-rate limit not yet enforced"}

WARNINGS  (hard constraints — do not override without explicit approval)
  • {e.g. "AX-89 (Done): single-use OTP enforcement already shipped — do not re-spec"}
  • {e.g. "SameSite=strict cookie flag is intentional — do not suggest removing it"}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Phase 0 — Meta-Orchestrator (no web)

This phase runs before any lens, any research, and any classification. It produces the **Activation Plan** that every subsequent phase obeys. No lookup table can override what the Meta-Orchestrator decides — it reasons from first principles about this specific feature.

---

### Step 1 — Feature Decomposition

Read the feature description and extract the following. If any dimension is ambiguous, choose the most conservative interpretation and note it.

| Dimension | What to extract |
|-----------|-----------------|
| **Core action** | What does the user do? What does the system compute or store? |
| **Pipeline stage(s)** | Which of the 9 stages does this touch? ingest → normalise → identity → ledger → reconcile → recognise → metrics → intelligence → evidence |
| **Persona(s) affected** | Sophie (FR, controller) / Priya (multi-entity, 4 countries) / Marcus (freelancer, Stripe) / Linda (auditor) / general ICP |
| **Money touch** | Does this move, compute, or display financial amounts? HIGH / MED / LOW |
| **Compliance surface** | Does this touch tax, audit, regulated reporting, or financial disclosure? HIGH / MED / NONE |
| **AI surface** | Does this invoke an AI model, embed a vector, produce a scored output, or use GraphRAG? YES / NO |
| **External API** | Does this call Stripe, QBO, Xero, HMRC, or any third party at runtime? YES (name it) / NO |
| **Write path** | Does this write to the database, trigger a computation run, or mutate financial state? YES / NO |

---

### Step 2 — Lens Scoring

Score every lens in the library from **0 to 10**. Assign a depth based on the score. Do not skip this step — every lens gets a score, even if that score is 0.

| Score | Depth | Rule |
|-------|-------|------|
| 0–2 | **SKIP** | Orthogonal. Running this lens adds zero value. Do not mention it again. |
| 3–5 | **LIGHT** | Tangential. Run only the single most important gap-check question. One sentence finding. |
| 6–8 | **MODERATE** | Material. Run 2–3 focused checks. Short paragraph finding per lens. |
| 9–10 | **DEEP** | Governs correctness, compliance, or architectural moat for this feature. Full research, no caps. |

**Default rule for Tier-1 lenses**: L1.2, L1.7, L2.3, L3.1, L4.4, L12.3 start at LIGHT (score 4). New lenses: L12.1, L15.1, L17.4, L18.1, L18.2 start at MODERATE (score 6); L15.2, L16.1, L16.2, L17.1, L17.2, L17.3, L17.5, L17.6, L20.1, L20.2 start at LIGHT (score 4). Client Psychology / Behavioral / Moment lenses: L22.1, L22.2, L22.4, L23.2, L24.2 start at MODERATE (score 6); L22.3, L23.1, L23.3, L23.4, L24.1, L24.3, L24.4, L25.1, L25.2, L25.3, L26.1, L26.2, L27.1, L27.2, L27.3 start at LIGHT (score 4). Elevate only if the feature's domain signals, Money Touch, Compliance Surface, or Write Path demand it.

**Full lens library to score:**

```
Financial / Domain
  L1.2  CPA/Controller       — double-entry, journal traceability, period irreversibility
  L1.3  CFA                  — SaaS metric definitions, investor peer-comparability
  L1.4  FP&A                 — 3-statement integrity, P&L + BS + CF balance
  L1.5  Auditor              — SHA-256 chain, drillable to source transaction
  L1.6  Tax Professional     — jurisdiction rates, effective dates, exempt + reverse-charge
  L1.7  Quant/Math           — integer cents, rounding at display only, deterministic FX
  L1.8  Actuary              — tail risk, customers with no revenue history

Technical
  L2.1  System Design        — single responsibility, no circular deps, compute layer reads only
  L2.2  Scalability          — P99 < 30s for <500 items; async queue for >500
  L2.3  DB Architecture      — Decimal types, fiscal_month from entity timezone, prisma.$transaction
  L2.5  AI/ML                — model selection, fallback, system prompt, cost per account

Security
  L3.1  Cybersecurity        — account_id from session, Zod validation, no console.log
  L3.2  Data Privacy         — PII retention policy, deleted_at, not logged
  L3.3  Cryptography         — SHA-256 hashing, AES-256-GCM for sensitive fields
  L3.5  Zero-Trust           — least privilege, every internal call carries account_id

Product / Execution
  L4.1  Product (CFO UX)     — CFO demo value, step count vs industry baseline
  L4.4  Roadmap/Dep          — upstream dependencies complete, wave order correct
  L12.3 AI-First Exec        — buildable from ticket alone, no ambiguous requirements

Regulatory
  L6.1  Regulatory           — GAAP/IFRS/SOX applicability, accrual basis enforced
  L6.2  Multi-Jurisdiction   — entity-level filing, each entity files separately
  L6.3  Data Sovereignty     — EU data residency, cannot leave jurisdiction without consent

Reporting / Infrastructure
  L7.4  Investor/Board       — moat, Beacon portal, Series A narrative impact
  L8.1  DevOps               — timeouts defined, DLQ exists, failure alert wired
  L8.2  Observability        — healthy/degraded/broken states defined for this domain
  L13.1 Integration Partner  — API ToS, rate limits, retry strategy, OAuth scope

Backend / Database
  L12.1 SLI/SLO & Alerts     — SLIs on critical paths, SLO burn-rate alerts, structured logs + requestId, Worker tail logging, DLQ
  L15.1 Backend Feasibility  — BFRI: architectural fit, business logic complexity, data risk, operational risk, testability
  L15.2 API Contract         — REST naming, pagination, error envelope, retry backoff, per-endpoint rate limits, requestId logging
  L18.1 Prisma Safety        — @relation cascade, @@index, enum migrations, backward-compatible DDL, N+1 risk, interactive transactions
  L18.2 Query Performance    — partial/composite indexes, SELECT *, pagination, aggregations to compute tables, isolation level

Frontend
  L16.1 Frontend Complexity  — feature-based org, Suspense boundaries, lazy loading, cross-feature coupling, bundle split
  L16.2 Core Web Vitals      — LCP regression, CLS risk, INP risk, fetchpriority hints, deferred JS budget

Product / Growth
  L17.1 Behavioral Psych     — anchor/loss-aversion/choice-reduction; upgrade, onboarding, cancel flows; no dark patterns
  L17.2 Pricing Coherence    — value metric, tier assignment, usage limits, freemium activation path, pricing-page updates
  L17.3 Retention Signal     — activation metric, paywall changes, dunning/win-back paths, FTC Click-to-Cancel compliance
  L17.4 Analytics Instr      — [object]_[past_verb] taxonomy, funnel events, NSM impact, A/B test readiness, monetization tracking
  L17.5 Launch Readiness     — channel plan, changelog entry, Product Hunt candidacy, onboarding email, comparison-page updates
  L17.6 Unit Economics       — CAC/LTV/payback, AI marginal cost model, gross margin per tier, infra cost vs monetization event

Accessibility / DX
  L20.1 WCAG Accessibility   — keyboard nav, ARIA roles, colour contrast on warm cream (#FAF8F3), visible labels, live regions
  L20.2 Developer Experience — npm scripts, .env.example gaps, README, git hooks, clone-to-run time

Client Psychology
  L22.1  JTBD                — what job is client hiring this feature for? what trigger event causes them to act?
  L22.2  Pain Archaeology    — what workaround does the client use TODAY? (tool count, manual steps, time cost)
  L22.3  Outcome Definition  — what does "done" feel like? how does the client measure success post-feature?
  L22.4  Trust Economics     — does this increase or decrease the client's trust in their own numbers?

Behavioral Economics
  L23.1  Cognitive Load      — how many mental models does this collapse or add? (fewer = better)
  L23.2  Regret Frame        — what is the worst outcome without this feature? is that asymmetry in the pitch?
  L23.3  Loss Aversion       — what is the client protecting against? lead with that, not with capability
  L23.4  Habit Potential     — daily/weekly ritual or monthly-only event? (ritual = higher retention)

Moment Architecture
  L24.1  Trigger Map         — 3 specific events that send the client to this feature right now
  L24.2  Midnight Test       — usable at 11pm before a board meeting? crisis UX vs demo UX?
  L24.3  First Value Moment  — when does the client first feel "this just saved me"? design for that moment
  L24.4  Wow Moment          — single number/insight that makes client say "oh wow" — what is it?

Identity & Status
  L25.1  Identity Upgrade    — does this move client: reactive reporter → proactive analyst?
  L25.2  CEO Moment          — what does the client show their CEO? what do they say? design the demo
  L25.3  Audit Credibility   — does this increase the client's credibility with their auditor?

Hidden Value
  L26.1  Leakage Detection   — what revenue or risk does this surface that the client didn't know existed?
  L26.2  Blind Spot Map      — what can the client NOT see today that this makes visible?

Switching & Retention
  L27.1  Switching Friction  — why do clients stay broken? what is the real migration fear?
  L27.2  Stickiness Moat     — after 3 months of use, how hard is it to leave? (data gravity, integrations)
  L27.3  Compounding Value   — does value increase the longer they use it? (data flywheel, cohort depth)
```

---

### Step 3 — Country Routing Decision

Decide: does this feature require country-specific compliance analysis?

Activate country lenses **only if at least one** of these is true:
- The feature computes, stores, or displays tax, VAT, GST, payroll, or filing data
- A specific country persona is in scope (Sophie → C11a France, Priya → C1+C10+C6, Marcus → C1)
- The feature handles currency conversion, FX rates, or multi-currency presentation

If YES: list which country codes to activate (C1–C12) and the specific reason for each.
If NO: write `COUNTRY: SKIP — no tax/payroll/FX signal detected` and Phase 2 does not run.

---

### Step 4 — Research Lens Scoring

Score each of the 5 research lenses. A research lens score translates directly to search budget.

| Research Lens | Score | Depth | Search budget |
|--------------|-------|-------|---------------|
| Lens 1 — Market Frontier | 0–10 | | SKIP / 1–2 / 3–5 / unlimited |
| Lens 2 — Competitor Gap Map | 0–10 | | SKIP / 1–2 / 3–5 / unlimited |
| Lens 3 — Regulation Accelerator | 0–10 | | SKIP / 1–2 / 3–5 / unlimited |
| Lens 4 — Architecture Leverage | 0–10 | | SKIP / 1–2 / 3–5 / unlimited |
| Lens 5 — UX Reduction | 0–10 | | SKIP / 1–2 / 3–5 / unlimited |
| Lens 6 — Client Voice Research | 0–10 | | SKIP / 1–2 / 3–5 / unlimited |
| Lens 7 — Switch Interview Patterns | 0–10 | | SKIP / 1–2 / 3–5 / unlimited |

For Lens 2 (Competitor Gap): if activated, name exactly 3–5 competitors relevant to this specific feature. Do not default to the full domain list — reason about which competitors have actually built something relevant.

For Lens 6 (Client Voice): if activated, name the pain domains to search (e.g. "reconciliation", "month-end close", "MRR trust"). Start MODERATE (score 6) by default — every user-facing feature benefits from real client language.

For Lens 7 (Switch Interview): if activated, name the 2–4 tools clients are switching FROM. Mine their exact exit language — this is your conversion copy.

---

### Step 4.5 — Model Routing Assignment

Using the dimension values (from Step 1) and lens depths (from Steps 2 + 4), assign a model to each phase.
**Only three values are valid: `haiku` · `sonnet` · `opus`** — these map directly to the Agent tool's `model` parameter.

| Phase | Default | Escalate to `sonnet` when | Escalate to `opus` when |
|---|---|---|---|
| Phase 0-A  Context Harvest | `haiku` | never | never |
| Phase 0    Meta-Orchestrator | `sonnet` | — | compliance=HIGH **AND** money_touch=HIGH **AND** DEEP≥4 |
| Phase 1    DEEP lenses | `sonnet` | — | domain∈{CLOSE,RECOG,TAX} **AND** compliance=HIGH |
| Phase 1    MODERATE lenses | `sonnet` | — | never |
| Phase 1    LIGHT lenses | `sonnet` inline | — | never (inline always) |
| Phase 2    Country Routing | `sonnet` if active | always when active | never |
| Phase 3    Web Research | `haiku` | Lens 3 Regulation = DEEP | never |
| Phase 4    Classification | `haiku` | never | never |
| Phase 5    Report Writing | `haiku` | never | never |

**Rules that cannot be overridden:**
- `haiku` is locked for tool-call-heavy and structured-output phases (0-A, Phase 3, 4, 5)
- ALL Phase 1 lenses (DEEP, MODERATE, LIGHT) run inline on Sonnet — no sub-agent for LIGHT
- `sonnet` is locked for Phase 0 reasoning, all lens execution, and the Phase 3 quality gate
- `opus` fires only when financial correctness is non-negotiable (tax, close, recognition at HIGH compliance)
- Phase 2 (country compliance) always runs on `sonnet` when active — compliance cannot run on Haiku
- Phase 3 escalates to `sonnet` only when Lens 3 (Regulation) is DEEP, requiring nuanced legal synthesis

Write the MODEL ROUTING block as part of the Activation Plan output (see Step 5 template).

---

### Step 5 — Output the Activation Plan

Produce this block before proceeding to Phase 1. Nothing runs until this block is written.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ACTIVATION PLAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Feature:         {name}
Intent:          {one sentence — what problem, for whom, in which pipeline stage}
Pipeline stages: {list}
Personas:        {list or "general ICP"}
Money touch:     HIGH | MED | LOW
Compliance:      HIGH | MED | NONE
AI surface:      YES | NO
External API:    YES ({name}) | NO
Write path:      YES | NO

PERSPECTIVE LENS DECISIONS
L1.2  CPA/Controller       {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L1.3  CFA                  {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L1.4  FP&A                 {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L1.5  Auditor              {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L1.6  Tax Professional     {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L1.7  Quant/Math           {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L1.8  Actuary              {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L2.1  System Design        {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L2.2  Scalability          {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L2.3  DB Architecture      {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L2.5  AI/ML                {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L3.1  Cybersecurity        {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L3.2  Data Privacy         {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L3.3  Cryptography         {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L3.5  Zero-Trust           {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L4.1  Product (CFO UX)     {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L4.4  Roadmap/Dep          {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L6.1  Regulatory           {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L6.2  Multi-Jurisdiction   {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L6.3  Data Sovereignty     {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L7.4  Investor/Board       {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L8.1  DevOps               {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L8.2  Observability        {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L12.3 AI-First Exec        {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L13.1 Integration Partner  {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L12.1 SLI/SLO & Alerts    {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L15.1 Backend Feasibility {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L15.2 API Contract        {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L16.1 Frontend Complexity {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L16.2 Core Web Vitals     {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L17.1 Behavioral Psych    {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L17.2 Pricing Coherence   {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L17.3 Retention Signal    {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L17.4 Analytics Instr     {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L17.5 Launch Readiness    {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L17.6 Unit Economics      {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L18.1 Prisma Safety       {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L18.2 Query Performance   {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L20.1 Accessibility       {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L20.2 Dev Experience      {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L22.1 JTBD                {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L22.2 Pain Archaeology    {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L22.3 Outcome Definition  {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L22.4 Trust Economics     {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L23.1 Cognitive Load      {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L23.2 Regret Frame        {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L23.3 Loss Aversion       {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L23.4 Habit Potential     {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L24.1 Trigger Map         {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L24.2 Midnight Test       {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L24.3 First Value Moment  {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L24.4 Wow Moment          {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L25.1 Identity Upgrade    {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L25.2 CEO Moment          {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L25.3 Audit Credibility   {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L26.1 Leakage Detection   {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L26.2 Blind Spot Map      {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L27.1 Switching Friction  {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L27.2 Stickiness Moat     {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}
L27.3 Compounding Value   {DEEP|MODERATE|LIGHT|SKIP}  {one-line reason}

COUNTRY ROUTING
{C-code: reason for activation — OR — SKIP: no tax/payroll/FX signal}

RESEARCH PLAN
Lens 1  Market Frontier     {DEEP|MODERATE|LIGHT|SKIP}
Lens 2  Competitor Gap      {DEEP|MODERATE|LIGHT|SKIP}  competitors: {named list}
Lens 3  Regulation          {DEEP|MODERATE|LIGHT|SKIP}  regulations: {named list or "none"}
Lens 4  Architecture        {DEEP|MODERATE|LIGHT|SKIP}  moats: {named list}
Lens 5  UX Reduction        {DEEP|MODERATE|LIGHT|SKIP}
Lens 6  Client Voice        {DEEP|MODERATE|LIGHT|SKIP}  pain-domains: {named list}
Lens 7  Switch Interview    {DEEP|MODERATE|LIGHT|SKIP}  switching-from: {named list}
Estimated web searches: ~{N}

ACTIVATED LENSES SUMMARY: {N} DEEP  {N} MODERATE  {N} LIGHT  {N} SKIP

MODEL ROUTING  (apply Step 4.5 rules — only haiku · sonnet · opus allowed)
Phase 0-A  Context Harvest     haiku
Phase 0    Meta-Orchestrator   {sonnet|opus}   {reason if opus}
Phase 1    DEEP lenses         {sonnet|opus}   {reason if opus, else "sonnet — default"}
Phase 1    MODERATE lenses     sonnet
Phase 1    LIGHT lenses        sonnet (inline)
Phase 2    Country Routing     {sonnet if active | skip}
Phase 3    Web Research        {haiku|sonnet}  {reason if sonnet, else "haiku — default"}
Phase 4    Classification      haiku
Phase 5    Report Writing      haiku
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Sanity check**: If the summary shows 0 DEEP lenses, re-read the feature description. Either the feature is genuinely infrastructure-only (valid — note it explicitly), or a material lens was under-scored. State which and proceed.

---

### Hard Activation Rules (read BEFORE scoring — override Meta-Orchestrator judgment)

These locks fire before Step 2 scoring. If the condition matches, the lens depth is the minimum — Meta-Orchestrator cannot score it lower. If the scoring table would produce a higher depth, the higher depth wins.

| Condition | Lens | Minimum | Why it's locked |
|---|---|---|---|
| Domain = AUTH | L3.1 Cybersecurity | **DEEP** | Auth IS the security feature — not optional |
| Domain = AUTH | L3.3 Cryptography | **DEEP** | Token storage correctness is non-negotiable |
| Domain = AUTH | L3.2 Data Privacy | **MODERATE** | Session tokens + IP = PII by default |
| Domain = AUTH | L3.5 Zero-Trust | **MODERATE** | Account isolation enforced at auth layer |
| Domain = CLOSE or RECOG | L1.5 Auditor | **DEEP** | SHA-256 chain non-negotiable for close/recognition |
| Domain = RECON | L1.5 Auditor | **MODERATE** | Source traceability required per match |
| Domain = INTEGRATION | L13.1 Integration Partner | **MODERATE** | OAuth ToS + rate limits required on every integration |
| Domain = TAX or PAYROLL | L1.6 Tax Professional | **DEEP** | Tax rates + jurisdiction = always critical |
| Write path = YES | L18.1 Prisma Safety | **MODERATE** | Any DB write needs migration safety + cascade check |
| Write path = YES | L3.1 Cybersecurity | **MODERATE** (minimum) | accountId isolation check on all write paths |
| AI surface = YES | L2.5 AI/ML | **DEEP** | Write path isolation + number invention guardrail critical |

**How to apply:** Before filling in the Activation Plan table, check each row above. If it fires, write the minimum depth into the plan first — then apply the scoring table for any lens NOT covered by a hard rule. Never downgrade a locked lens.

---

## Domain Code Reference (used by Meta-Orchestrator in Step 1)

These codes are starting-point signals, not binding activation rules. The Meta-Orchestrator reads these, then reasons beyond them.

| Domain Code | Signal keywords |
|-------------|-----------------|
| METRICS | MRR, ARR, NRR, churn, cohort, revenue bridge, logo retention, Rule of 40, burn multiple, CAC, LTV, SaaS metrics, dashboard |
| RECON | reconciliation, bank feed, match, exception, cash ledger, bank statement, import, ISO 20022, unmatched |
| RECOG | revenue recognition, ASC 606, IFRS 15, contract, performance obligation, RPO, deferred revenue, SSP, variable consideration |
| CLOSE | close pack, close cycle, close, seal, period close, fiscal close, audit pack, month-end, GL, journal |
| TAX | tax, VAT, GST, TVA, PPN, MwSt, BTW, nexus, filing, e-invoice, Fatoora, Coretax, MTD, ZATCA, e-fapiao |
| AI | AI, Arc, ML, predict, anomaly, detect, forecast, score, recommend, GraphRAG, RAG, agent, intelligent |
| INTEGRATION | Stripe, QuickBooks, Xero, webhook, OAuth, bank feed, Plaid, Basiq, sync, API, connect |
| REPORTING | report, Beacon, investor, dashboard, export, PDF, chart, visual, breakdown, analytics |
| AUTH | login, session, TOTP, passkey, OTP, magic link, 2FA, auth, token, identity |
| PAYROLL | payroll, salary, PAYE, FICA, super, superannuation, CPP, KiwiSaver, BPJS, GOSI, CPF, wages, employment |
| MULTI_ENTITY | entity, consolidation, FX, multi-currency, jurisdiction, subsidiary, translation, intercompany, CTA |
| INFRA | deploy, worker, CI/CD, database, schema, migration, infrastructure, pipeline, cron, queue |
| FREELANCER | freelancer, independent contractor, 1099, solo, self-employed, Marcus, SE tax, quarterly tax, quarterly estimate, retainer, project billing, take-home, sole proprietor |

---

## Phase 1 — Perspective Lens Execution (no web)

**Execute only the lenses that scored DEEP, MODERATE, or LIGHT in the Activation Plan. Do not run any lens that scored SKIP. Do not run every lens by default.**

### Phase 1 Output Format (compact — required)

All lens findings must follow this pattern regardless of depth:

```
[LENS-ID] [PASS|RISK|FAIL] — [gap or key finding]. [Fix if RISK/FAIL].
```

- **DEEP**: max 5 bullet lines. One line per gap-check. No prose paragraphs.
- **MODERATE**: max 2 lines. One for finding, one for fix.
- **LIGHT**: 1 line exactly. PASS/RISK/FAIL + one clause.

Drop all filler. No "it is important to note that", no restating the lens name in prose. Fragments OK. Technical terms exact. **Total Phase 1 budget: ≤ 500 words across all activated lenses combined.**

### Skill Routing (invoke instead of running inline)

For the lenses below, **do not run inline instructions**. Instead call the Skill tool with the mapping below, pass the compact context block, and collect the result. This keeps the worker's context window lean — the skill runs in its own scope.

```
Skill({ skill: "{skill-name}", args: "Feature: {name}\n$SHARED_CTX summary: {3-line summary}\nLens depth: {DEEP|MODERATE|LIGHT}\nTask: {lens question(s)}\nOutput: caveman format ≤{5|2|1} lines. PASS/RISK/FAIL prefix each line." })
```

| Lens | Skill name | When to invoke |
|------|-----------|----------------|
| L12.1 SLI/SLO & Alerts | `observability-engineer` | Any write path or async job |
| L15.1 Backend Feasibility | `backend-dev-guidelines` | Any new service, route, or data model |
| L15.2 API Contract | `api-design-principles` | Any new or changed endpoint |
| L16.1 Frontend Complexity | `senior-frontend` | Any new page, route, or component tree |
| L16.2 Core Web Vitals | `web-performance-optimization` | Any page with data-heavy render |
| L17.1 Behavioral Psych | `marketing-psychology` | Onboarding, upgrade, cancel, or paywall flows |
| L17.2 Pricing Coherence | `pricing-strategy` | Any tier assignment, limit, or paywall change |
| L17.3 Retention Signal | `churn-prevention` | Any activation metric or paywall change |
| L17.4 Analytics Instr | `analytics-tracking` | Any user-facing feature that needs funnel data |
| L17.5 Launch Readiness | `launch-strategy` | Any feature that ships to users |
| L17.6 Unit Economics | `startup-metrics-framework` | Any AI-credit-consuming or per-seat feature |
| L18.1 Prisma Safety | `prisma-expert` | Any Prisma schema or migration change |
| L18.2 Query Performance | `database-optimizer` | Any new query, index, or aggregation |
| L20.1 Accessibility | `accessibility-compliance-accessibility-audit` | Any UI form, modal, or interactive component |
| L20.2 Dev Experience | `dx-optimizer` | Any infra, env var, or tooling change |
| L2.5 AI/ML | `ai-engineering-toolkit` | Any AI model invocation |
| L3.1 Cybersecurity | `security-audit` | Any write path, auth flow, or external API |
| L3.2 Data Privacy | `security-audit` | Any feature storing PII, tokens, or IP addresses |
| L3.3 Cryptography | `security-audit` | Any token storage, field encryption, or HMAC signing |
| L3.5 Zero-Trust | `security-audit` | Any multi-tenant DB query or financial write path |

**Rules:**
- If a skill is invoked, do not also run the lens inline. One or the other, never both.
- Lenses NOT in the routing table (L1.x, L2.1, L2.2, L2.3, L4.x, L6.x, L7.x, L8.x, L12.3, L13.1) run inline as before.
- If the Skill tool is unavailable: fall back to the **Lens Execution Playbooks** below — same intelligence, inline, no skill call needed.

---

For each activated lens, apply it at the depth it earned:
- **DEEP**: All gap-check questions — one compact line per check, mark PASS / RISK / FAIL.
- **MODERATE**: 2–3 most material gap-checks only — compact finding + fix per check.
- **LIGHT**: Single most important gap-check — one sentence, PASS / RISK / FAIL only.

---

### Lens Execution Playbooks

Distilled intelligence from each skill file — embedded inline. The worker runs these directly when Skill tool is unavailable (or uses them as the scoring rubric even when a skill IS called).

---

#### L12.1 — SLI/SLO & Alerts ← observability-engineer

**SLI/SLO definitions**
- SLI = `successful_requests / total_requests × 100` (availability) or `P99 latency < Xs`
- SLO target: 99.9% = 8.7h/year error budget · 99.5% = 43.8h/year
- Error budget burn rate = `current_error_rate / (1 − SLO_target)` · Alert fires when burn > 14.4 (5% budget in 1h)

**Gap-checks** (DEEP: all 5 · MODERATE: top 3 · LIGHT: check 1 only)
1. **SLI defined**: Is there a measurable SLI for this critical path (availability %, P99 latency threshold)?
2. **SLO set + burn-rate alert**: Is the SLO target stated? Is a burn-rate alert configured at burn > 14.4?
3. **Structured logs + requestId**: Does every log line in this path carry `requestId`? Is PII excluded from all log output?
4. **Worker tail / DLQ**: For Cloudflare Worker paths, is `wrangler tail` or equivalent configured? For async jobs, does a Dead Letter Queue exist?
5. **Three states defined**: Are healthy / degraded / broken states named for this domain (e.g., degraded = P99 > 5s but < 30s; broken = > 30s or error rate > 1%)?

PASS if all 5 · RISK if SLO defined but burn-rate alert absent · FAIL if SLI not defined at all.

---

#### L15.1 — Backend Feasibility ← backend-dev-guidelines

**BFRI Formula** (Backend Feasibility & Risk Index)
```
BFRI = (Architectural Fit + Testability) − (Complexity + Data Risk + Operational Risk)
```
Each dimension: 1–5. Range: −10 to +10.
- ≥ 6: Safe — proceed · 3–5: Moderate — add tests + monitoring · 0–2: Risky — refactor/isolate first · < 0: Dangerous — redesign before coding

**Axtreo stack rules** (non-negotiable)
- Layer order: Routes → Controllers → Services → Repositories → DB. No skipping.
- All async route handlers wrapped in `asyncErrorWrapper`. No unhandled promise rejections.
- All external input validated with Zod at the service boundary (req.body, query params, webhook payloads).
- Errors captured in Sentry — no `console.log` for production errors.
- `accountId` from session only — NEVER from `req.body` or query params.

**Gap-checks** (DEEP: all 5 + BFRI score · MODERATE: top 3 · LIGHT: BFRI score only)
1. **Layered architecture**: Routes → Controllers → Services → Repositories — no layer skipping?
2. **Input validation**: All external input validated with Zod before reaching service logic?
3. **Error handling**: asyncErrorWrapper on all async routes? Errors go to Sentry (not console.log)?
4. **Testability**: Service layer unit-testable in isolation — dependencies injected, no direct Prisma in controllers?
5. **BFRI score**: Calculate and state. If < 3, flag RISK; if < 0, flag FAIL.

PASS if BFRI ≥ 6 and all checks pass · RISK if BFRI 3–5 · FAIL if BFRI < 3.

---

#### L15.2 — API Contract ← api-design-principles

**Axtreo API standards**
- Resource URLs: noun-based, plural, kebab-case (`/api/revenue-runs` not `/api/getRevenueRun`)
- Error envelope: `{ error: { code: "VALIDATION_ERROR", message: "...", requestId: "..." } }`
- Pagination: cursor-based (`nextCursor`) — never offset — for any collection that can grow > 100 rows
- Rate limiting: auth/billing/heavy-compute endpoints rate-limited separately from general endpoints
- `requestId` on every request log line, propagated through response headers

**Gap-checks** (DEEP: all 5 · MODERATE: top 3 · LIGHT: naming + error envelope only)
1. **REST resource naming**: Noun-based plural resource URLs? No verb in path?
2. **Error envelope**: Does every error response follow `{ error: { code, message, requestId } }`? No raw thrown errors?
3. **Cursor pagination**: Implemented for any collection that can grow > 100 rows?
4. **Rate limiting**: Are auth / billing / AI endpoints rate-limited separately from CRUD endpoints?
5. **Retry guidance**: Does the API return `Retry-After` on 429? Is exponential backoff with jitter documented?

PASS if all 5 · RISK if pagination or error envelope missing · FAIL if no error envelope pattern.

---

#### L16.1 — Frontend Complexity ← senior-frontend

**Bundle Health Score** (A=90–100 · B=80–89 · C=70–79 · D=60–69 · F<60)
- Heavy deps to flag: `moment` (290KB → `date-fns` 12KB) · `lodash` (71KB → `lodash-es` tree-shaken) · `@mui/material` (→ `shadcn/ui`) · `axios` (→ native fetch)
- Route chunk target: gzipped < 200KB each

**Server vs client boundary** (React 19 / Vite context)
- `use client` only when: event handlers (onClick) · `useState`/`useReducer` · `useEffect` · browser APIs
- All data-fetching components server-side by default; push `use client` as deep in the tree as possible

**Gap-checks** (DEEP: all 5 · MODERATE: top 3 · LIGHT: coupling + bundle only)
1. **`use client` scope**: Is `use client` restricted to the minimum component subtree? No unnecessary client boundary at page level?
2. **Suspense boundaries**: Does every async component tree have `<Suspense fallback={...}>`? Are routes code-split at logical boundaries?
3. **Lazy loading**: Are heavy components (charts, modals, PDF viewer, rich editors) loaded via `React.lazy()` / dynamic import?
4. **Cross-feature coupling**: Does this feature import from another feature's internal components or hooks (not from a shared lib)? Feature-based folder structure respected?
5. **Bundle health mental check**: Would any heavy dep (`moment`, full `lodash`, `@mui/material`) enter the bundle via this feature?

PASS if all 5 · RISK if lazy loading missing on heavy components · FAIL if direct cross-feature internals coupling.

---

#### L16.2 — Core Web Vitals ← web-performance-optimization

**Targets**: LCP < 2.5s · FID/INP < 100ms · CLS < 0.1 · TTFB < 600ms · Lighthouse ≥ 90

**Key fixes**
- LCP: hero image with `loading="eager"` + `fetchpriority="high"` + `<link rel="preload">` · compress to < 200KB (WebP/AVIF)
- CLS: always specify `width` + `height` on images · skeleton loaders or `min-height` reserved for async content · no content that shifts existing layout on load
- FID/INP: no sync JS > 50ms on main thread · `defer`/`async` on third-party scripts · lazy import heavy viz libs (chart.js, pdf.js)
- Bundle: gzipped JS per route < 200KB · Vite `optimizePackageImports` for lucide-react, @heroicons

**Gap-checks** (DEEP: all 4 · MODERATE: LCP + CLS · LIGHT: LCP regression only)
1. **LCP**: Is the page's largest element loaded eagerly with fetchpriority hint and preload link?
2. **CLS**: Does every async-loaded element (user data, chart, image) have reserved space so layout doesn't shift on load?
3. **FID/INP**: Is the main-thread JS budget under 50ms chunks? Are third-party and non-critical scripts deferred?
4. **Deferred JS budget**: Are heavy viz libs (charts, PDF, rich text) lazily imported — not in the route entry bundle?

PASS if LCP + CLS checks pass · RISK if INP risk from synchronous heavy JS · FAIL if CLS > 0.1 (confirmed layout-shifting content).

---

#### L17.1 — Behavioral Psych ← marketing-psychology

**PLFS Formula** (Psychological Leverage & Feasibility Score)
```
PLFS = (Behavioral Leverage + Context Fit + Speed to Signal + Ethical Safety) − Implementation Cost
```
Dimensions 1–5. Range: −5 to +15.
- ≥ 12: Apply immediately · 8–11: Prioritize · 4–7: Test carefully · ≤ 3: Defer · ≤ 0: Do not use

**Journey-stage model bias** (match lever to stage):
- **Onboarding / Activation**: Anchoring (price shown high-to-low) + Paradox of Choice (≤ 3 options on key decision) + Default Effect (recommended plan pre-selected)
- **Upgrade / Paywall**: Loss Aversion (show what's lost, not what's gained) + Social Proof + honest scarcity
- **Cancel / Offboarding**: Loss Aversion + Endowment Effect + Status-Quo Bias (natural friction of multi-step cancel = acceptable)
- **Retention**: IKEA Effect (users who configure their workspace stick more) + Switching Costs

**Ethical guardrails** (FAIL any that fire):
- No dark patterns (hidden cancel, forced continuity, deceptive defaults)
- No false scarcity (fake countdown timers, inflated "X users watching")
- No exploiting distress (cancellation guilt-trips, fear messaging at off-boarding)
- Cancellation must be as easy to find as signup (FTC Click-to-Cancel)

**Gap-checks** (DEEP: PLFS-score top 3 models + ethical audit · MODERATE: journey stage + top 1 model · LIGHT: dark pattern / ethical check only)
1. **Dark pattern check**: Does any flow hide the cancel option, use deceptive defaults, or create false urgency? (FAIL if yes)
2. **Journey stage match**: Is the psychological lever matched to the correct journey stage (Decision levers at purchase, Retention levers post-onboarding)?
3. **Choice overload**: Are there > 3 options at any single decision point with no recommended default?

FAIL if dark pattern detected · RISK if > 3 options with no default or wrong journey-stage model · PASS if PLFS ≥ 8 model applied at correct stage.

---

#### L17.2 — Pricing Coherence ← pricing-strategy

**Three decisions** (all three must be answered before any paywall or tier change ships):
1. **Packaging** — What is included in each tier? What's deliberately excluded?
2. **Value Metric** — What do customers pay for? (users / usage events / reconciled months / flat fee)
3. **Price Level** — How much per tier?

**Value Metric Validation Test**: "As customers get more value, do they naturally pay more?" → If NO, the metric is misaligned.
**Tier count rule**: Default = 3 tiers (Good/Better/Best). 4+ tiers require deliberate UX justification. Axtreo has 5 tiers — STARTER is the anchor ("Most Popular"), FREE is the printer, SCALE is the ink.

**Gap-checks** (DEEP: all 3 decisions + value metric test · MODERATE: value metric + tier assignment · LIGHT: tier assignment only)
1. **Value metric visible**: At the upgrade prompt or paywall, does the user understand *why* they hit the limit (which value metric is exhausted)?
2. **Tier assignment**: Does the feature's access control correctly map to FREE/SOLO/STARTER/GROWTH/SCALE as defined in CLAUDE.md? No inconsistency with existing gating?
3. **Freemium activation path**: If gated, is the upgrade trigger tied to genuine value delivery — not an arbitrary wall unrelated to the value the feature provides?

FAIL if value metric not visible at paywall · RISK if tier assignment inconsistent with CLAUDE.md definitions · PASS if all three pricing decisions answered.

---

#### L17.3 — Retention Signal ← churn-prevention

**Health Score formula** (0–100):
```
Health = (Login freq × 0.30) + (Feature usage × 0.25) + (Support sentiment × 0.15) + (Billing health × 0.15) + (Engagement × 0.15)
```
80–100 = Healthy (upsell) · 60–79 = Needs attention (proactive check-in) · 40–59 = At risk (campaign) · 0–39 = Critical (personal outreach)

**Risk signal timeline** (leading indicators):
- Login frequency drops 50%+ → 2–4 weeks before cancel
- Key feature usage stops → 1–3 weeks before cancel
- Billing page visits increase → days before cancel
- Data export initiated → CRITICAL (days before cancel)

**Cancel flow structure**: Trigger → Survey (1 question, ≤ 8 reasons) → Dynamic Offer (match offer to reason, not generic discount) → Confirmation → Post-Cancel (reactivation path + win-back email)
**Dunning stack**: Pre-dunning (card expiry alerts 30/15/7 days) → Smart retry (soft decline: 3–5 retries over 7–10 days; hard decline: no retry, ask for new card) → Dunning emails (Day 0 / 3 / 7 / 10) → Grace period → Hard cancel
**Discount sweet spot**: 20–30% for 2–3 months. Never 50%+ (trains cancel-and-return behavior).
**FTC Click-to-Cancel**: Cancellation must be as easy to find as the subscribe button — hidden cancel = compliance risk (US).

**Gap-checks** (DEEP: health score + cancel flow + dunning · MODERATE: cancel flow + FTC · LIGHT: FTC compliance only)
1. **FTC compliance**: Is cancel as easy to find as signup? No buried cancel in obscure settings?
2. **Cancel flow**: Is there a survey step before instant cancel? Is the save offer matched to the cancellation reason (not generic)?
3. **Dunning**: For failed payments, is soft vs hard decline distinguished? Is the Day 0/3/7/10 email sequence configured?

FAIL if cancel harder than signup or dunning not configured · RISK if save offer is generic / reason-unmatched · PASS if full flow + dunning + health score tracking.

---

#### L17.4 — Analytics Instrumentation ← analytics-tracking

**Signal Quality Index (SQI)** — 0–100 diagnostic score:
| Category | Weight |
|---|---|
| Decision Alignment (each event maps to a decision) | 25 |
| Event Model Clarity (meaningful actions, consistent naming) | 20 |
| Data Accuracy & Integrity (no double-fire, no duplication) | 20 |
| Conversion Definition Quality (real value, irreversible) | 15 |
| Attribution & Context (UTMs consistent, traffic source preserved) | 10 |
| Governance & Maintenance (documented, owned, versioned) | 10 |

Bands: 85–100 = Measurement-Ready · 70–84 = Usable with Gaps · 55–69 = Unreliable · < 55 = Broken (stop, remediate first)

**Event naming convention**: `object_action[_context]` · snake_case · no spaces · no ambiguity
- ✅ `subscription_cancelled`, `feature_activated`, `onboarding_step_completed`, `upgrade_clicked`
- ❌ `click`, `event`, `action`, `trackButtonPress`

**Conversion rules**: Must represent real value + completed intent + irreversible progress. Page views, button clicks, and form starts are NOT conversions.

**Gap-checks** (DEEP: SQI score + name all events + conversions defined · MODERATE: event taxonomy + funnel events · LIGHT: key funnel events defined?)
1. **Event taxonomy**: Are the key events for this feature named in `object_action` format? Does each map to a specific business decision?
2. **Funnel completeness**: Are start AND completion events defined for each user journey step? No gap between step_viewed and step_completed?
3. **NSM impact**: Which North Star Metric (MRR growth, activated accounts, reconciled close months) does this feature move? Is its contribution measurable from event data?

FAIL if 0 events defined or events named inconsistently · RISK if conversion not defined or NSM unmeasurable · PASS if SQI ≥ 70 and NSM impact traceable.

---

#### L17.5 — Launch Readiness ← launch-strategy

**ORB Framework**: Owned (email, blog, community) → Rented (Twitter, LinkedIn, App Store) → Borrowed (podcasts, influencers, guest content)
- Rented channels give speed; owned channels compound. Every rented touchpoint should drive to an owned channel.

**5-Phase launch** (pick the right entry phase):
- Internal: friendly users only, not production-ready needed
- Alpha: landing page + waitlist + external testing
- Beta: early access list, teasers, buzz-building
- Early Access: controlled expansion, usage data, PMF survey
- Full Launch: open signups, Product Hunt, blog post, social campaign

**Full launch touchpoints** (for major features): customer email · in-app popup / "New" nav badge · website banner · blog post · social posts · Product Hunt (if warranted)
**Update tier**: Major (full multi-channel campaign) / Medium (email + in-app banner) / Minor (changelog entry only)
**Post-launch**: onboarding email sequence active · comparison pages updated · interactive demo created (e.g., Navattic)

**Gap-checks** (DEEP: all 5 touchpoints planned · MODERATE: email + in-app + changelog · LIGHT: changelog entry exists?)
1. **Changelog entry**: Is a changelog entry drafted? (Every shipped feature needs one — even minor)
2. **In-app guidance**: For workflow-changing features, is an onboarding email or in-app tooltip/tour sequence planned?
3. **Comparison page**: Does this feature create a new competitive differentiator vs Campfire / Rillet / Xero? If yes, is the comparison page updated?
4. **Product Hunt candidacy**: Is this major enough for Product Hunt? If yes, are gallery assets (screenshots, demo GIF, short demo video) prepared?
5. **Feedback loop**: Is there a mechanism to collect qualitative + quantitative feedback within 2 weeks of ship?

FAIL if no changelog entry planned · RISK if workflow-changing feature ships with no in-app guidance · PASS if ORB channel plan defined.

---

#### L17.6 — Unit Economics ← startup-metrics-framework + Axtreo context

**Core formulas**:
- LTV = ARPU / Monthly churn rate (or ARPU × gross margin % / monthly churn)
- CAC payback = CAC / (ARPU × gross margin %)
- Gross margin per tier = Tier revenue − (infra + AI credit cost + support) per active customer
- Gemini 2.0 Flash pricing (reference): ~$0.075/1M input tokens · ~$0.30/1M output tokens

**Axtreo credit cost check**: If this feature consumes Arc AI credits, the estimated per-credit AI cost must remain < 10% of that tier's monthly revenue. (e.g., SOLO at $29/mo: per-credit AI cost cap ≈ $0.145 per credit event)
**LTD customers**: infrastructure fee applies after 24 months — new features must not increase per-customer infra cost materially.

**Gap-checks** (DEEP: gross margin + AI cost + LTV impact · MODERATE: AI cost + tier margin · LIGHT: AI cost check only)
1. **AI cost model**: If this feature invokes Gemini/Arc, what is the estimated token count per invocation? Does cost-per-use fit within the credit model without destroying margin?
2. **Gross margin per tier**: Does this feature's infra cost increase (new DB writes, new async jobs, new storage) stay within acceptable margin for the tiers it's available on?
3. **LTV impact**: Does this feature's activation or retention effect improve LTV? Is that improvement measurable from Analytics Instr events?

FAIL if AI per-use cost > 10% of monthly tier revenue · RISK if gross margin impact not modeled · PASS if cost model validated.

---

#### L18.1 — Prisma Safety ← prisma-expert

**Schema quality rules** (non-negotiable):
- All models: `@id` + `@default(cuid())` · `createdAt @default(now())` · `updatedAt @updatedAt`
- All relations: explicit `@relation(fields: [...], references: [...], onDelete: ..., onUpdate: ...)`
- All frequently-queried fields: `@@index` · All tables: `@@map("snake_case_table_name")`
- Financial models: `deletedAt DateTime?` (soft delete) · AuditEvent: NO deletedAt (append-only forever)
- Enums for fixed value sets — never bare string literals for status fields

**Migration safety** (production rules):
- NEVER `prisma migrate dev` in production — always `prisma migrate deploy`
- Backward-compatible DDL: add column as nullable first → backfill → add NOT NULL in separate migration
- No column renames without data migration (rename = drop + add in SQL)

**N+1 anti-patterns**:
- NEVER: `findMany()` followed by `findMany()` in a loop
- DO: `include: { relation: true }` for required nested data
- BETTER: `select: { id, field, relation: { select: { id, title } } }` (fetch only needed fields)
- BEST for aggregations: push to compute table in background, query result only at read time

**Gap-checks** (DEEP: all 5 · MODERATE: N+1 + cascade + migration safety · LIGHT: migration safety only)
1. **Cascade behavior**: Is `onDelete` defined for all `@relation` fields? (Missing = silent data integrity issue on delete)
2. **Index coverage**: Are `@@index` entries defined for all fields used in WHERE clauses in this feature's queries?
3. **N+1 risk**: Does any service function call Prisma inside a loop? (FAIL if yes — use include/select instead)
4. **Migration safety**: Is the migration backward-compatible? No destructive column renames? Nullable before NOT NULL?
5. **Interactive transactions**: Are multi-model writes that must succeed together wrapped in `prisma.$transaction(async (tx) => { ... })`?

FAIL if migration not backward-compatible or N+1 query in a loop detected · RISK if cascade not defined or indexes missing · PASS if all 5 checks pass.

---

#### L18.2 — Query Performance ← database-optimizer + Axtreo architecture

**Axtreo non-negotiable rules**:
- Dashboard and report queries MUST read from compute tables (ReconciliationRun, RevenueBridgeRun, RecognitionRun) — NEVER from raw CashLedgerFact or MrrSnapshot directly
- `fiscal_month` computed ONCE on write from `entity.fiscal_timezone` — never re-derived at query time
- Pagination on ALL list endpoints where result set can grow beyond 50 rows (cursor-based, not offset)

**Indexing strategy**:
- Composite indexes: most selective column first. `(account_id, fiscal_month)` outperforms `(fiscal_month, account_id)` for per-account queries.
- Partial indexes for filtered queries: `WHERE deletedAt IS NULL` → add `@@index` condition
- GIN indexes for JSONB queries: `@@index([metadata], type: Gin)`
- Before shipping any new query touching > 10K rows: run mental EXPLAIN ANALYZE (seq scan = index needed)

**Aggregation rule**: GROUP BY / SUM / COUNT across large tables → push to a background compute job, store result, query the result. Never aggregate at request time.

**Gap-checks** (DEEP: all 4 · MODERATE: compute layer + pagination · LIGHT: compute layer only)
1. **Compute layer**: Does this query read from compute tables rather than raw ledger facts? (FAIL if raw facts queried in a user-facing path)
2. **Index coverage**: Are partial/composite indexes defined for this query's WHERE + ORDER BY columns? Would EXPLAIN ANALYZE show a seq scan?
3. **Pagination**: Is cursor-based pagination implemented for any collection growing > 50 rows?
4. **Aggregation cost**: If this query does GROUP BY or SUM across large tables, is it pushed to a background job rather than computed on-demand per request?

FAIL if raw fact table queried in user-facing path · RISK if seq scan likely or large aggregation on-demand · PASS if all 4 checks pass.

---

#### L20.1 — WCAG Accessibility ← accessibility-compliance + warm cream palette

**WCAG 2.1 AA requirements**:
- Keyboard: ALL interactive elements reachable by Tab + activatable by Enter/Space · Escape closes modals
- Colour contrast: 4.5:1 for normal text · 3:1 for large text (≥ 18px regular or ≥ 14px bold)
- Axtreo warm cream checks: `text-[#1C1210]` on `#FAF8F3` = 16.5:1 ✅ · coral `#E85820` on cream = ~3.7:1 ⚠️ (RISK for body text, OK for large/bold text) · stone-400 (`#a8a29e`) on cream = ~2.1:1 ❌ (FAIL for body text — use stone-600+ for readable muted text)
- ARIA: icon-only buttons → `aria-label` · form inputs → `<label>` or `aria-labelledby` · dynamic content → `aria-live="polite"` or `role="alert"` for errors
- Semantic HTML: `<button>` not `<div onClick>` · `<nav>`, `<main>`, `<header>` landmarks · `<h1>–<h6>` hierarchy (no skipping levels)
- Focus indicators: never `outline: none` without a visible replacement (e.g., custom ring style)

**Gap-checks** (DEEP: all 5 · MODERATE: keyboard + contrast + ARIA labels · LIGHT: keyboard nav only)
1. **Keyboard navigation**: Can a keyboard-only user complete all primary actions? (Tab through all interactive elements, Enter/Space to activate, Escape to close modals)
2. **Colour contrast on warm cream**: Does any text colour fail 4.5:1 against #FAF8F3? (Especially coral #E85820 at small body text sizes — check with a contrast tool)
3. **ARIA labels**: Do all icon-only buttons have `aria-label`? Do all form inputs have an associated `<label>` or `aria-labelledby`?
4. **Live regions**: Are error messages, success notifications, and loading state changes announced to screen readers via `aria-live="polite"` or `role="alert"`?
5. **Semantic HTML**: Are any `<div>` or `<span>` elements acting as interactive controls instead of semantic `<button>`, `<a>`, `<input>`?

FAIL if keyboard nav broken or contrast < 4.5:1 on critical text · RISK if ARIA labels missing on icon buttons or live regions absent · PASS if all 5 checks pass.

---

#### L20.2 — Developer Experience ← dx-optimizer

**DX targets**:
- Clone-to-running: < 5 minutes on a fresh machine
- npm scripts required: `dev` · `build` · `test` · `lint` · `typecheck` (all present, all working)
- `.env.example`: every env var listed with a one-line comment explaining what it is and where to get it
- Pre-commit hook: lint + `tsc --noEmit` runs automatically on staged files (husky or simple-git-hooks)
- README: setup section accurate after any infra change

**Gap-checks** (DEEP: all 4 · MODERATE: .env.example + npm scripts · LIGHT: .env.example only)
1. **Environment variables**: Are all new env vars added to `.env.example` with a descriptive comment?
2. **npm scripts**: Does this change require a new script? If yes, is it added with a descriptive name that follows existing conventions?
3. **Clone-to-run impact**: Does this feature add a new required external service, OAuth credential, or local dependency that increases setup time?
4. **Documentation**: Does this infra change require a README or CLAUDE.md update? Are setup instructions accurate after this change?

FAIL if new env var not in `.env.example` · RISK if clone-to-run time increases significantly · PASS if all 4 checks pass.

---

#### L2.5 — AI/ML ← ai-engineering-toolkit

**Prompt evaluation** (8-dimension scoring, 1–10 each → 0–100 weighted total):
Clarity · Specificity · Completeness · Conciseness · Structure · Grounding · Safety · Robustness
- Team baseline target: ≥ 70/100 before production deployment

**Context budget** (5 zones — output zone must have ≥ 15% of token budget):
System prompt · Few-shot examples · User input · Retrieval (RAG) · Output reservation

**RAG pipeline decision tree**:
- Chunking: fixed-size (simple) → semantic (better) → recursive (complex docs)
- Retrieval: vector-only (semantic) / keyword (BM25) / hybrid (both) → hybrid recommended for finance queries
- Evaluation metrics: Faithfulness (answer grounded in context?) · Relevancy (retrieved chunk relevant?) · Context Precision (are top-k chunks the right ones?)

**Axtreo AI rules** (non-negotiable):
- Arc AI isolated from write path — AI reads from compute tables, never writes financial state directly
- System prompt must prohibit number invention: "If you cannot compute this from provided data, say so — do not estimate"
- Cost tracked per account: credit deducted before AI call, refunded if call fails
- Fallback defined: if Gemini call fails > 3× or times out, surface graceful degradation to user (not a silent hang)
- max_tokens set on every call — no unbounded generation

**Gap-checks** (DEEP: all 5 · MODERATE: top 3 · LIGHT: write path isolation only)
1. **Write path isolation**: Is AI output consumed as read-only data? No AI path writes to financial tables directly?
2. **System prompt safety**: Does the system prompt explicitly prohibit number invention for financial data?
3. **Cost tracking**: Is credit deducted per account before the AI call? Is cost tracked to the account for reporting?
4. **Fallback defined**: Is there a graceful degradation path if the AI call fails or times out?
5. **Token budget**: Is `max_tokens` set? Is the context zone allocation checked (output zone ≥ 15%)?

FAIL if AI output writes directly to financial tables or write path not isolated · RISK if no fallback or number-invention guardrail absent · PASS if all 5 checks pass.

---

#### L3.1 — Cybersecurity ← security-audit

**Security Risk Index (SRI)**
```
SRI = (accountId Isolation + Input Validation + Output Safety + Auth Enforcement + Injection Prevention) / 5
```
Each dimension 1–5. Range 1–5.
- 4–5: Secure — proceed · 3: Moderate — review before merge · 2: High — security review required · 1: Critical — do not ship

**Axtreo non-negotiable rules**
- `accountId` from `req.user.accountId` (session) ONLY — never `req.body`, `req.query`, or `req.headers`
- All external input (body, query, webhook payload) validated with Zod at route boundary before service layer
- No `console.log` containing tokens, monetary amounts, OTP values, or email addresses
- HMAC-signed webhook payloads: verify signature before processing (STRIPE_WEBHOOK_SECRET, AUDIT_HMAC_SECRET)
- RATE_LIMIT_KV for all auth + billing endpoints; rate limit separately from general CRUD

**Gap-checks** (DEEP: all 5 · MODERATE: top 3 · LIGHT: accountId isolation only)
1. **accountId isolation**: Is `accountId` exclusively from session (`req.user.accountId`)? Any path where it could come from `req.body` or query params?
2. **Input validation**: Is all external input validated with Zod before reaching service logic? No raw `req.body` passed to Prisma or downstream services?
3. **Sensitive data in logs**: Do any log lines contain tokens, OTP values, monetary amounts, session IDs, or raw email addresses?
4. **Auth enforcement**: Is every route behind session middleware? Is there any code path that reaches business logic without a valid session check?
5. **Injection prevention**: Are all DB queries via Prisma parameterized (no template literal SQL)? Are user-generated strings escaped before appearing in any response field?

FAIL if accountId sourced from req.body or any auth bypass path exists · RISK if Zod missing on external input or sensitive data in logs · PASS if SRI ≥ 4 and all 5 checks pass.

---

#### L3.2 — Data Privacy ← security-audit

**Axtreo PII classification**
- **High PII** (never plain in logs, never in error responses): email, full name, IP address, session token, OTP value
- **Medium PII** (OK in context, not in error bodies): company name, plan tier, userId
- **Financial data** (OK in append-only AuditEvent, never in error responses): amounts, transaction IDs

**Retention rules (GDPR-aligned)**
- Session tokens: 35-min sliding window → auto-expire (DB + cookie)
- EmailOtpToken: 10-min TTL → hard delete on use or expiry
- MagicLinkToken: 24-hr TTL → hard delete on use or expiry
- IP addresses in rate-limit KV: TTL = lockout window — never indefinite (GDPR Article 5(1)(e))
- Account deletion: deletedAt → 30-day grace → hard wipe of PII fields (GDPR right to erasure)

**Gap-checks** (DEEP: all 4 · MODERATE: PII in logs + retention · LIGHT: PII in logs only)
1. **PII in logs**: Does any log line in this feature's path contain email, raw IP, session token, or OTP value in plain text?
2. **Retention policy**: Do new PII-bearing fields have a documented TTL or `deletedAt` sweep? No "collect now, figure out later" fields?
3. **Minimum collection**: Is this feature collecting only the PII it strictly needs for its function?
4. **Right to erasure**: If a user triggers account deletion, does this feature's data get wiped by the existing `deletedAt` + cleanup sweep?

FAIL if high PII in logs plain text · RISK if no TTL on ephemeral PII or retention not documented · PASS if all 4 checks pass.

---

#### L3.3 — Cryptography ← security-audit

**Axtreo crypto standards (non-negotiable)**
- OTP/magic link stored: bcrypt hash or SHA-256 — never plain text in DB
- Session token stored: SHA-256 hash as `tokenHash` in `Session` table — raw token only in httpOnly cookie
- Field-level encryption: AES-256-GCM + `FIELD_ENCRYPTION_KEY` (Worker secret) — never AES-CBC (no authentication tag)
- HMAC signing: SHA-256 + secret key (AUDIT_HMAC_SECRET, POW_HMAC_SECRET, OAUTH_STATE_SECRET)
- Google JWT verification: `jose` library + Google JWKS endpoint — no local JWT signing for Google tokens
- Nonces: unique per AES-GCM operation — `crypto.getRandomValues(new Uint8Array(12))` — never reuse

**Banned algorithms** (FAIL immediately if found): MD5 · SHA-1 · AES-CBC · plain text token storage

**Gap-checks** (DEEP: all 4 · MODERATE: token storage + algorithm check · LIGHT: token storage only)
1. **Token storage**: Are all auth tokens (OTP, magic link, session) stored as irreversible hashes (bcrypt or SHA-256)? Zero plain-text tokens in DB?
2. **Algorithm compliance**: Is AES-256-GCM used for field encryption? Any MD5, SHA-1, or AES-CBC in this code path?
3. **HMAC integrity**: Are webhook payloads and audit entries signed with HMAC-SHA256? Is the signature verified before any processing?
4. **Nonce uniqueness**: For AES-GCM operations, is a fresh nonce generated per encryption call with `crypto.getRandomValues`?

FAIL if tokens stored plain text or MD5/SHA-1/AES-CBC used · RISK if HMAC not verified on inbound webhooks or nonces reused · PASS if all 4 checks pass.

---

#### L3.5 — Zero-Trust ← security-audit

**Axtreo Zero-Trust principles**
- Every service-layer call carries `accountId` from session — internal calls are NOT exempt from authorization
- Least privilege: `SELECT` only the fields needed — no `SELECT *` in service layer
- No implicit trust between services ("called from internal service" is not sufficient authorization)
- Every write to financial data produces an `AuditEvent` (append-only, before_json + after_json — no modification ever)
- Failed authorization ALWAYS returns 401/403 — never 200 with empty payload (empty = information leak)

**Scoping hierarchy** (from `project_data_hierarchy.md`):
- Workspace queries: `WHERE account_id = req.user.accountId`
- Entity queries (financial models): `WHERE account_id = ... AND entity_id = ...` (BOTH required)
- Support access: time-limited via `SupportAccessGrant`, logged in `OperatorAuditEvent`

**Gap-checks** (DEEP: all 4 · MODERATE: cross-tenant + AuditEvent · LIGHT: cross-tenant isolation only)
1. **Cross-tenant isolation**: Does every DB query in this feature include `WHERE account_id = req.user.accountId`? Any path that could return another account's data?
2. **Entity scoping**: If this feature touches entity-level financial data (CashLedgerFact, MrrSnapshot, etc.), does it filter by BOTH `accountId` AND `entityId`?
3. **Least privilege query**: Does the service layer `SELECT` only needed fields? No Prisma `findMany()` returning entire model when only 2 fields are used?
4. **AuditEvent coverage**: Does every state-changing operation write an `AuditEvent` with `before_json` + `after_json`? No silent mutations?

FAIL if cross-tenant data leak possible (missing accountId filter) · RISK if entity-scoped data missing entityId filter or AuditEvent absent on writes · PASS if all 4 checks pass.

---

### Lens Reference Library

The table below shows which lenses the Meta-Orchestrator should consider when scoring features in each domain. These are **starting-point signals for Step 2 of Phase 0** — not a binding activation rule. The Activation Plan produced in Phase 0 governs what actually runs.

| Domain | Additional lenses to activate |
|--------|-------------------------------|
| METRICS | L1.3 CFA (SaaS metric definitions — NRR, CAC payback, Rule of 40 formulas peer-comparable?) · L1.4 FP&A (3-statement integrity — P&L + BS + CF balance after every transaction?) · L1.8 Actuary (tail risk — what happens when customer has no history?) · L4.1 Product (CFO demo value — would a CFO demo this in 30 days?) · L17.4 Analytics Instr (NSM impact, funnel events defined?) · L18.2 Query Performance (MrrSnapshot query pattern — partial index on account_id + fiscal_month? Aggregations pushed to compute tables?) · L17.6 Unit Economics (marginal infra cost per additional active customer for this metric path?) |
| RECON | L1.5 Auditor (SHA-256 chain, drillable to source transaction?) · L2.2 Scalability (P99 < 30s for <500 txns; async >500?) · L2.5 AI/ML (confidence score on every match, fallback defined, rate limiting?) |
| RECOG | L1.3 CFA (RPO waterfall, metric peer-comparable?) · L1.4 FP&A (deferred revenue BS entry + P&L recognition + CF cash receipt all wired?) · L1.6 Tax (jurisdiction-specific treatment, accrual-only basis enforced?) · L6.1 Regulatory (ASC 606 5-step / IFRS 15 per entity flag?) |
| CLOSE | L1.5 Auditor (independent SHA-256 verification without Axtreo login?) · L1.4 FP&A (balance sheet balanced after close?) · L6.1 Regulatory (SOX-compatible append-only AuditEvent?) |
| TAX | L1.6 Tax Professional (jurisdiction rates with effective dates, exempt + reverse-charge handled?) · L6.1 Regulatory (GAAP/IFRS accrual basis maintained, tax line traceable?) · L6.2 Multi-Jurisdiction (entity-level filing, each entity files separately?) → **activate country lenses** |
| AI | L2.5 AI/ML (correct model haiku/sonnet, max_tokens set, fallback defined, system prompt prohibits number invention, Arc AI isolated from write path, cost tracked per account?) · L4.1 Product (10x UX — fewer steps than manual?) |
| INTEGRATION | L13.1 Integration Partner (API partner terms compliance, rate limits, retry strategy, OAuth ToS?) · L8.1 DevOps (timeout defined, dead letter queue, failure alert?) · L12.1 SLI/SLO (SLIs defined for sync latency and webhook delivery? SLO burn-rate alert wired?) · L15.2 API Contract (REST naming, pagination, requestId logging, per-endpoint rate limits defined?) · L18.2 Query Performance (composite indexes on sync tables? N+1 risk on event hydration?) |
| REPORTING | L1.1 CFO (output explainable to investor without tutorial, source traceable, computedAt shown?) · L1.3 CFA (metrics peer-comparable to ChartMogul / investor expectations?) · L7.4 Investor/Board (moat protection, Beacon investor portal, Series A narrative?) · L18.2 Query Performance (report queries use compute tables not raw facts? Pagination on large exports?) · L16.2 Core Web Vitals (report page LCP — does it defer heavy chart render via lazy load?) |
| AUTH | L3.2 Data Privacy (PII stored only where required, retention policy defined, deleted_at?) · L3.3 Cryptography (bcrypt for secrets, SHA-256 for session tokens, AES-256-GCM for sensitive fields?) · L3.5 Zero-Trust (every internal call carries account_id from session, least privilege?) · L15.1 Backend Feasibility (BFRI score — auth logic complexity, session state data risk, testability of OTP/passkey paths?) · L18.1 Prisma Safety (EmailOtpToken/Session schema cascade behaviour, indexes on tokenHash/expiresAt?) · L20.1 Accessibility (WCAG 2.1 AA on login form — keyboard nav, visible labels, live regions for error states?) |
| PAYROLL | L1.6 Tax Professional (jurisdiction-specific payroll rates, filing deadlines?) · L6.2 Multi-Jurisdiction (each entity files separately, payroll per entity not per account?) → **activate country lenses** |
| MULTI_ENTITY | L1.4 FP&A (intercompany eliminations zero out at consolidated level, CTA to OCI not P&L?) · L1.6 Tax (functional currency per entity, FX gain/loss to correct CoA?) · L6.2 Multi-Jurisdiction Tax · L6.3 Data Sovereignty (EU data cannot leave EU without consent?) → **activate relevant country lenses** |
| INFRA | L2.1 System Design (single-responsibility, no circular deps, reads from compute not raw facts?) · L2.2 Scalability (indexes for all query patterns, bulk ops in DB not TS loops?) · L8.1 DevOps (new cron: schedule + failure behaviour documented, new env vars: documented?) · L8.2 Observability (healthy / degraded / broken states defined for this domain?) · L12.1 SLI/SLO (SLIs defined for this infrastructure path? SLO burn-rate alert wired?) · L20.2 Dev Experience (npm scripts, .env.example, clone-to-run impact of this infra change?) |
| FREELANCER | L1.3 CFA (SE tax = 15.3% on net earnings — is it auto-calculated from Stripe net after platform fees?) · L1.6 Tax (quarterly estimated tax deadlines: Apr 15, Jun 15, Sept 15, Jan 15 — does the feature trigger the correct estimate and surfacing?) · L4.1 Product (Marcus demo check — does a solo SaaS founder see their take-home after taxes within 30 seconds of connecting Stripe?) |
| ONBOARDING | L16.1 Frontend Complexity (Suspense boundaries, lazy loading, cross-feature coupling?) · L16.2 Core Web Vitals (LCP on onboarding pages, CLS on step transitions, INP on form interactions?) · L17.1 Behavioral Psych (anchoring at plan selection step, loss aversion on trial expiry, choice reduction on primary CTA?) · L17.2 Pricing Coherence (tier assignment logic, freemium activation path, value metric visible during setup?) · L17.3 Retention Signal (activation metric defined, paywall placement, first-value moment instrumented?) · L17.4 Analytics Instr (onboarding funnel events: step_viewed / step_completed / activation_achieved defined?) · L17.5 Launch Readiness (onboarding email sequence, in-app tooltip/tour plan?) · L20.1 Accessibility (keyboard nav on multi-step form, ARIA progress indicators, visible labels?) |
| BILLING | L17.1 Behavioral Psych (upgrade trigger placement, loss-aversion framing on limit-hit, cancel intercept?) · L17.2 Pricing Coherence (value metric visible at upgrade prompt, tier benefits clear, annual discount anchored?) · L17.3 Retention Signal (dunning path defined, cancellation intercept flow, win-back email trigger?) · L17.4 Analytics Instr (upgrade_clicked / plan_changed / cancel_initiated / payment_failed events?) · L17.5 Launch Readiness (pricing page updated, changelog entry, tier comparison updated?) · L17.6 Unit Economics (gross margin per tier, AI credit cost vs monetization event, CAC/LTV impact?) |
| DASHBOARD | L16.1 Frontend Complexity (chart lazy-loading, Suspense boundaries, bundle split for heavy viz libs?) · L16.2 Core Web Vitals (LCP on dashboard — deferred chart render? CLS from async data load? INP on filter interactions?) · L17.4 Analytics Instr (dashboard_viewed, widget_interacted, export_triggered — NSM impact tracked?) · L18.2 Query Performance (dashboard reads from compute tables not raw facts? Pagination, indexes, aggregation cost?) · L20.1 Accessibility (chart colour contrast on warm cream #FAF8F3, keyboard nav on filters, ARIA live regions for data updates?) |

---

## Phase 2 — Country Lens Routing (no web)

**Skip entirely if the Activation Plan says `COUNTRY ROUTING: SKIP`. Run only the country codes the Activation Plan listed.**

Identify target countries from the Activation Plan's country routing decision (which drew from explicit mentions or inferred personas — Sophie = France C11a, Priya = US C1 + UK C10 + Singapore C6).

| Code | Country | Trigger keywords |
|------|---------|------------------|
| C1 | United States | US, USD, GAAP, ASC 606, IRS, FICA, nexus, California, NexusHealth US |
| C2 | Australia | AU, AUD, ATO, GST 10%, BAS, Superannuation, Basiq, Sydney |
| C3 | New Zealand | NZ, NZD, IRD, GST 15%, KiwiSaver |
| C4 | UAE | UAE, AED, FTA, VAT 5%, GPSSA, EOSG, Fatoora, Dubai |
| C5 | Saudi Arabia | KSA, SAR, ZATCA, VAT 15%, GOSI, ESB, Riyadh |
| C6 | Singapore | SG, SGD, IRAS, GST 9%, CPF, InvoiceNow, ACRA |
| C7 | Thailand | Thailand, THB, Revenue Department, VAT 7%, SSF, Bangkok |
| C8 | Indonesia | Indonesia, IDR, DJP, PPN 12%, Coretax, BPJS, Bali |
| C9 | China | China, PRC, CNY, STA, e-fapiao, Golden Tax, data localisation |
| C10 | United Kingdom | UK, GBP, HMRC, VAT 20%, MTD, NIC, RTI, NexusHealth UK |
| C11a | France | France, EUR, TVA 20%, DGFiP, DSN, Factur-X, Sophie, Lumiere |
| C11b | Germany | Germany, EUR, MwSt 19%, Finanzamt, ZUGFeRD, ELSTER |
| C11c | Netherlands | Netherlands, EUR, BTW 21%, Belastingdienst, Amsterdam |
| C11d | Ireland | Ireland, EUR, VAT 23%, Revenue Commissioners, 12.5% CT |
| C12 | Canada | Canada, CAD, CRA, GST/HST, CPP, EI, Ontario, Quebec |

For each activated country, check all 9 lens points:
- L-C.1 Accounting standard: compatible with correct standard (ASC 606/US GAAP for C1; IFRS 15 for C2/C3/C4/C5/C6/C10/C11/C12; CAS 14 for C9)?
- L-C.2 Revenue recognition: correct 5-step model applied per entity's `accounting_standard`? (IFRS 15 = stricter contract cost capitalisation than ASC 606)
- L-C.3 Tax type + rate: correct tax system and rate applied? (GST 10%/AU, 15%/NZ, 9%/SG; VAT 5%/UAE, 15%/KSA, 20%/UK+FR, 19%/DE, 21%/NL, 23%/IE; PPN 12%/ID; TVA/MwSt/BTW are VAT equivalents; US has no national VAT)
- L-C.4 Tax registration threshold: does this feature need to flag proximity to threshold? (AU A$75K, NZ NZ$60K, SG S$1M, UAE/KSA AED/SAR 375K, UK £90K, FR €36.8K/services, CA CAD$30K, EU OSS €10K B2C)
- L-C.5 Filing frequency + deadlines: does this feature need to generate or trigger correct filing cadence? (AU BAS quarterly, NZ bi-monthly, SG quarterly, UK quarterly MTD, CA annual/quarterly/monthly by size)
- L-C.6 E-invoicing: does this feature trigger an e-invoicing compliance requirement?
- L-C.7 Currency + FX: correct functional currency per entity? FX gain/loss posted to correct CoA? (AED pegged to USD 3.6725; SAR pegged to USD 3.75; IDR large integers — no cents; CRA requires Bank of Canada rates for CAD FX)
- L-C.8 Payroll: correct payroll system applied? (AU PAYG+SG 11.5%; NZ PAYE+KiwiSaver 3%; SG CPF 17%+20%; UK PAYE+NIC 15%; FR URSSAF ~28–40%; DE social ~20%; CA CPP 5.95%+EI; ID BPJS multi-component)
- L-C.9 Axtreo-specific: are all implementation requirements from the country checklist addressed?

Key e-invoicing deadlines to flag:
- **MANDATORY NOW**: Indonesia Coretax (real-time validation) · Saudi ZATCA Phase 2 (real-time clearance B2B) · Germany ZUGFeRD receiving (LIVE Jan 2025; all B2B must accept structured invoice)
- **Belgium**: B2B e-invoicing LIVE Jan 2026 (PEPPOL BIS Billing 3.0)
- **Poland**: KSeF national platform LIVE Feb 2026
- **UAE Fatoora Phase 2**: July 2026 (real-time clearance B2B)
- **Singapore InvoiceNow**: April 2026 (all new GST registrants)
- **France Factur-X**: Sept 1 2026 (large + mid enterprises); Sept 1 2027 (SMEs) — EN 16931 hybrid PDF/XML
- **Germany ZUGFeRD issuing**: Large enterprises Jan 2027; all B2B Jan 2028
- **Netherlands**: PEPPOL mandate planned 2027
- **EU intra-community**: Cross-border digital reporting requirements July 1 2030
- **EU harmonisation**: Single VAT Registration + Platform Economy rules Jan 2035

EU framework:
- **ViDA (VAT in the Digital Age)**: Entered force April 14 2025. Three pillars: (1) Digital Reporting Requirements (DRR) for real-time transaction data; (2) Platform Economy — marketplaces become deemed suppliers for VAT; (3) Single VAT Registration — extend OSS to all cross-border B2C. Enables per-country e-invoice mandates without EC approval.
- **EN 16931**: EU e-invoice semantic standard. Factur-X (FR) and ZUGFeRD (DE) are both EN 16931 compliant. PEPPOL is the transmission network (not the format).
- **EU OSS (One Stop Shop)**: €10,000/year threshold across ALL EU countries for B2C digital services. Below threshold: charge home-country VAT. Above: charge destination-country VAT and file via OSS. Non-EU businesses register once in any EU member state for all EU VAT.
- **EU reverse charge (B2B cross-border)**: Non-EU seller to EU VAT-registered buyer → zero VAT charged; buyer self-accounts. Seller must validate buyer's EU VAT ID via VIES before applying reverse charge.

7 country architectural gaps (must check if feature touches these):
1. **UK MTD (Making Tax Digital)**: Requires direct HMRC API submission, not manual filing — need MTD-compatible software bridge
2. **France Factur-X**: Sept 2026 — need PDF/A-3 + EN 16931 XML embedding; affects all B2B invoices from Sophie/Lumiere
3. **Germany ZUGFeRD receiving**: LIVE since Jan 2025 — Axtreo must parse incoming ZUGFeRD XML from supplier invoices
4. **Canada province rates**: 13 GST/HST/PST/QST rate variants across 10 provinces + 3 territories — single "CA tax rate" field is wrong
5. **Quebec dual registration**: Both CRA (GST/HST) AND Revenu Québec (QST) — two separate filings, two tax IDs, different rates (5% + 9.975%)
6. **EU OSS threshold flagging**: Must detect when cumulative EU B2C revenue crosses €10,000 and trigger rate-switching + OSS registration alert
7. **Ireland CT classification**: 12.5% CT applies to trading income; 25% applies to passive/non-trading income — revenue line classification determines which rate applies

---

## Phase 3 — 10x Deep Research (web)

**Run only the research lenses that scored DEEP, MODERATE, or LIGHT in the Activation Plan's RESEARCH PLAN section.** Skip lenses the Activation Plan marked SKIP — do not run them. For activated lenses, search at the depth the Activation Plan prescribed: DEEP = no caps, research until confident; MODERATE = 3–5 searches; LIGHT = 1–2 searches.

### Lens 1 — Market Frontier Scan

What is the most advanced live implementation of this feature anywhere in the world?

Domain search templates (run the relevant ones, add more as needed):
```
METRICS:      "SaaS NRR MRR cohort predictive churn AI 2026"
              "ChartMogul Baremetrics Maxio advanced features 2025 2026"
RECON:        "bank reconciliation AI autonomous exception resolution 2026"
              "HighRadius R2R reconciliation platform features 2026"
RECOG:        "ASC 606 IFRS 15 AI contract revenue recognition automation 2026"
              "Zuora Revenue Maxio LeapFin revenue recognition features"
CLOSE:        "continuous close month-end automation BlackLine FloQast 2026"
              "autonomous financial close AI Xero JAX 2026"
TAX:          "tax compliance automation SaaS AI 2026 VAT GST"
              "Avalara Anrok advanced tax features comparison"
AI:           "agentic finance AI autonomous 2026 Xero JAX"
              "AI financial agent continuous close 2026"
INTEGRATION:  "ISO 20022 financial data integration 2026"
              "Stripe Plaid Basiq financial API advanced features"
REPORTING:    "SaaS investor metrics portal advanced 2026"
              "Mosaic Jirav Pigment Causal reporting features comparison"
MULTI_ENTITY: "multi-entity accounting consolidation AI 2026"
              "NetSuite Sage Intacct multi-entity advanced features"
```

Extract: Features live at enterprise ($100K+/year) that our ICP ($0–$50M ARR) cannot yet access.

### Lens 2 — Competitor Gap Map

What have competitors shipped, and what have ALL of them missed?

Domain → competitor mapping:
```
METRICS:      ChartMogul, Baremetrics, Maxio, Recurly
RECON:        HighRadius, Synder, FloQast, Numeric, Leapfin
RECOG:        Zuora Revenue, Maxio, LeapFin, Chargebee
CLOSE:        FloQast, BlackLine, Trintech, Numeric
TAX:          Avalara, TaxJar, Anrok, Stripe Tax
AI:           Basis, Trullion, Docyt, Xero AI
INTEGRATION:  QuickBooks, Xero, NetSuite, Sage Intacct
REPORTING:    Mosaic, Jirav, Pigment, Causal
MULTI_ENTITY: NetSuite, Sage Intacct, Xledger, Consolidate.io
```

Search: "[Competitor 1] [Competitor 2] [feature domain] features comparison 2025 2026"

Find: The consistent absence — what does nobody do? Does Axtreo's architecture (CustomerIdentityMap, SHA-256 chain, FRESH/STALE/COMPUTING, bitemporal DeltaEvent) enable something they cannot build?

Known consistent gaps across all competitors (do not repeat research on these — they're confirmed):
- No cross-provider identity resolution (they assume one source of truth)
- No bitemporal audit trail (only one time dimension)
- No confidence-scored reconciliation (binary match/no-match only)
- No pre-computed anomaly explanations (they detect, don't explain)
- No fiscal-timezone-aware partitioning (UTC edge cases)

### Lens 3 — Regulation Accelerator

What compliance requirement is coming that competitors haven't implemented yet?

Search: "[regulation name] [domain] compliance automation software 2026"

Active regulatory signals (check these against the feature domain):

| Regulation | Domain | Status | Opportunity |
|-----------|--------|--------|-------------|
| ISO 20022 | RECON, INTEGRATION | Banks migrating now | Ship native XML ingestion before others |
| FASB ASU 2023-07 | REPORTING | Active | Auto-draft segment disclosure from entity data |
| FASB AI Disclosure 2026 | AI | Active | Auto-generate from AuditEvent — zero manual work |
| ASC 842 Lease Accounting | CLOSE, RECOG | Still catching SMEs | Right-of-use asset automation |
| ViDA (EU e-invoicing) | TAX | France Sept 2026, Germany 2027–2028 | Ship Factur-X first — Sophie/Lumiere in scope |
| UK MTD Phase 2 (ITSA) | TAX, AUTH | April 2026 live | HMRC direct API submission |
| UAE Fatoora Phase 2 | TAX | July 2026 | Real-time clearance B2B |
| Indonesia Coretax | TAX | Mandatory now | Coretax API integration |
| Saudi ZATCA Phase 2 | TAX | Live | Real-time clearance B2B |
| SOX-compatible controls | CLOSE | Series B investor requirement | SHA-256 Close Pack already SOX-architecture-compatible — market it |

Rule: Any regulation where Axtreo's architecture already provides the data to comply automatically = ship the compliance feature first, market as zero-effort compliance.

### Lens 4 — Architecture Leverage Scan

Which of Axtreo's 7 moat assets does this feature use? If we're not using any, why not?

| Architecture Asset | 10x advantage | Relevant domains |
|-------------------|---------------|-----------------|
| CustomerIdentityMap | Cross-provider identity resolution with confidence scoring — no competitor has this | RECON, METRICS, MULTI_ENTITY |
| FRESH/STALE/COMPUTING | Every number carries freshness guarantee — competitors serve stale data silently | ALL |
| Bitemporal DeltaEvent (event_time + recorded_at) | "What did the books look like at 3pm on March 31?" — true audit replay | CLOSE, RECON, RECOG |
| SHA-256 sealed Close Pack | Auditor-verifiable without Axtreo login — nobody at startup tier | CLOSE, REPORTING |
| 9-layer pipeline architecture | Every feature reads from compute layer, never raw facts — no incorrect numbers when data changes | ALL |
| Three-tier storage (hot DB → S3 → IndexedDB) | Server cost flat regardless of client age | INFRA, INTEGRATION |
| AES-256-GCM IndexedDB | Financial data encrypted on disk — developer console = useless ciphertext | AUTH, CLOSE |

Ask: Does this feature explicitly leverage these assets? Propose how it could if not currently planned.

### Lens 5 — 10x UX Reduction Test

What is the industry standard step count for this task, and how do we reduce it by 10x?

Search: "[task name] how long does it take industry average minutes steps"

Embedded benchmarks (no search needed for these):
```
Month-end close:           8 days → Axtreo target 6 hours    (mechanism: continuous pre-computation, exception-only workflow)
Bank reconciliation:       3 hrs/month → 8 minutes           (mechanism: auto-match EXACT silently, surface exceptions with pre-populated explanations)
Revenue recognition entry: manual per contract → zero manual  (mechanism: AI obligation parser + CLM integration)
Audit preparation:         40% of quarter-end time → instant  (mechanism: SHA-256 chain + AuditEvent append-only from day 1)
Compliance filing:         days of extraction → one-click     (mechanism: multi-jurisdiction CoA + entity isolation)
Cohort analysis:           data analyst + SQL → natural query  (mechanism: GraphRAG + Arc AI on compute layer)
```

Identify: Current industry step count for this specific feature. Design for one-click or zero-click. If you cannot reach one-click, identify the data architecture gap that prevents it.

### Lens 6 — Client Voice Research

What do real clients say about this pain in their own words? Mine the vocabulary, not the feature request.

**Signal types to classify:**
- 🔴 Rage signals — strong pain, high urgency
- 🟡 Confusion signals — UX opportunity, cognitive load issue
- 🟢 Workaround signals — automation opportunity (what they do manually today)
- 🔵 Switch signals — acquisition opportunity (what pushed them to look for alternatives)
- ⚪ Wish signals — feature gap (what they would pay for)
- 🟣 Fear signals — trust deficit (what they're afraid of getting wrong)

**Communities to search:**
```
Reddit communities:
  r/accounting           r/SaaS              r/startups
  r/smallbusiness        r/Entrepreneur      r/bookkeeping
  r/QuickBooks           r/Xero              r/taxpros
  r/freelance            r/indiehackers      r/microsaas
  r/financialindependence r/webdev

Platforms beyond Reddit:
  Hacker News            — "Ask HN: what do you use for SaaS revenue accounting"
  Indie Hackers          — community discussions on finance tools
  G2 / Capterra          — 1-4 star reviews for competitors (not 5-stars)
  Trustpilot             — competitor reviews
  Product Hunt           — comments on competitor launches
  Twitter/X              — "[tool] is broken" threads
  LinkedIn               — "frustrated with [tool]" posts
  YouTube comments       — accounting software tutorial videos
  Quora                  — "how do you handle X in SaaS"
```

**Search query templates (run the relevant ones):**

Frustration signals:
```
site:reddit.com "[pain-domain]" "I hate" OR "frustrated" OR "doesn't work" OR "waste of money"
site:reddit.com "[tool-name]" "switching" OR "alternatives" OR "leaving" OR "cancelled"
site:reddit.com "[pain-domain]" "every month" OR "manually" OR "spreadsheet" OR "copy paste"
"[tool-name]" site:g2.com "cons" OR "wish" OR "missing" OR "doesn't"
"[tool-name]" site:capterra.com "cons" OR "frustrating" OR "complicated" OR "support"
```

Pain vocabulary (domain-specific, add the relevant ones):
```
METRICS/MRR:    "numbers don't match" OR "MRR wrong" OR "can't trust my MRR"
                "ChartMogul wrong" OR "Baremetrics vs QuickBooks" OR "ARR discrepancy"
                "how do you calculate MRR" OR "MRR definition" site:reddit.com

RECONCILIATION: "reconciliation nightmare" OR "books don't balance" OR "manual journal"
                "Stripe QuickBooks reconciliation" OR "Synder problems" site:reddit.com
                "month end close hours" OR "close takes forever" OR "reconcile manually"

CLOSE/AUDIT:    "audit trail missing" OR "auditor asked for" OR "can't find the transaction"
                "close pack" OR "board meeting numbers wrong" OR "restate revenue"
                "books are a mess" OR "need to hire bookkeeper" OR "outgrown QuickBooks"

TRUST:          "don't trust my numbers" OR "not sure if correct" OR "approximately"
                "double-check manually" OR "run it twice" OR "export to Excel to verify"
                "board presentation numbers" OR "investor due diligence" OR "first audit"

MULTI-ENTITY:   "multi-entity accounting" OR "consolidated view" OR "4 currencies"
                "intercompany eliminations" OR "consolidation headache" site:reddit.com
```

Trigger / job transition vocabulary:
```
"hire a bookkeeper" OR "need a CFO" OR "fractional CFO" site:reddit.com
"Series A due diligence" OR "first audit" OR "board deck" site:reddit.com
"migrating from" OR "replacing" OR "gave up on" "[tool-name]" site:reddit.com
```

Job description mining (reveals current tool pain as required skills):
```
site:linkedin.com/jobs "SaaS" "controller" OR "CFO" "ChartMogul" OR "Stripe" OR "ASC 606"
site:indeed.com "finance manager" "SaaS" "revenue reconciliation" OR "month-end close"
```

**Output format:**

```
CLIENT VOICE FINDINGS
Pain domains searched: {list}
Signal counts: 🔴{N} rage  🟡{N} confusion  🟢{N} workaround  🔵{N} switch  ⚪{N} wish  🟣{N} fear

Top 5 exact phrases clients use:
  1. "{exact quote}" — source: {platform} — signal type: {type}
  2. "{exact quote}" — source: {platform} — signal type: {type}
  3. "{exact quote}" — source: {platform} — signal type: {type}
  4. "{exact quote}" — source: {platform} — signal type: {type}
  5. "{exact quote}" — source: {platform} — signal type: {type}

Pain vocabulary glossary (use these words in copy, not analyst language):
  Analyst says:      "{technical term}"
  Client says:       "{their actual words}"

Trigger moment confirmed: {yes — describe the event / no — not found}
Midnight Test result: {would use at 11pm / monthly-only / wouldn't use}
Trust deficit signal: {strong / moderate / weak / none found}
```

### Lens 7 — Switch Interview Patterns

Why do clients abandon their current tools? The exit language is your acquisition copy.

**Search strategy:**

1-3 star reviews on G2/Capterra for tools clients are switching FROM:
```
site:g2.com "[tool-name]" review "cons" 2024 OR 2025
site:capterra.com "[tool-name]" "switched" OR "moved to" OR "replaced"
```

Reddit switch threads:
```
site:reddit.com "[tool-name]" "switching" OR "left" OR "migrated" OR "cancelled"
site:reddit.com "alternatives to [tool-name]" OR "[tool-name] alternative"
site:reddit.com "replaced [tool-name]" OR "moved away from [tool-name]"
```

Hacker News migration threads:
```
site:news.ycombinator.com "[tool-name]" "switched" OR "replaced" OR "alternative"
```

**Pattern extraction — for each tool in the switching-from list:**

```
Tool: {name}
Last-straw patterns (most frequent exit reasons):
  1. {pattern} — frequency: {high/medium/low}
  2. {pattern} — frequency: {high/medium/low}
  3. {pattern} — frequency: {high/medium/low}

Migration fear (why they stayed too long):
  — {what made them delay switching despite the pain}

Entry language (how they describe the new tool they want):
  — "{exact words they use for what they're searching for}"
```

**Output format:**

```
SWITCH INTERVIEW FINDINGS
Tools analyzed: {list}

Confirmed last-straw moments:
  → {tool}: "{exact pattern that triggers switching}"
  → {tool}: "{exact pattern that triggers switching}"

Migration fears (why clients stay broken):
  → "{what they say}" — implication for Axtreo onboarding

Entry language (what they search for when ready to switch):
  → "{exact search terms}" — use in SEO, copy, ads

Axtreo conversion opportunity: {what specifically to say to a client about to leave [tool]}
```

---

## Phase 4 — Feature Classification

For every distinct component of this feature, assign a class:

| Class | Definition | Decision |
|-------|-----------|----------|
| **A — Leap (100x)** | Cannot be built by competitors without replacing core architecture. Moat. | ALWAYS build. No exceptions. |
| **B — Generation (10x)** | Exists at enterprise tier ($100K+/year). We bring it to startup tier ($29–$799/month monthly; $24–$665/mo annual). | Build when the domain is active. These win deals. |
| **C — Parity (1x)** | Table stakes. Loss if absent; invisible if present. | Build correctly and quickly. Never market these. |
| **D — Backward** | Was standard 2019–2022. Now considered technical debt. | NEVER build. Create gap task immediately. |

### 7 Backward Feature Checks (Class D — run before finalizing design)

```
□ No single-source assumption    — any CSV-only path must include AI column detection
□ No UTC period boundaries       — always fiscal_month from entity.fiscal_timezone
□ No binary match/no-match       — every reconciliation match must carry a confidence score
□ No silent STALE data           — FRESH/STALE/COMPUTING flag must be surfaced to user on every computed value
□ No manual-required automation  — if Tejas had 10 clients tomorrow, could this run without him touching it?
□ No sensitive data in logs      — no console.log(amount), no tokens, no PII in error responses
□ No plaintext sensitive fields  — tokens as SHA-256 hash, monetary amounts as Decimal, API keys AES-256-GCM
```

If any check fails: mark as Class D in the Innovation Delta. Create a gap task. Do not ship.

---

## Phase 5 — Innovation Delta Report

Write a complete pre-build intelligence report. Save it to `/tmp/feature-intel-{slug}-{timestamp}.md`.

```markdown
# FEATURE INTEL: {feature name}
Generated: {datetime} | Domain: {codes} | Stage: PRE-REVENUE

---

## LENSES ACTIVATED
DEEP: {list of lenses that scored DEEP}
MODERATE: {list of lenses that scored MODERATE}
LIGHT: {list of lenses that scored LIGHT}
Country lenses: {list or "none — not applicable"}

---

## LENS FINDINGS

### L1.2 — CPA/Controller  [PASS|RISK|FAIL]
{Finding + gap if any}

### L1.7 — Quant/Math  [PASS|RISK|FAIL]
{Finding + gap if any}

### L2.3 — DB Architecture  [PASS|RISK|FAIL]
{Finding + gap if any}

### L3.1 — Cybersecurity (5 checks)  [PASS|RISK|FAIL]
{Finding + gap if any}

### L4.4 — Roadmap/Dependencies  [PASS|RISK|FAIL]
{Finding + gap if any}

### L12.3 — AI-First Execution  [PASS|RISK|FAIL]
{Finding + gap if any}

{... one section per additional domain-triggered lens ...}

---

## COUNTRY LENS FINDINGS
{Section per activated country, or "Not applicable — no tax/payroll/FX domain detected"}

### C{n} — {Country name}
L-C.1 Accounting standard: {required standard — ASC 606/US GAAP or IFRS 15 or CAS 14}
L-C.2 Revenue recognition: {5-step model variation or PASS}
L-C.3 Tax type + rate: {tax system and applicable rate or PASS}
L-C.4 Registration threshold: {proximity flag required or PASS}
L-C.5 Filing cadence: {filing frequency + deadlines or PASS}
L-C.6 E-invoicing: {mandate + deadline or PASS}
L-C.7 Currency + FX: {functional currency + FX handling note or PASS}
L-C.8 Payroll: {payroll system + rates or PASS}
L-C.9 Axtreo-specific critical: {most important requirement from country checklist}

---

## 10x RESEARCH

### Lens 1 — Market Frontier
Most advanced live implementation: {what enterprise platforms do}
10x Class B opportunity: {what we can bring to startup tier}

### Lens 2 — Competitor Gap Map
Competitors researched: {list}
Parity baseline (Class C): {what everyone has}
Consistent gap across all competitors: {the opportunity}
Axtreo architecture advantage: {which moat enables what they cannot build}

### Lens 3 — Regulation Accelerator
Active regulations found: {list with deadlines}
First-mover opportunity: {regulation where our architecture already produces the data}

### Lens 4 — Architecture Leverage
Moat assets applicable to this feature: {list}
10x advantage proposed: {specific mechanism}
Missed leverage: {moat assets not currently in the design + proposal}

### Lens 5 — UX Reduction
Industry step count: {N steps / N minutes}
Axtreo design step count: {N steps}
Mechanism: {how we achieve the reduction}
Blocker if not at 1-click: {data architecture gap identified}

### Lens 6 — Client Voice Research
Pain signals found: 🔴{N} rage  🟡{N} confusion  🟢{N} workaround  🔵{N} switch  ⚪{N} wish  🟣{N} fear
Top client phrases: {top 3 exact quotes with source}
Pain vocabulary: Analyst says "{term}" / Client says "{their words}"
Trigger moment: {confirmed event or "not found"}
Midnight Test: {would use at 11pm / monthly-only / wouldn't use}
Trust deficit: {strong / moderate / weak}
Copy implication: {one sentence — how this changes the pitch or UI copy}

### Lens 7 — Switch Interview Patterns
Tools analyzed: {list}
Last-straw moment: {what triggers clients to finally switch}
Migration fear: {what makes them delay despite the pain}
Entry language: {exact words clients search for when looking for an alternative}
Axtreo conversion line: {one sentence — what to say to a client about to leave [tool]}

---

## FEATURE CLASSIFICATION

| Feature component | Class | Why |
|------------------|-------|-----|
| {component 1} | A | {reason — architecture asset required} |
| {component 2} | B | {reason — enterprise-only brought to startup} |
| {component 3} | C | {reason — table stakes} |
| {component 4 if any} | D | {reason — backward — gap task required} |

Backward feature check: {ALL PASS | N FAILED → see Class D above}

---

## INNOVATION DELTA

**Class A — Moat features (build, never skip):**
  → {list with architecture asset that makes it irreplicable}

**Class B — Frontier features (build, win deals):**
  → {list with enterprise source and how we bring it down-market}

**Class C — Parity (build correctly, never market):**
  → {list}

**Class D — Backward features (NEVER build):**
  → {list with gap task reference}

**10x UX Achievement:**
  Original industry: {N} steps / {N} minutes
  Axtreo: {N} steps
  Mechanism: {how}

**Features deferred to future phase:**
  → {list with phase trigger}

---

## BUILD READINESS CHECKLIST
[ ] All Tier-1 lenses PASS or RISK only (no FAIL)
[ ] No Class D features in the proposed design
[ ] At least one moat asset (Class A) or frontier feature (Class B) identified
[ ] Country compliance requirements documented (or "N/A")
[ ] 10x UX path defined (or blocker identified)
[ ] Backward check: all 7 items pass

---

## GAP TASKS TO OPEN ON AX-181
{List any gaps that need a dedicated task, or "None"}
```

---

## Phase 5-B — Class A Stress Test (multi-agent brainstorm)

**Run only when Phase 4 produced ≥ 1 Class A classification. Skip and mark N/A otherwise.**

Class A claims ("architectural moat — irreplicable") are the highest-stakes output of the pipeline. Before any Class A feature enters a sprint, three adversarial agents attack it. An integrator gives the final verdict.

---

### Input

Take every Class A row from the FEATURE CLASSIFICATION table. Run the full sequence below once per Class A item.

---

### Agent 1 — Skeptic

**Mandate:** Assume this Class A claim will fail in production. Why?

Attack surface:
- Is the "architectural moat" actually locked to Axtreo, or could a competitor replicate it in < 6 months with standard tooling?
- Does the 10x claim hold for the specific user persona (Sophie, Priya, Marcus), or only for a power user?
- What is the most likely user workaround (spreadsheet, manual process, competitor tool) that makes this feature irrelevant?
- Does it depend on a data prerequisite (e.g., CustomerIdentityMap fully populated, bitemporal ledger live) that isn't yet shipped?

Output: 1–3 failure modes. One sentence each. No solutions.

**May NOT:** propose redesigns, suggest alternatives, introduce new requirements.

---

### Agent 2 — Constraint Guardian

**Mandate:** Enforce non-functional constraints. Reject any Class A claim that violates them.

Check:
- **Performance**: can this feature deliver its 10x promise within the Cloudflare Worker 30s CPU limit + Supabase pg connection budget?
- **Cost**: does this feature's per-request AI/compute cost remain < 10% of the tier's monthly subscription revenue?
- **Security**: does this feature expose new account_id boundaries, new PII surfaces, or new write paths that bypass current validation?
- **Scalability**: does this feature degrade if the account has 10× the expected data volume (e.g., 50k transactions instead of 5k)?

Output: PASS or REJECT per constraint. One line each. If REJECT: state the hard limit violated.

**May NOT:** debate product goals, suggest feature changes, optimise beyond stated requirements.

---

### Agent 3 — User Advocate

**Mandate:** Represent Sophie, Priya, or Marcus (whichever persona this feature targets).

Check:
- At what step does cognitive load spike? (more than 3 decisions in sequence = too much)
- Is the "10x UX" metric honest — does the reduction in steps actually transfer to the user's mental model, or does it just hide steps behind automation?
- What is the failure experience? If the moat breaks (e.g., graph traversal returns wrong confidence), what does the user see and do?
- Is there a simpler interpretation of the same outcome that doesn't require this architectural complexity?

Output: 1–3 UX risks. One sentence each. No redesign proposals.

**May NOT:** redesign architecture, add features, override stated user goals.

---

### Agent 4 — Integrator (Arbiter)

**Mandate:** Review all three agents' outputs. Give a final verdict per Class A item.

Verdicts:
- **SURVIVE** — all attacks answered; Class A confirmed; no changes required
- **DOWNGRADE-TO-B** — the moat claim is real but the 10x is not yet achievable (data prereq missing, cost constraint violated, or UX risk unacceptable); keep as Class B frontier feature
- **KILL** — replication barrier is too low, or constraint violation is fundamental; remove from this sprint entirely

For each DOWNGRADE or KILL: state exactly which attack was decisive and what the feature becomes.

**May NOT:** invent new ideas, add requirements, reopen a SURVIVE verdict.

---

### Output — Phase 5-B Block

Append this block to the Innovation Delta report (inside `/tmp/feature-intel-*.md`):

```
## PHASE 5-B: CLASS A STRESS TEST

{For each Class A item:}

### {Feature name}  →  SURVIVE | DOWNGRADE-TO-B | KILL

SKEPTIC:           {decisive failure mode, or "no critical failure mode found"}
CONSTRAINT:        {PASS or REJECT — constraint violated}
USER ADVOCATE:     {decisive UX risk, or "no critical UX risk found"}
ARBITER VERDICT:   SURVIVE | DOWNGRADE-TO-B | KILL
Reason:            {one sentence — which attack was decisive, or "all attacks answered"}
```

Update the FEATURE CLASSIFICATION table: change any DOWNGRADE row from A → B, any KILL row from A → D.

---

## Axtreo Architecture Reference (no web needed)

**7 Moats — use at least one per feature:**
1. **CustomerIdentityMap** — cross-provider identity resolution with confidence scoring
2. **FRESH/STALE/COMPUTING** — freshness flag on every computed value
3. **Bitemporal DeltaEvent** — event_time (when it happened) + recorded_at (when Axtreo processed it)
4. **SHA-256 Close Pack** — auditor-verifiable without Axtreo login
5. **9-layer pipeline** — ingest → normalise → identity → ledger → reconcile → recognise → metrics → intelligence → evidence
6. **Three-tier storage** — hot (DB) → warm (S3) → cold (Glacier + IndexedDB)
7. **AES-256-GCM IndexedDB** — client-side encrypted financial data

**Validation personas:**
- **Sophie** (Lumiere Hospitality, Paris) — Controller, France, EUR, TVA 20%, hospitality, mid-sized company
- **Priya** (NexusHealth AI) — Controller, 4 entities (US/UK/India/SG), multi-currency, approaching California nexus

**10x Feature Register (confirmed — do not re-research, use directly):**

| Feature | Domain | Class | Already confirmed |
|---------|--------|-------|-------------------|
| ISO 20022 XML native ingestion | RECON | B | Banks migrating globally now |
| Predictive cohort churn scoring (30-day forward) | METRICS | B | Churn is lagging — predict it 30 days ahead |
| NRR decomposed by acquisition channel + ACV band | METRICS | B | What Series A investors actually ask for |
| Contract obligation auto-extraction from text | RECOG | B | Enterprise platforms parse contracts — we bring it to $2M ARR |
| LazyGraphRAG indexing (Microsoft 2025) | AI | B | 99% cheaper than full GraphRAG — viable at startup pricing |
| Bitemporal Close Pack replay | CLOSE | A | "What did the books look like at 3pm March 31?" — requires both time dimensions |
| FASB AI disclosure auto-generation | AI | B | FASB 2026 requires AI process disclosure — auto-draft from AuditEvent |
| Steganographic watermark on PDF exports | CLOSE, REPORTING | A | Leaked doc traces to exact user + timestamp — nobody at startup tier |
| NRR-based customer health score → Close Pack | METRICS → CLOSE | A | Close Pack includes revenue reliability signal — auditor sees quality not just numbers |
| Xero OS-style ambient Arc AI agent | AI | B | Xero launched JAX April 2026 — always-on finance agent |
| Behavioral cohort analysis | METRICS | B | Group by what customers DO, not when they signed up |
| FASB ASU 2023-07 segment disclosure auto-draft | REPORTING | B | New segment reporting rules — auto-draft from entity + revenue data |
| Hop accuracy metric for graph traversal quality | AI | A | Nobody at startup tier measures whether the graph took the RIGHT traversal path — only if it returned an answer. Requires GraphRAG + CustomerIdentityMap |
| Autonomous reconciliation exception pre-resolution | RECON | B | High-confidence EXACT matches auto-cleared silently. Next: AI pre-resolves type-C timing exceptions autonomously (HighRadius has 200+ R2R agents) |
| Logo churn vs revenue churn separated | METRICS | B | Baremetrics Recover has this; Series A investors always ask — lost logos (customer count) vs lost revenue (dollar churn) are different signals |
| RPO waterfall chart (remaining performance obligations) | RECOG | B | Zuora / Maxio enterprise feature; shows period-over-period RPO movement; required for ASC 606 footnote disclosure |
| SSP auto-assignment with confidence scoring | RECOG | B | Enterprise rev rec platforms (Zuora, Leapfin) auto-assign SSP from observable transaction data; bring to $99/mo |
| Variable consideration probability weighting | RECOG | B | ASC 606 §606-10-32-5 through 32-9 — most startups skip this; Zuora handles it; auto-calc expected value using most-likely-amount or expected-value method |
| Continuous close — GL pull every minute | CLOSE | B | Numeric-style; eliminates month-end sprint; no competitor at startup tier has this; Axtreo's compute layer architecture makes it native |
| AI Variance Analysis — trace variance to source transaction | CLOSE | B | FloQast shipped this Sept 2025 (enterprise only); auto-explain why a number changed by traversing AuditEvent + DeltaEvent chain |
| Bi-directional GL push to QBO / Xero | INTEGRATION | B | Rillet has this; Axtreo currently pulls only; push closes the loop — CFO sees the same number in QBO without manual entry |
| Period-scoped immutable auditor access | CLOSE | A | Auditor sees ONLY audit period data; cannot traverse into adjacent periods; Axtreo's append-only AuditEvent makes this architecturally native; FloQast charges enterprise for scoped auditor portals |
| Auto-evidence collection for PBC (Provided by Client) requests | CLOSE | A | Auditor requests document → Axtreo auto-pulls matching ClosePacks + AuditEvents from that period; zero manual assembly; nobody at startup tier |
| Dunning automation + recovery flow analytics | METRICS | B | Baremetrics Recover product — auto-retry + cancellation intercept + win-back sequences; required for ARR recovery metrics to be accurate |
| Quarterly SE tax estimate for SaaS freelancers | FREELANCER | B | Hurdlr covers gig economy; nobody does SaaS-specific SE tax (15.3% + income bracket) auto-calculated from Stripe net revenue |
| Digital twin P&L with external signal ingestion | PRED | A | No competitor at startup tier; external signals (Fed rate changes, BLS QCEW payroll data) → simulate impact on SaaS customer spending; requires reconciled data from Axtreo's 9-layer pipeline — cannot be replicated without it |

**Backward features (Class D — confirmed, never ship):**
- CSV-only bank import without AI column detection
- UTC period boundaries (always use fiscal_timezone)
- Binary match/no-match without confidence score
- STALE data served without STALE flag
- Static monthly reports instead of real-time
- Keyword-only search instead of semantic/GraphRAG
- Single-currency-per-entity assumption

**Domain-by-Domain Innovation Mandate (10x Framework Part 3 — use as Class B target for each domain):**

| Domain | Standard (what everyone ships) | 10x target |
|--------|-------------------------------|------------|
| Integration (D8–D12) | CSV upload + single-provider OAuth | ISO 20022 XML native ingestion; multi-provider event stream; idempotent deduplication; bi-directional GL push to QBO/Xero |
| Ledger (D13–D16) | Single currency, period-lock on request | Bitemporal ledger (event_time + recorded_at); FX translation at fiscal_timezone boundary; soft-delete append-only; multi-entity consolidation |
| Recognition (D30) | Manual journal entry per contract | AI contract obligation extraction from text; SSP auto-assignment; variable consideration probability weighting; RPO waterfall auto-generation |
| Reconciliation (D19/D27) | Binary match / no-match | Confidence-scored 5-tier matching (EXACT/HIGH/PROBABLE/POSSIBLE/UNCERTAIN); autonomous pre-resolution of type-C timing exceptions; hop accuracy metric on graph traversal |
| SaaS Metrics (D31) | MRR/ARR/churn static reports | NRR decomposed by channel + ACV band; predictive cohort churn (30-day forward); behavioral cohorts (what customers DO, not signup date); AI-native SaaS detection (flag: 40% GRR vs 82% traditional SaaS — benchmark separately) |
| Intelligence (D37) | Keyword search, static anomaly alerts | LazyGraphRAG indexing (99% cheaper than full GraphRAG); semantic NL query on compute layer; pre-computed anomaly explanations; hop accuracy metric per traversal |
| Prediction (D39) | No prediction layer at startup tier | Multi-agent simulation: 4 agent types (churn/expansion/market-shock/pricing); external signal ingestion (Fed rates, BLS QCEW payroll data); digital twin P&L with Monte Carlo; tornado chart sensitivity analysis showing top-5 revenue drivers |
| Close + Evidence (D32–D34) | PDF report, manual sign-off | SHA-256 sealed Close Pack (auditor-verifiable without login); bitemporal replay ("what did books look like at 3pm March 31?"); steganographic watermark on exports; FASB AI disclosure auto-draft from AuditEvent |

**Platform Threat Radar (2025–2026 — check before every feature decision):**

| Competitor | Capital | Core threat | Axtreo's counter |
|---|---|---|---|
| **Campfire** | ~$100M (2025) | LAM (Large Accounting Model) — AI-native ERP; full-stack close + reconciliation + recognition; targets Series A–C SaaS $5M–$50M ARR | CustomerIdentityMap cross-provider identity + bitemporal ledger cannot be replicated without rebuilding their architecture |
| **Rillet** | ~$100M (2025) | 93% journal entry automation; ERP purpose-built for SaaS; bi-directional QBO push; same ICP and price tier as Axtreo | SHA-256 Close Pack + append-only AuditEvent + 9-layer pipeline = audit-native close that Rillet cannot match |
| **Xero JAX / Xero OS** | Platform-scale | AI OS launched April 2026; agentic bank reconciliation (113/118 auto-reconciled in live demo); OpenAI partnership; $29B US payments TAM declared | Confidence-scored 5-tier matching + hop accuracy metric is measurably better than Xero's binary auto-match |
| **Mosaic (HiBob-acquired)** | $35M acq. Feb 2025 | HiBob cross-selling Mosaic FP&A to 8,000 HR customers at bundled price — commoditizes CFO reporting at startup tier | Beacon 6-tier audience model (investor/board/bank/customer/public/custom) has no equivalent in Mosaic |

⚠️ Campfire and Rillet are the most dangerous — same ICP, same price tier, $100M each. Every feature decision must ask: does this widen the architectural gap or just add parity?

**Stage:** Pre-revenue, 2-person team. First customer focus domains: RECON + CLOSE + INTEGRATION + REPORTING.

**Axtreo tiers (main track):** FREE ($0) · GO ($35/mo) · PRO ($99/mo) · ENTERPRISE (custom). Freelancer track: FREE + SOLO ($35/mo · $29/mo annual). Add-ons: Auditor Seat ($75/mo), Beacon Transparency Portal (included PRO+).

---

## Phase Tracking

```
TodoWrite tasks to create at start:
[ ] Phase 0-A: Context harvested (codebase + Jira + Confluence → $SHARED_CTX written)
[ ] Phase 0: Domain detected, lenses scored, Activation Plan written
[ ] Phase 1: Activated lenses executed at prescribed depth
[ ] Phase 2: Country lenses applied (or marked N/A)
[ ] Phase 3: 10x research complete (all 5 lenses, web research done)
[ ] Phase 4: Class A/B/C/D assigned, 7 backward checks complete
[ ] Phase 5: Innovation Delta report written to /tmp/feature-intel-*.md
[ ] Phase 5-B: Class A items stress-tested (SURVIVE/DOWNGRADE-TO-B/KILL) — or "N/A: no Class A found"
```
