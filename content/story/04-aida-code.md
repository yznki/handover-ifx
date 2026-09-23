---
title: "The AIDA code shape."
description: "AIDA's verified architecture."
chapter: "04 / AIDA CODE"
order: 4
note: "Three layers. One contract."
beats:
  - statement: "AIDA is a Nuxt 4 monolith."
    support: "shared, server, and app are separate responsibilities."
    visual: "layer-cards"
  - statement: "shared is the engine."
    support: "Dataset model, ingestion, transforms, plot builders, theme logic, and API types."
    visual: "shared-core"
  - statement: "server is thin route → controller → service."
    support: "Datasets live in one in-memory repository; no database exists today."
    visual: "server-flow"
  - statement: "app owns the workspace experience."
    support: "Stores, composables, panels, Plotly rendering, and AI assistant UI."
    visual: "app-frame"
  - statement: "Cross-layer changes are where defects hide."
    support: "Plot types, endpoints, transforms, and AI schemas must move together."
    visual: "cross-layer"
links:
  - label: "Architecture overview"
    to: "/docs/aida-architecture"
---
