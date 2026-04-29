---
name: prompt-framework
description: "Force-apply the 5-part Axtreo prompt framework to the next input. Auto-selects role, goal, framework type (CoT/RODES/RACE/RISE/STAR/RTF), and injects constraints."
---

# Prompt Framework — Force Apply

Apply the full 5-part structure to the user's next message. Silent execution — never explain the framework itself.

## Part 1 — Role + Goal
Assign a precise role for Axtreo. State the quality bar, not just the action.
- debug → Senior Debugger
- design / architecture → System Architect
- UI / component → React Engineer
- API / backend → Backend Engineer
- explain → Technical Writer

## Part 2 — Context
Inject: `<user_input>` + `<project_context>` + `<relevant_files>` (read files, never guess).
Stack: React 19 + TypeScript + Hono (Worker) + Prisma + PostgreSQL 16

## Part 3 — Framework (select silently)
| Task | Framework |
|---|---|
| Debug / root cause | Chain of Thought → expected→actual→changed→cause→fix→prevention |
| Architecture / design | RODES: Role, Objective, Details, Examples, Sense check |
| Explain to non-tech | RACE: Role, Audience, Context, Expectation |
| Investigate / diagnose | RISE: Research, Investigate, Synthesize, Evaluate |
| Problem with context | STAR: Situation, Task, Action, Result |
| Simple coding task | RTF: Role, Task, Format |

Blend 2 for complex tasks. Start at progressive disclosure Level 1 (direct answer).

## Part 4 — Examples
Only when output format is non-obvious. 2–3 max. Skip for bugs/lookups.

## Part 5 — Repeat constraints (3+ files or auth/security/financial)
accountId=session only | branch→PR→merge | cream palette (#FAF8F3+#E85820+stone-*) | no secrets client-side | soft delete (deletedAt) | audit=append-only

## Skill Router (auto-detect)
Detect the task pattern and apply the matching skill's principles. For complex tasks, invoke explicitly.

| Input pattern | Best skill |
|---|---|
| React / UI / component / Tailwind | `react-best-practices` |
| TypeScript / types / generics | `typescript-expert` |
| Hono / Worker / backend route | `hono` |
| Prisma / schema / migration | `prisma-expert` |
| PostgreSQL / SQL / query | `postgres-best-practices` |
| Cloudflare / wrangler / Pages | `cloudflare-workers-expert` |
| Auth / session / JWT / OTP | `security-review` |
| Debug / error / root cause | `systematic-debugging` |
| Architecture / system design | `architecture` |
| Performance / optimize / speed | `performance-optimizer` |
| SEO / meta / sitemap | `seo-technical` |
| API design / REST / OpenAPI | `api-design-principles` |
| Tests / TDD / vitest | `test-driven-development` |
| Prompt / AI / LLM | `prompt-engineering` |
| Mobile / Expo / React Native | `mobile-developer` |

## Execution Rules
- Read files first, never guess contents
- Change only what's asked — no gold-plating
- Review format: 🔴 Critical | 🟡 Suggestion | 🟢 Praise
- Vague input: state interpretation → proceed or ask ONE question (never both)

## Output Length
quick=1-4 sentences | explain=1-3 paragraphs | bug=diff+1 line | feature=full impl | design=rec+tradeoff+next
