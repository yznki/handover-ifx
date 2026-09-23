---
title: 'Unfinished business'
description: 'The remaining handover tasks, owners, blockers, and the order that reduces release and access risk.'
order: 4
section: 'start'
owner: 'Sandro + Uqba'
updated: '2026-09-23'
---

# Unfinished business

This page expands the interactive checklist with context. It is grounded in the handover decisions file and avoids inventing owners or missing details.

::warning
The planning Jira token is tied to Yazan's personal Jira PAT according to the decisions file. Rotate the secret named `aida-planning-jira-token` in namespace `aida`; do not write the token value anywhere.
::

| Item | Owner | Context |
| --- | --- | --- |
| Split `showcase/aida-demo` | Yazan | The branch is pushed, not deployed, and ahead of develop with unfinished feature work plus onboarding tour commits. Split into standalone fixes and onboarding tour merge requests, then delete showcase. |
| Promote AIDA develop | Yazan | `develop` is ahead of master with `1.6.0-develop.1`, including the unit detection epic noted in the decisions file. |
| Release CVC 0.3.0 stable | Sandro | CVC develop is ahead of master; release stable before bigger split discussions. |
| Rotate planning Jira token | Kevin | Secret name `aida-planning-jira-token`, namespace `aida`, currently tied to Yazan's personal Jira PAT according to the decisions file. Do not write the token value. |
| Remind about VALIBRIDGE-3677 | Uqba | API branch `bugfix/VALIBRIDGE-3677` for duplicate user registration is pushed but not merged into develop. |
| Merge VALIBRIDGE-4026 epic | Sandro | Project phases epic is not merged to develop in client or API; Sandro owns it and knows what to do. |
| Fix CVC CLAUDE.md consumer list | Sandro | It wrongly lists AIDA as a CVC consumer. AIDA uses its own UI components. |
| Delete dead local branches and stashes | Yazan | Cleanup happens after site build: local-only branches and stale stashes from AIDA, CVC, ValiBridge client/API. |
| Plan Workflow 04 Assistant | Uqba | Use `aida-plan-workflow` and competitor research. Existing POC is a directional draft, not grilled. |
| Pitch CVC split | Sandro + Uqba | The split is Yazan's idea only. Package boundaries are for Sandro and Uqba to decide, then pitch Kevin with logic. |
| Track playground namespace expiry | Uqba, Kevin backup | `play-yazi-kamikazi` expires around 2026-12-22. |
| Friday walkthroughs | Yazan | Friday 25 walkthroughs: Uqba AIDA, then Sandro/Uqba CVC and CI/CD while they do a release. |

## What not to do

::warning
Do not turn the CVC split into an approved plan without Kevin. Do not write secret values into the handover. Do not keep `showcase/aida-demo` as a long-lived integration branch. Do not let the planning Jira token die with Yazan's account.
::

## Why the checklist is localStorage

The checklist is intentionally local to the browser. It is a handover aid, not a replacement for Jira, GitLab, or project tracking. The durable facts live in this page and the decisions file; checkbox state is just a convenience during walkthrough week.

## Priority order

Start with items that can become account or release blockers: rotate the planning Jira token, split the showcase branch before it grows stale, and release CVC stable before pitching the split. Then handle reminders and cleanup. The ValiBridge items already have owners who know the context, so the handover risk is forgetting them rather than misunderstanding them.

## How to close an item

Close an item in the system that owns it. Branch work closes in GitLab. Token rotation closes in Kubernetes and access records. Workflow planning closes in the planning repository and tickets. The checklist checkbox only helps during the walkthrough.

## Do not over-coordinate

Each item has one owner or owner pair because too many watchers make handover ambiguous. If a task needs help, the owner can pull people in, but the owner remains responsible for deciding whether the item is actually finished.
