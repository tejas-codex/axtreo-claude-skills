---
description: GAAP / audit compliance review on a PR or current branch. Acts like an internal auditor — verifies append-only audit tables, soft-delete coverage, accountId scoping, fiscal_month invariants, and data retention rules.
argument-hint: [PR_NUMBER]
allowed-tools: Bash, Read, Grep, TodoWrite
---

## Purpose

Axtreo is a finance product. Customers will use it for GAAP-compliant close, audit support, and revenue recognition. The platform itself MUST follow audit-grade discipline:

- **Audit trails are append-only** — no UPDATE, no DELETE on `AuditEvent` / `OperatorAuditEvent`.
- **Financial records are soft-deleted** — `deletedAt DateTime?` everywhere money is stored. No hard deletes.
- **accountId is the security boundary** — every read/write scoped, no cross-tenant access ever.
- **fiscal_month is computed once on write** — never re-derived at read time, prevents close-pack drift.
- **Compute tables are the dashboard's source of truth** — never read raw facts directly.

This command verifies a change doesn't violate any of these.

---

## Step 0 — Determine the change set

Same as `/qa-review` step 0.

---

## Step 1 — Schema-level invariants

```bash
node scripts/qa/check-schema.cjs 2>&1
```

Captures the structural rules. If this fails, every finding is at minimum **MAJOR**.

---

## Step 2 — Audit trail completeness

For every changed file in `src/backend/services/**`, `src/backend/routes/**`, `worker.ts`:

### 2a. Every state-mutating operation writes an AuditEvent
Search the diff for: `prisma\.\w+\.(create|update|delete|upsert)`. For each:
- Is there a corresponding `prisma.auditEvent.create({ ... })` in the same transaction?
- Does the audit event include: `actorId`, `entityType`, `entityId`, `before` JSON, `after` JSON?
- Is the audit event written INSIDE a `prisma.$transaction([...])` so it's atomic with the change?

Missing audit on a financial mutation = **BLOCKER**.

### 2b. AuditEvent never UPDATEd or DELETEd
```bash
git diff origin/$BASE...HEAD | grep -E "auditEvent\.(update|delete|deleteMany|upsert)"
```
Any hit = **BLOCKER**. Audit is append-only.

### 2c. before / after are full snapshots, not deltas
- Before snapshot: what the row looked like BEFORE the change.
- After snapshot: what the row looks like AFTER the change.
- If the change is a CREATE: before = null, after = full row.
- If DELETE (soft): before = full row, after = `{ ...before, deletedAt: <ts> }`.
- Partial / delta-only audit = **MAJOR** (breaks point-in-time reconstruction).

---

## Step 3 — Soft-delete coverage

### 3a. New financial models have deletedAt
Captured by `check-schema.cjs`. If schema check passed, this is OK.

### 3b. Queries respect deletedAt
For every changed file with `prisma.<model>.find`:
- Models with `deletedAt` field MUST include `where: { deletedAt: null }` (or use a default scope helper).
- A query that omits this returns soft-deleted records as if they exist = **MAJOR** (audit integrity issue).

```bash
# Sample heuristic — needs human review for context:
git diff origin/$BASE...HEAD | grep -A 5 "prisma\." | grep -E "find(Many|First|Unique)" | head -20
```

### 3c. Hard deletes never appear on financial models
```bash
git diff origin/$BASE...HEAD | grep -E "prisma\.(cashLedgerFact|providerEventFact|contract|mrr|reconciliation|revenueBridge|recognition|closePack|glJournal|subscription|invoice)\.(delete|deleteMany)"
```
Any hit = **BLOCKER**. Use `update({ data: { deletedAt: new Date() } })` instead.

---

## Step 4 — accountId boundary

### 4a. Every financial query is scoped
For every `prisma.<financialModel>.find/update/delete`:
- `where` clause MUST include `accountId: <session.accountId>`.
- accountId MUST come from the session (req.user / c.get), NEVER from request body / query.

Cross-tenant query path = **BLOCKER**.

### 4b. accountId comes from session
```bash
git diff origin/$BASE...HEAD | grep -E "accountId.*req\.body\.|accountId.*req\.query\.|accountId.*c\.req\.json\(\)"
```
Any match = **BLOCKER**. accountId is server-side only.

---

## Step 5 — fiscal_month invariants

### 5a. fiscal_month is computed on write, not read
For changed code that touches `fiscalMonth`:
- New rows: fiscal_month is set at INSERT time using `entity.fiscal_timezone`.
- Reads: the column is selected, NEVER recomputed in a query.
- **NEVER use `account.fiscal_timezone`** — multi-entity accounts have different fiscal calendars per entity.

### 5b. Close packs are sealed and never modified
- Once a `ClosePack` row exists for a `(accountId, entityId, fiscalMonth)`, it is read-only.
- Any code that updates a sealed close pack = **BLOCKER**.

---

## Step 6 — Compute tables are the dashboard's truth

### 6a. Dashboards / API responses don't read raw facts directly
Files in `src/pages/dashboard/**`, `src/backend/routes/dashboard*`, `src/backend/services/reporting*`:
- Reads come from `ReconciliationRun`, `RevenueBridgeRun`, `RecognitionRun`, `BeaconSnapshot`, `MrrSnapshot`, `CustomerMonthFact` — NOT from `CashLedgerFact` / `ProviderEventFact` / `ContractFact` directly.
- Direct raw-fact read in a dashboard query = **MAJOR**.

---

## Step 7 — Data retention

### 7a. No deletion of historical financial records
Any code path that genuinely deletes (not soft-deletes) a row >30 days old in a financial model = **BLOCKER**.

### 7b. Export requests are logged
New `ExportRequest` flows: every export is recorded with actor, what was exported, when.

---

## Step 8 — Output the compliance report

```
## Compliance Review — <PR or branch>

**Schema check:** <PASS/FAIL>
**Append-only audit:** <PASS/FAIL>
**Soft-delete coverage:** <PASS/FAIL>
**accountId scoping:** <PASS/FAIL>
**fiscal_month invariants:** <PASS/FAIL>
**Compute-layer reads:** <PASS/FAIL>

### Blockers (N)
[Rule | file:line] one-sentence finding + GAAP/audit impact

### Major (N)
...

### Minor (N)
...

### References
- See .claude/memory/project_data_hierarchy.md for the data hierarchy rules
- See .claude/memory/decision_database_architecture.md for soft-delete and audit decisions
```

Save to `/tmp/compliance-review-$(date +%s).md`.

---

## Final report

```
Compliance review complete:
  Files reviewed:        <N>
  Blockers:              <N>
  Major:                 <N>
  Schema check:          <PASS/FAIL>
  Audit-trail coverage:  <PASS/FAIL>
  Report saved:          /tmp/compliance-review-<ts>.md
```

Any Blocker = `❌ Do NOT push. Compliance gate failed — would break audit trail or cross-tenant boundary.`
Otherwise = `✅ Compliance review clean.`
