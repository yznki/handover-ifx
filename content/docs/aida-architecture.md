---
title: 'AIDA architecture overview'
description: 'AIDA architecture overview'
order: 1
---

# AIDA architecture overview

AIDA is Infineon's Veritas Post-Si plotting tool. The verified repository shape is a Nuxt 4 monolith with three layers:

| Layer | Plain meaning | What lives there |
| --- | --- | --- |
| `shared/` | Framework-free engine | Dataset model, CSV ingestion, transforms, plot builders, theming, workspace schema, shared API types. |
| `server/` | API and business logic | Nitro routes, controllers, services, validation schemas, feature modules, in-memory dataset repository. |
| `app/` | User interface | Pages, layouts, Pinia stores, composables, feature components, Plotly rendering. |

The load-bearing facts from `docs/codebase-map` are the ones worth remembering:

- There is no database; datasets live in an in-process singleton repository.
- Route handlers must `return await` inside `try` so mapped errors actually reach `mapErrorToHttpError`.
- Plot-type changes move through the shared registry, server validation, AI prompt/schema contract, and frontend controls together.
- Filter has two models: inline ephemeral filter for plot builds and persisted transform endpoint that creates a new dataset.
- AI prompt prose and Zod validation are unlinked, so both sides must change together.

Source files to open first: `docs/codebase-map/README.md`, `data-flows.md`, `shared-layer.md`, `server-layer.md`, and `frontend-layer.md` in the AIDA repository.
