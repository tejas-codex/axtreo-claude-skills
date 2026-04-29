# /axtreo

Route any request through an Axtreo-first orchestrator that auto-selects the best skills for the job.

## Input

`$ARGUMENTS`

## Rules

1. Always load `@axtreo` first.
2. Then autonomously select any additional best-fit skills needed to execute well.
3. Prefer minimal skill set (1-3 supporting skills) to avoid noisy routing.
4. If coding work is requested, execute with safe defaults and include verification.

## Router Behavior (Axtreo-First, Best-Skill Selection)

Map the request to one primary scope:
- Reconciliation Layer
- Trust Mapping Engine
- Close Status / Close Pack
- Recognition Engine
- Credits Engine
- Multi-Entity / Consolidation
- Integration Sync
- Audit / Evidence
- Product Strategy / Competitive

Then choose supporting skills based on intent:
- Implementation: `test-driven-development`, `lint-and-validate`
- API/Auth: `api-endpoint-builder`, `auth-implementation-patterns`, `api-security-best-practices`
- Debugging: `debugging-strategies`, `systematic-debugging`
- Frontend: `frontend-developer`, `react-patterns`
- Architecture: `architecture`, `software-architecture`
- Database: `postgresql`, `database-design`

If request is pure product/domain reasoning, keep it `@axtreo` only.

## Output Format

Return exactly:

1. `Intent`
2. `Axtreo Scope`
3. `Skill Plan` (which skills and why)
4. `Execution Plan`
5. `Verification`
6. `Risks`

Then proceed with execution if the request is implementation-oriented.
