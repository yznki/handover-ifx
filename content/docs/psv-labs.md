---
title: 'PSV Labs'
description: 'Fifteen prototype internal tools built as a farewell, what they are for, and how to decide which ones to keep.'
order: 2
section: 'reference'
owner: 'Kevin'
updated: '2026-09-25'
---

# PSV Labs

PSV Labs is a suite of fifteen prototype internal tools for the Post-Silicon Validation team, built during the final handover weekend. The live overview with status, links and known gaps is at [/labs](/labs).

## Why it exists

Two years of AIDA, ValiBridge, CVC, LOST and TDEX work left a clear map of where engineers still lose time. Examples: campaign planning in Excel, bench availability kept in people's heads, traceability that only lives in tables, margins computed by hand, failure knowledge scattered across Jira and chat, and releases that break consumers silently. Each Labs app targets exactly one of those gaps. Some complement an existing tool and some deliberately reimagine one.

## The fifteen

| App | For | In one line |
| --- | --- | --- |
| SweepSmith | CV engineers, leads | Plans characterization campaigns and minimises chamber time. |
| BenchPulse | Engineers, lab coordinators | Live lab twin: benches, instruments, calibration, bookings. |
| Threadline | Engineers, auditors | Measurement lineage from report cell back to DUT and instrument. |
| Headroom | Engineers, product engineers | Margin and Cpk against every spec, per silicon step. |
| Constellation | Leads, requirement owners | Visual traceability where every coverage gap glows. |
| Oddity | CV engineers | Anomaly pre-flight before plotting in AIDA. |
| Tracepoint | Engineers debugging | Synchronized multi-signal timeline for bench debugging. |
| Benchbook | Engineers at the bench | Hands-free lab notebook with config-drift diff. |
| Déjà Vu | Everyone triaging failures | Finds similar past failures and what fixed them. |
| Rosetta | Engineers, data stewards | Canonical measurement names, units and sentinel codes. |
| PhaseShift | Leads, managers | Probabilistic phase forecasts and silicon-slip what-ifs. |
| Busfactor | SW team, team lead | Knowledge concentration map and onboarding journeys. |
| Driftwatch | SW team | Package drift, release readiness and pipeline failure explainer. |
| PromptProof | SW team building AI | Prompt/schema contract tests and model evaluations. |
| Hyperjump | Everyone | Ctrl K federated search across every PSV tool. |

## Shared rules every app follows

Every app uses the team's stack (Nuxt 4, TypeScript, Tailwind, cva, Zod, Pinia) and the team's coding conventions. The domain logic lives in a framework-free `shared/` engine with unit tests. The rule is logic first, LLM last: AI features call LiteLLM through the server only, validate every response with Zod, and fall back to rule-based behaviour when the key is missing or the model fails.

All data is seeded and deterministic. No app calls Jira, GitLab, ValiBridge or any other internal system. Each one has a `LiveAdapter` stub whose documentation names the exact system, endpoint, auth model and owner it would need in production.

## Where things live

| Thing | Location |
| --- | --- |
| Repositories | GitLab group `ifx/des/dos-vv-psp/sw/labs`, private, inherited from `sw`. |
| Hosting | Namespace `play-yazi-kamikazi` on EU-AT-4, one Deployment, Service and Route per app. |
| AI credentials | Secret `labs-litellm` in the same namespace. It stops working when the build tokens are revoked. |
| Expiry | Everything expires with the playground around 2026-12-22. |

## How to decide what to keep

Open each app from [/labs](/labs), follow the "wow" demo script in its README, and ask two questions. Does it remove a pain an engineer feels every week? Does its LiveAdapter depend on systems the team can actually get access to? Promote the two or three that clearly pass into a real namespace, with MIAMI SSO, a team LiteLLM key and the LiveAdapter implemented. Let the rest expire; the repositories stay as a record.

::note
Labs apps are prototypes with seeded data and in-memory state. A restart resets anything a visitor created. That is intentional, and every README says so.
::
