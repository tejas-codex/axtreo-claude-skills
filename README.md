# axtreo-claude-skills

Claude Code slash commands for the Axtreo team. One command installs all commands globally.

## Install (team members)

```bash
npx github:tejas-codex/axtreo-claude-skills
```

Restart Claude Code. All commands appear under `/`.

## Flags

```bash
# Install into current project only (.claude/commands/) instead of globally
npx github:tejas-codex/axtreo-claude-skills -- --project

# List commands without installing
npx github:tejas-codex/axtreo-claude-skills -- --list
```

## Commands installed

| Command | What it does |
|---|---|
| `/feature-intel` | Pre-build intelligence — domain research, lens analysis, Class A/B/C/D classification |
| `/cr-review` | Full CodeRabbit review cycle — fix all comments, push, reply inline |
| `/ship-cr` | Ship after CR is clean |
| `/prs` | PR management |
| `/gaps-review` | Feature completeness gap analysis |
| `/security-review` | Security audit lens |
| `/compliance-review` | GDPR / regulatory compliance check |
| `/finance-review` | Financial accuracy review (GAAP, ASC 606) |
| `/feature-review` | Competitor gap analysis for the PR domain |
| `/perf-review` | Performance budget review |
| `/pre-prod-review` | Pre-production readiness checklist |
| `/qa-review` | QA lens review |
| `/bypass-review` | Bypass risk analysis |
| `/sync-context` | Sync shared context across agents |
| `/axtreo` | Axtreo project context loader |
| `/axtreo-router` | Route prompts to the right Axtreo sub-agent |

## Keeping up to date

This repo auto-syncs from `axtreo-app/.claude/commands/` on every merge to main. Re-run the install command to get the latest.

```bash
npx github:tejas-codex/axtreo-claude-skills
```
