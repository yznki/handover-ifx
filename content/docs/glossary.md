---
title: 'Glossary'
description: 'Plain-language definitions for the handover terms that come up across AIDA, CVC, and ValiBridge.'
order: 1
section: 'reference'
owner: 'Team'
updated: '2026-09-23'
---

# Glossary

| Term | Plain meaning |
| --- | --- |
| AIDA | AI-Driven Data Analyzer, Infineon's Veritas Post-Si plotting tool. |
| CVC | `@psvcommon/common-components`, the shared PSV Vue component library. |
| HICP | Infineon's OpenShift hosting environment used by the apps and playground namespace. |
| semantic-release | A tool that reads Conventional Commits, determines a version, creates release notes/tags, and can publish packages. |
| prerelease | A version for an integration branch before stable release, such as `0.3.0-develop.6`. |
| Helm | Kubernetes packaging tool used by pipelines to deploy OpenShift resources. |
| Route | OpenShift resource that exposes a service on a hostname. |
| MIAMI SSO | Infineon's single sign-on identity system used in AIDA deployment planning. |
| LiteLLM | The proxy used by AIDA's AI feature. Only variable names and secret locations are documented here. |
| Turborepo | Monorepo build system proposed for the CVC split idea. |
| peer dependency | A dependency the consuming app must provide; useful for optional heavy families. |
| DAG | Directed acyclic graph; AIDA transform planning uses it for reusable pipelines. |
| vertical slice | A piece of work that crosses layers to deliver a user-visible outcome. |
| CV engineer | Characterization and validation engineer, the primary AIDA user. |
| DUT | Device under test: one physical chip being measured. |
| condition | A fixed test setting such as temperature, voltage, or frequency. |
| measurement | The result column, such as jitter, current, or delay. |
| ingestion | The path from raw file to typed, profiled dataset. |
| transform | Operations that reshape data before plotting. |
| encoding shelf | A slot that gives a variable a job in a plot, such as x axis or group. |
| LLM | Large language model. In AIDA, deterministic logic should act first and LLMs only through validated tools. |
| Zod | Runtime validation library used for AIDA API and AI tool contracts. |

## How to extend this glossary

Add terms when they reduce handover friction. Prefer plain meaning first, then the technical term. Do not add internal acronyms unless they appear in the project repositories, planning docs, or decisions file. If a term becomes important in a workflow, link it from the relevant long-form page so the reader can understand it in context.

## Terms that should stay out

Do not add secrets, host-specific credentials, personal contact details, or speculative future project names. A glossary is for shared language, not hidden configuration.

## Style guide

Glossary entries should be short enough to read in a tooltip and precise enough to stop a mistaken implementation. If the explanation needs several paragraphs, create a full Explore page and keep the glossary entry as the doorway. This keeps the command palette useful without turning search results into a second documentation system.

## Maintenance

When a term changes in the planning repository, update the glossary there first. This site is the handover snapshot. Long-term language belongs in `GLOSSARY.md`, workflow docs, and codebase maps.

## Review rule

Before adding a new acronym to a ticket or doc, check whether it is already in this glossary or in the planning glossary. If it is not, either write the plain phrase instead or add the term with a plain-language definition. This is especially important for student interns, because a technically correct acronym can still block understanding when the surrounding domain is new.
