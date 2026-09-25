---
title: 'Unfinished business'
description: 'The remaining handover tasks, owners, blockers, and the order that reduces release and access risk.'
order: 4
section: 'start'
owner: 'Sandro + Uqba'
updated: '2026-09-24'
---

# Unfinished business

This page expands the interactive checklist with context. It is grounded in the handover decisions file and avoids inventing owners or missing details.

::warning
The planning Jira token is tied to Yazan's personal Jira PAT according to the decisions file. Rotate the secret named `aida-planning-jira-token` in namespace `aida`; do not write the token value anywhere.
::

| Item | Owner | Context |
| --- | --- | --- |
| Review and merge [AIDA !50](https://gitlab.intra.infineon.com/ifx/des/dos-vv-psp/sw/ai/aida/aida-plotting/-/merge_requests/50) | Uqba | Standalone fix from former `showcase/aida-demo`: `fix/showcase-standalone-fixes`, "fix: skip database user sync in development auth mode". Targets `develop`; lint, typecheck, build, and tests passed. Not merged. |
| Review and merge [AIDA !51](https://gitlab.intra.infineon.com/ifx/des/dos-vv-psp/sw/ai/aida/aida-plotting/-/merge_requests/51) | Uqba | Onboarding tour from former `showcase/aida-demo`: `feat/onboarding-tour`, five tour commits plus an adaptation commit that uses `develop`'s existing single-file upload API instead of unfinished batch upload. Targets `develop`; lint, typecheck, build, and tests passed. Not merged. |
| Promote AIDA develop | Yazan | `develop` is ahead of master with `1.6.0-develop.1`, including the unit detection epic noted in the decisions file. |
| Release CVC 0.3.0 stable | Sandro | CVC develop is ahead of master; release stable before bigger split discussions. |
| Rotate planning Jira token | Kevin | Secret name `aida-planning-jira-token`, namespace `aida`, currently tied to Yazan's personal Jira PAT according to the decisions file. Do not write the token value. |
| Remind about VALIBRIDGE-3677 | Uqba | API branch `bugfix/VALIBRIDGE-3677` for duplicate user registration is pushed but not merged into develop. |
| Merge VALIBRIDGE-4026 epic | Sandro | Project phases epic is not merged to develop in client or API; Sandro owns it and knows what to do. |
| Merge [CVC !13](https://gitlab.intra.infineon.com/ifx/des/dos-vv-psp/sw/npm-packages/common-vue-components/-/merge_requests/13) | Uqba + Sandro | `docs: correct consumer list in agent instructions`; also fixes `.github/copilot-instructions.md`. Targets `develop`; not merged. |
| Plan Workflow 04 Assistant | Uqba | Use `aida-plan-workflow` and competitor research. Existing POC is a directional draft, not grilled. |
| Pitch CVC split | Sandro + Uqba | The split is Yazan's idea only. Package boundaries are for Sandro and Uqba to decide, then pitch Kevin with logic. |
| Track playground namespace expiry | Uqba · Kevin | `play-yazi-kamikazi` expires around 2026-12-22. |
| Friday walkthroughs | Yazan | Friday 25 walkthroughs: Uqba AIDA, then Sandro/Uqba CVC and CI/CD while they do a release. |
| Revoke PSV Labs build tokens | Yazan | Revoke the LiteLLM key and Artifactory token created for the PSV Labs build weekend before logging off on Monday. The app secret `labs-litellm` in `play-yazi-kamikazi` then stops working, and every Labs app falls back to rule-based logic. |
| Triage PSV Labs | Kevin | Try the fifteen prototypes on [/labs](/labs) and pick the ones worth promoting before the playground expires around 2026-12-22. |
| Namespace for promoted Labs apps | Kevin | The quota increase belongs to `play-yazi-kamikazi`. A promoted app needs its own namespace, a team LiteLLM key, MIAMI SSO and its LiveAdapter implemented. |

::note
The GitLab `showcase/aida-demo` branch has been deleted. Its unfinished ingestion and batch-upload work still lives on the dedicated branches and open merge request that already carried that work, including `epic/DCVSW-1131`, `feature/DCVSW-1137`, `feature/DCVSW-1146`, `epic/DCVSW-1133/1134`, and AIDA MR !49 for DCVSW-1133.
::

::tip
The local dead branches and stale stashes cleanup is done on Yazan's machine only. Nothing remote changed except deleting the GitLab `showcase/aida-demo` branch.
::

## What not to do

::warning
Do not turn the CVC split into an approved plan without Kevin. Do not write secret values into the handover. Do not recreate `showcase/aida-demo` as a long-lived integration branch. Do not let the planning Jira token die with Yazan's account.
::

## Why the checklist is localStorage

The checklist is intentionally local to the browser. It is a handover aid, not a replacement for Jira, GitLab, or project tracking. The durable facts live in this page and the decisions file; checkbox state is just a convenience during walkthrough week.

## Priority order

Start with items that can become account or release blockers: review and merge the two AIDA merge requests from the former showcase branch, rotate the planning Jira token, and release CVC stable before pitching the split. Then handle reminders. The ValiBridge items already have owners who know the context, so the handover risk is forgetting them rather than misunderstanding them.

## How to close an item

Close an item in the system that owns it. Branch work closes in GitLab. Token rotation closes in Kubernetes and access records. Workflow planning closes in the planning repository and tickets. The checklist checkbox only helps during the walkthrough.

## Do not over-coordinate

Each item has one owner or owner pair because too many watchers make handover ambiguous. If a task needs help, the owner can pull people in, but the owner remains responsible for deciding whether the item is actually finished.
