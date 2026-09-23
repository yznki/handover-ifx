---
title: 'AIDA vision and V1 definition'
description: 'AIDA vision and V1 definition'
order: 2
---

# AIDA vision and V1 definition

AIDA is Infineon's Veritas Post-Si plotting tool. The planning repository defines the target in plain words: version 1 is done when one engineer can run a whole real project analysis in AIDA, from raw measurement files to publication-ready plots, faster than the current Excel routine, without falling back to Excel.

## The product problem

The PRD says CV engineers currently post-process measurement results manually in Excel pivot charts. The effort estimate in the PRD is 0.5 to 0.75 person-months per engineer per project, across 90+ engineers and 50+ annual projects. A single PLL validation project can produce 100,000+ data points across hundreds of devices under temperature, voltage, and frequency conditions. This is why the AIDA flow is not a generic chart picker. The goal is to match the engineer's mental model: variables, conditions, devices, and plots.

## The product sentence

The PRD's core sentence is: AIDA is a data-first plotting engine that engineers can open in the browser, embed inside ValiBridge later, and eventually expose through other surfaces. AI assists; it never executes unsupervised.

That sentence creates two important constraints. First, the engine must be a real engine, not a UI-only workflow. Second, AI output must land in the same validated configuration shapes as manual actions. The LLM does not get a side channel.

## V1 workflow set

The V1 definition names the planning finish line as a set of workflows:

| Workflow | Covers | Status from planning sources |
| --- | --- | --- |
| Ingestion | Acquire, parse, combine, type, normalize, profile, handoff. | Planned and ticketed; Jira delivery active according to the planning README. |
| Transform | Live transform pipeline, reuse, validation, materialized output. | Planned and ticketed. |
| Plotting | Explore variables, shelves, suggestions, facets, styling. | Planned and ticketed. |
| Assistant | Chat over configuration surface and natural language to actions. | Next/un-grilled; POC is a directional draft. |
| Export and workspace | Export, save/load sessions, templates, tabs. | Backlog or partly pre-decided in planning. |
| Platform and identity | MIAMI SSO and user identity. | Planned and ticketed ahead of ValiBridge embedding. |

ValiBridge embedding is a delivery surface, not a V1 planning gate. That distinction matters: standalone AIDA can keep lightweight assumptions while embedded AIDA eventually inherits ValiBridge project context and permissions.

## Logic first, LLM last

The V1 definition states the most important design principle: deterministic in-app logic handles everything it can confidently handle; the LLM is a fallback for ambiguity. Axis suggestions, plot-type suggestions, known-column filtering, default encodings, and unit-based formatting are deterministic candidates. The LLM should only help when the deterministic path has low confidence or the request is genuinely open-ended.

Every LLM output must pass the same validation schema as a manual action. This is why prompt/schema drift is dangerous in the AIDA codebase. The model is told what tools exist in prompt prose, while Zod schemas validate what is accepted. Nothing in the type system links those two descriptions.

## Cut lines

The V1 definition deliberately cuts durable database persistence, real-time collaboration, desktop app, wafer maps, waveform columns, Draco2-grade recommender work, and full multi-user sharing. Those are not forgotten; they are carried forward by name. Standalone AIDA remains a single-engineer scratchpad until the plan says otherwise. Real sharing and permission depth should come from ValiBridge embedding rather than a standalone reinvention.

## KPIs

The PRD lists measurable targets: time-to-first-plot under two minutes, post-processing effort moving from 0.5-0.75 person-months to 0.25-0.35, natural language success rate above 70 percent, rising plot configuration reuse, 20 active engineers by Q4, and embedded parity by the end of September. Those are product targets, not proof that the current code already achieves them.

## Principles to keep applying

The planning context adds cross-workflow principles: advisory metadata never hard constraints, confidence-gated automation, one canonical internal model with adapters at the edges, host/scoping-agnostic engine design, accepted in-memory persistence for now, and explicit carry-forward of open items. The handover story compresses those ideas; this page is where the exact meaning lives.
