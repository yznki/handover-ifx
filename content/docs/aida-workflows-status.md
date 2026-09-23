---
title: 'AIDA workflows status'
description: 'AIDA workflows status'
order: 2
section: 'aida'
owner: 'Uqba'
updated: '2026-09-23'
---

# AIDA workflows status

This page summarizes where AIDA planning stands and where to look next. It is not a replacement for `CONTEXT.md`; it is a quick index for Uqba, Sandro, Josh, Fernando, and anyone reviewing the plan.

## Source files

| File or folder | Use it for |
| --- | --- |
| `CONTEXT.md` | Session memory, current architecture notes, planning method, principles, and session log. |
| `V1-DEFINITION.md` | The finish line for version 1 and cut lines. |
| `PRD.md` | Product problem, vision, phases, KPIs, risks. |
| `workflows/<nn>-<name>/decisions.md` | Resolved workflow decisions and diagram. |
| `workflows/<nn>-<name>/gap-analysis.md` | Current code versus target design. |
| `workflows/<nn>-<name>/tickets/` | One markdown file per ticket using `TICKET-SCHEMA.md`. |
| `workflows/<nn>-<name>/epics/` | One markdown file per epic, used by the hub timeline. |

## Status by workflow

| # | Workflow | Status | Where to look |
| --- | --- | --- | --- |
| 01 | Ingestion | Planned and ticketed; planning README says Jira delivery is active and five stories are closed. | `workflows/01-ingestion/` |
| 02 | Transform | Planned and ticketed; all stories and epics created in Jira according to the planning README. | `workflows/02-transform/` |
| 03 | Plotting | Planned and ticketed; all stories and epics created in Jira according to the planning README. | `workflows/03-plotting/` |
| 04 | Assistant | Next; POC exists as a directional draft, not a grilled decision record. | `workflows/04-assistant/` once Uqba plans it. |
| 05 | Platform / Identity | Planned and ticketed; MIAMI SSO and identity came ahead of ValiBridge embedding. | `workflows/05-platform/` |
| Export / Report | Backlog. | Future workflow folder once planned. |
| Workspace / sessions | Backlog, partly pre-decided by Transform. | Future workflow folder once planned. |
| ValiBridge embedding | Delivery surface, not V1 planning gate. | Future P1 track. |

## Ticket and epic identifiers

The planning schema uses internal ticket identifiers, not only Jira keys. Prefixes are defined in `TICKET-SCHEMA.md`:

| Prefix | Workflow |
| --- | --- |
| `ING` | ingestion |
| `TRF` | transform |
| `PLT` | plotting |
| `AST` | assistant |
| `EXP` | export/report |
| `WSP` | workspace |
| `VBE` | ValiBridge embedding |
| `HUB` | planning hub |

Jira keys live in ticket or epic frontmatter once exported. I am not inventing Jira ranges here. The source files contain the exact exported key if one exists; if the field is empty, treat the Jira issue as not linked from the planning repo yet.

## What Uqba should do next

The decisions file says Workflow 04 Assistant is the next un-grilled workflow. Uqba should use `aida-plan-workflow` and do competitor research. The existing Assistant POC should be treated as a directional draft, not an approved design.

## What Josh and Fernando need

Josh and Fernando are student interns, not domain experts. Tickets are deliberately written with plain-words introductions, concrete file paths, acceptance criteria, and verification steps. If a ticket assumes too much domain language, add a glossary term or rewrite the intro before handing it over.

## Where to continue

Workflow 04 Assistant is the next planning priority. The decisions file says Uqba should plan it with `aida-plan-workflow` plus competitor research. The existing proof of concept is only directional; it has not been grilled into tickets. That means the correct next step is not implementation. The correct next step is another planning session that challenges terminology, user journey, tool boundaries, and failure cases before any code is written.

## Status maintenance rule

When a workflow moves forward, update the workflow folder first, then update this handover page only if the site is still being used. The handover website is a snapshot for continuity. The planning repository is the durable source after handover week.
