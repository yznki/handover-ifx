---
title: 'Using aida-planning and the hub'
description: 'Using aida-planning and the hub'
order: 2
---

# Using aida-planning and the hub

Start with `CONTEXT.md`. It records what AIDA is, the current architecture, PRD vision, planning method, cross-workflow principles, workflow status, and session log. Treat it as memory, not automatic authority; verify load-bearing code facts in AIDA itself.

The planning workspace structure is:

| Path | Purpose |
| --- | --- |
| `CONTEXT.md` | Continuity thread and session log. |
| `PRD.md` | Product vision, users, phasing, risks, KPIs. |
| `V1-DEFINITION.md` | What version 1 means and which workflows complete it. |
| `workflows/` | Decisions, diagrams, gap analyses, tickets, and epics by workflow. |
| `TICKET-SCHEMA.md` | Canonical ticket and epic markdown schema. |
| `GLOSSARY.md` | Terms used by docs and hub hover tooltips. |
| `hub/` | Local/deployed planning hub. |

The deployed hub is read-only. Editing happens locally so markdown remains source of truth and local saves can commit under the editor's real git identity.

Use the skills deliberately:

- `aida-plan-workflow` plans the next workflow end to end.
- `aida-ticket` loads implementation-ticket context.
- `aida-code-review` reviews AIDA merge requests with codebase-map context.
