---
description: Finance / CFO / CFA-perspective review of monetary calculations, FX, fiscal periods, MRR/ARR formulas, revenue recognition, and close mechanics. Reports findings; does NOT auto-fix.
argument-hint: [PR_NUMBER]
allowed-tools: Bash, Read, Grep, TodoWrite
---

## Purpose

A CFO / FP&A lead / CFA-level review of any code that does math on money. Catches subtle errors that compile fine and pass tests but produce wrong numbers — the kind of bug that costs a customer trust and survives until someone external reconciles their books.

This is NOT a security review (that's `/security-review`). This is NOT a compliance review (that's `/compliance-review`). This is the question: **"is the math correct?"**

---

## Step 0 — Determine the change set

Same as `/qa-review` step 0.

---

## Step 1 — Identify monetary code

Find every changed file that does monetary math:

```bash
# Files with money fields, currency, FX, period boundaries
git diff origin/$BASE...HEAD --name-only | xargs grep -l -E \
  "amountMinor|amountCents|amountBase|currency|fxRate|mrr|arr|fiscalMonth|recognized|revenueBridge|reconciliation|invoice|subscription|chargebee|stripe.*amount" \
  2>/dev/null | sort -u
```

For each money-touching file, run the lens below.

---

## Step 2 — Money representation rules

### 2a. Money is INTEGER cents, never float dollars
- `amountMinor: BigInt` ✅
- `amountMinor: number` ⚠️ (overflow risk above $90B in cents — usually OK for line items but **MAJOR** for aggregates)
- `amount: number` representing dollars ❌ **BLOCKER** — float arithmetic destroys cents over time
- `parseFloat()` on a money value ❌ **BLOCKER**
- `Math.round(x * 100)` to convert dollars → cents ❌ **MAJOR** — rounding before integer conversion is unsafe

### 2b. Decimal types
- `Decimal` from Prisma is acceptable for FX rates, percentages, ratios.
- Do NOT mix `Decimal` and `BigInt` arithmetic without explicit conversion.
- `Number(decimalValue)` loses precision = **MAJOR**.

### 2c. Rounding rules
For aggregations, dividing, FX conversion: WHICH rounding mode?
- Banker's rounding (round half to even) for daily totals → fewer systematic errors
- Round half away from zero (the default) is acceptable for line items
- A new aggregation that uses `Math.round` without thinking about mode = **MINOR** (flag for review)
- A new aggregation that drops fractions (`Math.floor` on cents) = **MAJOR** unless explicitly modeling truncation

---

## Step 3 — Currency / FX

### 3a. Multi-currency aggregations require a base currency
- An entity stores amounts in its `functional_currency`.
- Cross-entity rollups MUST convert to a common base currency (`amountBaseCents` in the schema).
- Code that sums `amountMinor` across multiple entities WITHOUT converting through `amountBaseCents` = **BLOCKER**.

### 3b. FX rate lookups
- Use rate **as of event_timestamp**, not "now". A March 1 invoice converts at the March 1 rate, even if reconciled in April.
- New code using `currentDate` / `Date.now()` for FX lookups in historical math = **MAJOR**.

### 3c. FX volatility / reporting currency
- Any new dashboard display of cross-currency totals: clearly labeled with reporting currency? Date of FX rate?
- Mismatched currencies summed without conversion = **BLOCKER**.

---

## Step 4 — Fiscal period boundaries

### 4a. fiscal_month is the period anchor — NOT calendar_month
- An event at 23:59 UTC on March 31 might fall into APRIL's fiscal month if the entity is in fiscal_timezone Asia/Tokyo.
- Code that uses `eventTimestamp.toISOString().slice(0,7)` to derive fiscal month = **BLOCKER** — that's UTC calendar month, not fiscal month.
- Always read `fiscalMonth` from the row (computed once at write time per entity.fiscal_timezone).

### 4b. Period transitions
- New code that computes "this month vs last month": is the boundary handled at entity-level fiscal_timezone, not server-local time?
- Reports of "MRR change since last close" — must use sealed close-pack figures, not live counts.

### 4c. Sealed close packs are immutable
- Reading a close pack: OK.
- Updating a close pack after sealing date: **BLOCKER**.
- Computing a new metric "as of" a sealed close: must use the values frozen in `ClosePack`, not re-aggregating raw facts.

---

## Step 5 — MRR / ARR / Revenue formulas

### 5a. MRR definition
- MRR = sum of normalized monthly subscription value across active subs at end-of-period (last day of fiscal_month).
- Annual subscription? `mrr = annual_amount / 12`, NOT `monthly_amount`.
- Quarterly subscription? `mrr = quarterly_amount / 3`.
- One-time fees, upgrades, refunds: NOT MRR. They go into other metrics (NRR change, expansion, contraction).

### 5b. ARR = MRR × 12
- Calculated from current MRR, not from any single "annual price."
- New code that computes ARR from `subscription.annualPrice` directly = **MAJOR** (misses prorations).

### 5c. New / Churned / Expansion / Contraction MRR
The "movement waterfall":
- New = subs that didn't exist last close, exist now.
- Churned = subs that existed last close, gone now.
- Expansion = same sub, MRR went up.
- Contraction = same sub, MRR went down (still active).
- Net = New + Expansion − Churn − Contraction.

A new movement formula must satisfy the closure: `MRR_end = MRR_start + Net`. Code that breaks this identity = **BLOCKER**.

### 5d. Revenue recognition (ASC 606 / IFRS 15)
- Revenue is recognized OVER the contract term, not at billing.
- Annual paid upfront → 1/12 recognized each fiscal_month.
- New `RecognitionRun` logic must handle: contract modifications, refunds, mid-period upgrades, mid-period downgrades, cancellations.
- A bug here means restated financials = **BLOCKER**.

---

## Step 6 — Reconciliation invariants

### 6a. Cash ledger == Provider ledger (after reconciliation)
- Sum of `CashLedgerFact.amountMinor` for an account, period, currency MUST equal sum of corresponding `ProviderEventFact` after `CustomerIdentityMap` resolution.
- New code that computes a cash total without checking against provider total = **MAJOR**.

### 6b. Reconcile-before-post
- Axtreo's product moat (per project memory): no GL journal entry posts unless its source events reconcile clean.
- New code that creates `GlJournalEntry` without an upstream `ReconciliationRun.status === 'CLEAN'` = **BLOCKER**.

---

## Step 7 — Audit-grade traceability

Any monetary value displayed to a user must be derivable back to source events.

- Dashboard shows `MRR = $12,345`. The user clicks → does the trail go: BeaconSnapshot → MrrSnapshot → ContractFact → ProviderEventFact?
- New aggregate without source-traceability = **MAJOR** (can't pass external audit).

---

## Step 8 — Output the finance review

```
## Finance Review — <PR or branch>

**Money representation:** <PASS/FAIL>
**Currency / FX:** <PASS/FAIL>
**Fiscal-period boundaries:** <PASS/FAIL>
**MRR / ARR / movement:** <PASS/FAIL>
**Recognition (ASC 606):** <PASS/FAIL/N-A>
**Reconciliation invariants:** <PASS/FAIL/N-A>
**Audit-grade traceability:** <PASS/FAIL>

### Blockers (N)
[Rule | file:line] formula or rule violated; what the wrong number would look like

### Major (N)
...

### Minor (N)
...

### CFO sign-off questions
- Would you defend this number to your auditor?
- Would you stake the company's books on it?
- Could a 1-day timezone offset move this number across a fiscal-period boundary?

### References
- decision_database_architecture.md (soft-delete, audit, fiscal_month)
- project_data_hierarchy.md (compute-layer-only reads)
```

Save to `/tmp/finance-review-$(date +%s).md`.

---

## Final report

```
Finance review complete:
  Money-touching files:  <N>
  Blockers:              <N>
  Major:                 <N>
  Minor:                 <N>
  Report saved:          /tmp/finance-review-<ts>.md
```

Any Blocker = `❌ Do NOT push. Finance gate failed — money math wrong.`
Otherwise = `✅ Finance review clean — math holds.`
