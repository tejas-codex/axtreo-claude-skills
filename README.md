# axtreo-claude-skills

Axtreo engineering rules + slash commands — installable in one command for every AI coding tool.

Works with: **Claude Code** · **OpenCode** · **Cursor** · **Windsurf** · **GitHub Copilot** · **OpenAI Codex**

---

## Quick start

```bash
# Claude Code / OpenCode — global install
npx github:tejas-codex/axtreo-claude-skills

# All tools in the current project directory
npx github:tejas-codex/axtreo-claude-skills --all-tools

# Everything: global Claude commands + skills + all tool adapters
npx github:tejas-codex/axtreo-claude-skills --skills --all-tools
```

Restart your AI tool. Done.

---

## Flags

| Flag | What it does |
|---|---|
| *(none)* | Install 17 slash commands globally to `~/.claude/commands/` (Claude Code + OpenCode) |
| `--skills` | Also install 5 custom skills to `~/.claude/skills/` (Claude Code) |
| `--project` | Install commands into `./.claude/commands/` (project-local, not global) |
| `--cursor` | Write `.cursor/rules/axtreo.mdc` (Cursor — always-on rules) |
| `--windsurf` | Append Axtreo rules to `.windsurfrules` (Windsurf) |
| `--copilot` | Write `.github/copilot-instructions.md` (GitHub Copilot) |
| `--codex` | Append Axtreo section to `AGENTS.md` (OpenAI Codex) |
| `--all-tools` | All of: `--cursor --windsurf --copilot --codex` |
| `--force` | Overwrite existing files without prompting |
| `--list` | Show everything that would be installed, then exit |
| `--help` | Show help |

---

## Per-tool instructions

### Claude Code (default)
```bash
npx github:tejas-codex/axtreo-claude-skills
```
Installs 17 commands to `~/.claude/commands/`. Restart Claude Code — commands appear under `/`.

To also install custom skills (caveman, prompt-framework, etc.):
```bash
npx github:tejas-codex/axtreo-claude-skills --skills
```

### OpenCode
Same as Claude Code — OpenCode reads `.claude/commands/` natively. No extra flag needed.

### Cursor
Run from your project root:
```bash
npx github:tejas-codex/axtreo-claude-skills --cursor
```
Creates `.cursor/rules/axtreo.mdc` with `alwaysApply: true` — Axtreo rules apply to every response automatically.

### Windsurf
Run from your project root:
```bash
npx github:tejas-codex/axtreo-claude-skills --windsurf
```
Appends Axtreo rules to `.windsurfrules`. Safe to run again — won't duplicate.

### GitHub Copilot
Run from your project root:
```bash
npx github:tejas-codex/axtreo-claude-skills --copilot
```
Creates `.github/copilot-instructions.md`. Copilot reads this as workspace context.

### OpenAI Codex
Run from your project root:
```bash
npx github:tejas-codex/axtreo-claude-skills --codex
```
Appends an Axtreo section to `AGENTS.md`. Safe to run again — won't duplicate.

### Every tool at once
```bash
npx github:tejas-codex/axtreo-claude-skills --skills --all-tools
```

---

## Commands installed (Claude Code / OpenCode)

| Command | What it does |
|---|---|
| `/feature-intel` | Pre-build intelligence — codebase + Jira + Confluence + competitor research + Class A/B/C/D |
| `/cr-review` | Full CodeRabbit review cycle — inventory → fix → commit → reply inline → wait for re-review |
| `/ship-cr` | Ship after CodeRabbit is clean |
| `/prs` | PR management (list, review, merge) |
| `/gaps-review` | Feature completeness gap analysis |
| `/security-review` | Security audit lens (auth, CORS, input validation, secrets) |
| `/compliance-review` | GDPR / regulatory compliance check |
| `/finance-review` | Financial accuracy review (GAAP, ASC 606, double-entry) |
| `/feature-review` | Competitor gap analysis scoped to the PR domain |
| `/perf-review` | Performance budget review (bundle, DB queries, P99) |
| `/pre-prod-review` | Pre-production readiness checklist |
| `/qa-review` | QA lens review |
| `/bypass-review` | Bypass risk analysis |
| `/sync-context` | Sync shared context across agents |
| `/axtreo` | Axtreo project context loader |
| `/axtreo-router` | Route prompts to the right sub-agent |
| `/PATTERNS` | Engineering patterns reference (auth, security, data) |

---

## Custom skills installed (Claude Code, `--skills` flag)

Skills are always-on context files loaded by Claude Code from `~/.claude/skills/`.

| Skill | What it does |
|---|---|
| `caveman` | Terse communication mode — drops articles/filler, fragments OK. `/caveman lite\|full\|ultra` |
| `prompt-framework` | Auto-applies the 5-part Axtreo prompt framework (Decision Gate → Role → Context → Framework → Constraints) |
| `multi-agent-brainstorming` | Structured design review with enforced roles (Designer → Skeptic → Constraint Guardian → User Advocate → Arbiter) |
| `startup-metrics-framework` | SaaS metrics analysis (MRR, ARR, churn, LTV, CAC, payback) |
| `graphify` | Codebase → knowledge graph → HTML + JSON + GRAPH_REPORT.md (trigger: `/graphify`) |

---

## What the rules encode

Every adapter (Cursor, Windsurf, Copilot, Codex) embeds the same core Axtreo engineering rules:

**Stack** — React 19 + TypeScript + Hono (Worker) + Prisma + PostgreSQL 16. Never suggest: Firebase Auth, Resend, SES, Render, Vercel, Fastify, SQLite for production, MongoDB.

**Golden rule** — `accountId` from session middleware only. Never from `req.body` or query params.

**Security** — No API keys in client code. Server-side validation on shape + type + length. CORS: named origins only. Soft delete financial records. AuditEvent is append-only.

**Design** — Warm cream palette: `#FAF8F3` background, `#E85820` accent, Tailwind `stone-*` only.

**Data** — Decimal for money. `$transaction()` for multi-step writes. `fiscal_month` computed on write. Dashboard reads from compute tables only (ReconciliationRun, RevenueBridgeRun).

**Workflow** — Branch → PR → merge. Never push to main. CodeRabbit reviews all PRs.

---

## Keeping up to date

This repo auto-syncs commands from `axtreo-app/.claude/commands/` on every merge to `main`. Re-run to pull latest:

```bash
npx github:tejas-codex/axtreo-claude-skills
```

Add `--force` to overwrite existing files.

---

## For new team members

Full install for a new machine:

```bash
# 1. Claude Code global commands + skills
npx github:tejas-codex/axtreo-claude-skills --skills

# 2. If using Cursor (run from repo root)
npx github:tejas-codex/axtreo-claude-skills --cursor

# 3. If using Windsurf (run from repo root)
npx github:tejas-codex/axtreo-claude-skills --windsurf
```

Restart your editor. You're set.
