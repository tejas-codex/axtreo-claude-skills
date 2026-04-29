---
allowed-tools: Bash, WebSearch, WebFetch, TodoWrite
description: Client pain research — mine real client language from Reddit, G2, Capterra, HN, Indie Hackers, job postings. Run before writing copy, pricing, or UX. Output: pain vocabulary + trigger map + switch patterns.
---

## Purpose

Run this before writing a single line of copy, UI, or pricing for any user-facing feature.

**Input:** A pain domain or feature area (e.g. "month-end close", "MRR reconciliation", "multi-entity reporting").
**Output:** `/tmp/client-voice-{slug}-{timestamp}.md` — real client language, trigger map, switch patterns.

The competitor is not FloQast. The competitor is the client's Excel file at 11pm. This command finds that file.

---

## Step 0 — Parse input

Extract from the input:
- `PAIN_DOMAIN` — the feature area in plain language (e.g. "MRR trust", "reconciliation", "audit prep")
- `TOOLS_IN_SCOPE` — any tools the client currently uses for this (default: ChartMogul, QuickBooks, Stripe, Excel)
- `PERSONA` — Sophie (controller, multi-entity) / Priya (4-country CFO) / Marcus (freelancer) / Linda (auditor) / general ICP

---

## Step 1 — Signal Hunt (Lens 6: Client Voice)

Search across all sources. Classify every finding as one of 6 signal types:
- 🔴 Rage — strong pain, high urgency ("I hate", "broken", "waste of money", "I quit")
- 🟡 Confusion — UX issue, cognitive load ("why does it", "doesn't make sense", "can't figure out")
- 🟢 Workaround — automation gap ("I manually", "every month I", "I export to Excel", "copy paste")
- 🔵 Switch — acquisition moment ("switching from", "alternatives to", "migrated", "cancelled")
- ⚪ Wish — feature gap ("wish it could", "if only", "would pay for")
- 🟣 Fear — trust deficit ("not sure if correct", "don't trust", "double-check", "approximately")

### Communities

```
Reddit:
  r/accounting  r/SaaS  r/startups  r/smallbusiness  r/Entrepreneur
  r/bookkeeping  r/QuickBooks  r/Xero  r/taxpros  r/freelance
  r/indiehackers  r/microsaas  r/financialindependence  r/webdev

Other platforms:
  Hacker News (news.ycombinator.com)
  Indie Hackers (indiehackers.com)
  G2 (g2.com) — 1–4 star reviews
  Capterra (capterra.com) — 1–4 star reviews
  Trustpilot
  Product Hunt — comments on competitor launches
  Twitter/X
  LinkedIn
  YouTube comments on accounting tutorial videos
  Quora
```

### Search query templates

Frustration / rage signals:
```
site:reddit.com "{PAIN_DOMAIN}" "I hate" OR "frustrated" OR "broken" OR "waste of money"
site:reddit.com "{TOOL}" "switching" OR "alternatives" OR "leaving" OR "cancelled" OR "I quit"
site:reddit.com "{PAIN_DOMAIN}" "every month" OR "manually" OR "spreadsheet" OR "copy paste"
"{TOOL}" site:g2.com "cons" OR "wish" OR "missing" OR "broken" OR "doesn't"
"{TOOL}" site:capterra.com "cons" OR "frustrating" OR "complicated" OR "waste"
```

Workaround signals (gold — these are automation opportunities):
```
site:reddit.com "{PAIN_DOMAIN}" "I use Excel" OR "manually" OR "every month I" OR "I have to"
site:reddit.com "SaaS finance" "workaround" OR "hack" OR "janky" OR "held together"
site:reddit.com "accounting software" "still using Excel" OR "back to spreadsheets" OR "gave up"
```

Trust / fear signals:
```
site:reddit.com "don't trust my" "{PAIN_DOMAIN}" OR "MRR" OR "numbers"
site:reddit.com "not sure if" "correct" OR "right" OR "accurate" AND "accounting" OR "revenue"
site:reddit.com "double-check" "manually" AND "SaaS" OR "startup" OR "accounting"
site:reddit.com "board meeting" "numbers" "wrong" OR "mistake" OR "embarrassed" OR "restated"
```

Trigger moments (the "last straw" before they seek a solution):
```
site:reddit.com "first audit" OR "Series A" OR "investor due diligence" AND "accounting"
site:reddit.com "hire bookkeeper" OR "need CFO" OR "fractional CFO" AND "SaaS"
site:reddit.com "board meeting tomorrow" OR "board deck" AND "numbers" OR "accounting"
site:reddit.com "outgrown QuickBooks" OR "QuickBooks not enough" OR "too big for"
```

Domain-specific pain vocabulary:
```
MRR/METRICS:    "numbers don't match" "MRR wrong" "ARR discrepancy" "can't trust my MRR"
                "ChartMogul wrong" "Baremetrics vs QuickBooks" "MRR calculation"
                site:reddit.com "how do you calculate MRR" OR "MRR definition" "SaaS"

RECONCILIATION: "reconciliation nightmare" "books don't balance" "manual journal entries"
                "Stripe QuickBooks reconciliation" "Synder problems" "reconcile Stripe"
                site:reddit.com "month end close" "hours" OR "days" OR "nightmare" OR "hell"

CLOSE / AUDIT:  "audit trail missing" "auditor asked for" "can't find the transaction"
                "board presentation wrong" "restate revenue" "books are a mess"
                site:reddit.com "close pack" OR "close the books" "how long" OR "nightmare"

MULTI-ENTITY:   "multi-entity accounting" "consolidated view" "4 currencies"
                "intercompany eliminations" "consolidation headache"
                site:reddit.com "multi-entity" "accounting software" "SaaS"
```

Job description mining (required skills = current tool pain):
```
site:linkedin.com/jobs "SaaS" "controller" "ChartMogul" OR "Stripe" OR "ASC 606" OR "revenue recognition"
site:indeed.com "finance manager" "SaaS" "revenue reconciliation" OR "month-end close" OR "multi-entity"
site:lever.co OR site:greenhouse.io "SaaS" "controller" "Stripe" OR "QuickBooks" OR "reconciliation"
```

Hacker News:
```
site:news.ycombinator.com "SaaS revenue" "accounting" OR "bookkeeping" OR "reconciliation"
site:news.ycombinator.com "month-end close" OR "revenue recognition" OR "MRR calculation"
site:news.ycombinator.com "{TOOL}" "switched" OR "replaced" OR "alternative" OR "frustrated"
```

---

## Step 2 — Switch Interview Patterns (Lens 7)

For each tool in `TOOLS_IN_SCOPE`, mine exit language.

```
"{TOOL}" site:g2.com 1 OR 2 OR 3 star review "switched" OR "left" OR "cancelled" 2024 2025
"{TOOL}" site:capterra.com "moved to" OR "replaced" OR "after switching" 2024 2025
site:reddit.com "{TOOL}" "switching" OR "left" OR "migrated" OR "cancelled" OR "replacement"
site:reddit.com "alternatives to {TOOL}" OR "{TOOL} alternative" OR "replacing {TOOL}"
site:news.ycombinator.com "{TOOL}" "switched" OR "replaced" OR "alternative"
```

For each tool, extract:
1. **Last-straw pattern** — the specific moment that made them decide to leave
2. **Migration fear** — what made them delay despite the pain (switching cost belief)
3. **Entry language** — the exact words they use when searching for a replacement

---

## Step 3 — Synthesise

After collecting signals, build the output. Do not use analyst language — use the client's exact words.

**Pain Vocabulary Translation:**
For each key concept, find the gap between what analysts call it and what clients call it.
- Analyst: "revenue reconciliation discrepancy" → Client: "my numbers don't match"
- Analyst: "audit trail integrity" → Client: "the auditor is asking for something I can't find"
- Analyst: "cognitive load reduction" → Client: "I have 4 tabs open and none of them agree"

**Midnight Test:**
Would this feature be used at 11pm the night before a board meeting?
- YES → essential, crisis-mode UX required
- MONTHLY-ONLY → high stickiness, but not daily
- WOULDN'T USE → nice-to-have, deprioritise

**Trust Deficit Score:**
Based on 🟣 Fear signals found:
- STRONG (5+ fear signals) — sell certainty, not speed
- MODERATE (2–4) — mention accuracy in copy
- WEAK (0–1) — not the primary pain for this domain

---

## Step 4 — Write report

Save to `/tmp/client-voice-{slug}-{YYYYMMDD}.md`.

```markdown
# CLIENT VOICE: {PAIN_DOMAIN}
Generated: {datetime} | Persona: {PERSONA} | Tools in scope: {TOOLS_IN_SCOPE}

---

## SIGNAL COUNTS
🔴 Rage: {N}  🟡 Confusion: {N}  🟢 Workaround: {N}
🔵 Switch: {N}  ⚪ Wish: {N}  🟣 Fear: {N}
Total sources searched: {N}

---

## TOP 10 EXACT CLIENT PHRASES
(use these words in copy, not analyst language)

1. "{exact quote}" — {platform} — {signal type}
2. "{exact quote}" — {platform} — {signal type}
3. "{exact quote}" — {platform} — {signal type}
4. "{exact quote}" — {platform} — {signal type}
5. "{exact quote}" — {platform} — {signal type}
6. "{exact quote}" — {platform} — {signal type}
7. "{exact quote}" — {platform} — {signal type}
8. "{exact quote}" — {platform} — {signal type}
9. "{exact quote}" — {platform} — {signal type}
10. "{exact quote}" — {platform} — {signal type}

---

## PAIN VOCABULARY GLOSSARY

| Analyst says | Client says | Signal strength |
|---|---|---|
| {technical term} | {client words} | 🔴 / 🟡 / 🟣 |
| {technical term} | {client words} | 🔴 / 🟡 / 🟣 |

---

## TRIGGER MAP
(the events that send the client to look for a solution RIGHT NOW)

1. {trigger event} — frequency: high/medium/low
2. {trigger event} — frequency: high/medium/low
3. {trigger event} — frequency: high/medium/low

---

## WORKAROUND MAP
(what they do manually today — every item is an automation opportunity)

| Current workaround | Time cost | Automation class |
|---|---|---|
| {what they do} | {est. time/month} | A / B / C |

---

## MIDNIGHT TEST
Result: {WOULD USE AT 11PM / MONTHLY-ONLY / WOULDN'T USE}
Evidence: {the quotes that support this verdict}
UX implication: {what the crisis-mode UX needs to handle}

---

## TRUST DEFICIT
Score: {STRONG / MODERATE / WEAK}
Evidence: {top fear quotes}
Copy implication: {sell certainty / mention accuracy / not primary angle}

---

## SWITCH INTERVIEW FINDINGS

### {Tool 1}
Last-straw: "{exact pattern that triggers switching}"
Migration fear: "{what made them delay}"
Entry language: "{exact words they search for}"
Axtreo conversion line: "{one sentence — what to say to a client about to leave this tool}"

### {Tool 2}
(same format)

---

## IDENTITY INSIGHT
Current identity: {who the client is today — "spreadsheet controller", "manual reconciler"}
Desired identity: {who they want to become — "strategic CFO", "the one who automated close"}
Identity gap: {the transformation Axtreo enables}

---

## COPY RECOMMENDATIONS
(use these phrases — tested against real client language)

Headlines:
  → "{client-language headline}"
  → "{alternative}"

Pain acknowledgement line (for landing page / email):
  → "{exact pain, their words}"

Outcome promise:
  → "{what they get, their words}"

---

## OPPORTUNITIES RANKED
(sorted by signal strength × automation gap)

| # | Opportunity | Signal type | Pain intensity | Automation gap |
|---|---|---|---|---|
| 1 | {specific opportunity} | 🔴/🟢/🟣 | HIGH/MED/LOW | HIGH/MED/LOW |
| 2 | {specific opportunity} | | | |
| 3 | {specific opportunity} | | | |
```

---

## Checklist

- [ ] Step 1: Signal hunt complete (all 6 signal types searched)
- [ ] Step 2: Switch patterns extracted for each tool in scope
- [ ] Step 3: Pain vocabulary translated (analyst → client language)
- [ ] Step 4: Report written to /tmp/client-voice-*.md
