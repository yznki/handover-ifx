---
title: 'AIDA architecture overview'
description: 'AIDA architecture overview'
order: 12
---

# AIDA architecture overview

AIDA is a Nuxt 4 monolith with three deliberately different layers. The architecture is easiest to understand as a data flow: a CSV upload becomes a column-oriented dataset, the server builds plot specifications from validated configuration, and the frontend renders those specifications with Plotly.

## Layer map

| Layer | Plain meaning | What lives there |
| --- | --- | --- |
| `shared/` | Framework-free engine | Dataset model, CSV ingestion, schema inference, statistics, transforms, plot builders, theme application, workspace schemas, and shared API types. |
| `server/` | API and business logic | Nitro routes, feature controllers, services, validation schemas, AI orchestration, recommendation service, and in-memory dataset repository. |
| `app/` | User interface | Pages, layouts, Pinia stores, composables, panels, configuration UI, AI assistant UI, Plotly rendering. |

The codebase-map in `docs/codebase-map` is the best reference for changes. It was written because AIDA has a few cross-layer structures where a local change can break another layer silently.

## shared layer

The `shared/core/model.ts` file defines the column-oriented dataset representation. Numeric columns are `Float64Array`, booleans are `Int32Array`, strings are arrays, and dictionary columns use dictionaries plus integer codes. Nulls are represented differently per vector kind, so transform code should use accessors like `getScalarValueAt` rather than reading raw values directly.

`shared/core/ingestion` parses CSV and infers schema. `shared/core/transform` contains filter, pivot, derive, sample, and materialization helpers. `shared/core/plots` owns plot types, role definitions, builders, registry, and theme application. The hard rule is that `shared/` must not import Vue, Nuxt, or server code.

## server layer

The intended server flow is route file → controller → service → repository. Routes touch h3 primitives and parse Zod schemas. Controllers are thin pass-throughs. Services do business logic. The dataset feature owns the only repository, an in-memory process singleton. Plot, transform, AI, and recommend services all depend on that dataset repository.

A key review rule from the codebase-map is that route handlers must `return await` inside `try` blocks. Returning a promise without awaiting can let async errors escape the catch and bypass the typed error mapping.

## app layer

The frontend uses Pinia stores for dataset state, layout/tabs, plot state, and workspaces. `useApi` is the only place that should call `$fetch` directly. Plot building flows through `plotStore.buildPlot`, which calls the server and then renders through `PlotView` and `Chart.vue`.

Workspace autosave watches multiple stores deeply, which is a future performance point to remember if tab state grows. Filtering also deserves attention: the plot path applies filters ephemerally during build, while transform endpoints can persist filtered datasets. Do not mix those models without deciding which one is intended.

## Cross-layer checklists

When adding or changing a plot type, expect to touch shared plot types, registry, role definitions, builders, server validation, AI prompt/schema descriptions, and frontend selection UI. When adding an endpoint, update the route, validation schema, controller/service, shared API types, and client API service. When changing transforms, confirm row counts and column vectors stay aligned.

## Known architecture landmines

| Landmine | Consequence |
| --- | --- |
| In-memory dataset repository | Restart loses uploads; multiple replicas would not share datasets. |
| No eviction or size cap | Uploads and persisted transform outputs can grow memory. |
| AI prompt/schema split | Prompt can describe tools the Zod schema does not accept, or the reverse. |
| Two filter models | Inline plot filters and persisted transform filters can drift. |
| Deep workspace watcher | Cost grows with tab count and configuration size. |

Start with `docs/codebase-map/README.md` and `data-flows.md` before touching any cross-layer area.
