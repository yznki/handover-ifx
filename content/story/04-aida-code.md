---
title: 'The AIDA code shape.'
description: 'The AIDA code shape.'
chapter: '04 / AIDA CODE'
order: 4
note: 'Three layers. One contract.'
links: [{ label: "AIDA architecture", to: "/docs/aida-architecture" }, { label: "AIDA CI/CD", to: "/docs/cicd-aida" }]
---

AIDA is a Nuxt 4 monolith with three layers. `shared/` is pure TypeScript for the dataset model, ingestion, transforms, plot builders, theming, and shared API types. `server/` is Nitro routes through controllers and services. `app/` is the Nuxt frontend with stores, composables, and components.

Datasets live in a process-level in-memory repository. That is important: a restart loses data, and multiple replicas would not share uploads. The codebase-map calls this out as a real landmine.

The cross-layer checks matter most around plot types, endpoints, transforms, and schema inference. A locally sensible change can break a caller several layers away.
