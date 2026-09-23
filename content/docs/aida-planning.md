---
title: 'Using aida-planning and the hub'
description: 'How the planning repository, hub service, and assistant skills turn workflow decisions into implementation tickets.'
order: 6
section: 'aida'
owner: 'Uqba'
updated: '2026-09-23'
---

# Using aida-planning and the hub

The planning repository is the durable memory for AIDA's redesign. It exists so a future session does not need to rediscover why a workflow was shaped a certain way.

## Start order

1. Read `CONTEXT.md` first.
2. Read `V1-DEFINITION.md` for the finish line.
3. Read `PRD.md` for the product problem and phasing.
4. Open the relevant `workflows/<nn>-<name>/` folder.
5. Verify any implementation fact in the real AIDA codebase before acting.

`CONTEXT.md` is memory, not automatic authority. The `aida-plan-workflow` skill explicitly warns against anchoring bias: prior decisions are inputs to reason from, not conclusions to defend.

## Folder anatomy

| Path | Purpose |
| --- | --- |
| `CONTEXT.md` | Continuity, current architecture notes, principles, workflow history, session log. |
| `PRD.md` | Product vision, problem, users, phasing, KPIs, risks. |
| `V1-DEFINITION.md` | Explicit V1 finish line and cut lines. |
| `GLOSSARY.md` | Plain-language terms used by docs and hub tooltips. |
| `TICKET-SCHEMA.md` | Machine-readable ticket and epic format. |
| `workflows/` | Decisions, diagrams, gap analyses, tickets, epics, and POCs. |
| `hub/` | The planning hub web app over the markdown. |

## Hub model

The deployed planning hub is read-only. Editing happens locally so files remain source of truth and saves can commit under the editor's real Git identity. The hub can read ticket files, epics, docs, diagrams, glossary entries, and live Jira status overlay, but it does not own the data.

The deployment is in the shared `aida` namespace. `hub/SPEC.md` records that a dedicated namespace was tried and rejected because the CI service account token only had access to `aida`.

## Skills

| Skill | Use it for |
| --- | --- |
| `aida-plan-workflow` | Plan a new workflow end to end: context, code grounding, grilling, decisions, diagram, gap analysis, tickets, and session log update. |
| `aida-ticket` | Load implementation context for AIDA tickets from the older AIDA plan format. |
| `aida-code-review` | Review AIDA merge requests with the codebase-map and calibrated review rules. |
| `coding-conventions` | Apply Yazan's coding rules: no abbreviations, JSDoc, cva for conditional classes, explicit refs, no `any`. |
| `grill-me` | Interview a plan one question at a time with recommended answers. |

## Ticket format

Tickets are one markdown file each under `workflows/<workflow>/tickets/`. They have frontmatter for identifier, title, workflow, side, status, version, epic, estimate, assignee, dependencies, priority, and Jira fields. The body is written for student interns: plain words first, then summary, why, code locations, scope, acceptance criteria, and verification steps.

Do not invent fields without updating `TICKET-SCHEMA.md` and the hub parser together.

## Practical editing loop

When editing the planning repository, treat markdown files as code. Make one coherent change, keep ticket frontmatter valid, and check links between decisions, gap analysis, epics, and tickets. The hub is useful for navigation and review, but the repository remains the system of record. If a ticket changes shape, update the corresponding epic and any workflow status page so the next person does not have to reconcile stale summaries by hand.

## Session log discipline

The planning workflow appends a session-log entry so future sessions start with context instead of interrogation. That log should record decisions, rejected options, unresolved questions, and where verification happened in the real AIDA codebase. It should not become a diary. The useful version is terse, factual, and linked to files.
