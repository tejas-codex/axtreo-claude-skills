# Sync Context

Manually sync the project context by scanning the codebase and updating CLAUDE.md.

## What This Does

1. Scans the codebase for: page count, route count, backend files, Prisma models, migrations
2. Checks key file existence (Pricing, Lifetime, Freelancer, Onboarding, Dashboard)
3. Detects integration status (real OAuth vs mock)
4. Identifies mock data usage
5. Updates the "Current State" section in CLAUDE.md with real scan results
6. Reports known gaps

## Instructions

Run the sync script:
```bash
bash .claude/hooks/sync-context.sh
```

Then read the updated CLAUDE.md to confirm the state is current.

If any information in CLAUDE.md is outdated or wrong beyond what the script detects, update it manually:
- Architecture decisions → `.claude/rules/architecture.md`
- Pricing decisions → `.claude/rules/pricing-context.md`
- Project context → `CLAUDE.md` (keep under 200 lines)

After syncing, briefly confirm to the user what changed.
