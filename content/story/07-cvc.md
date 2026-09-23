---
title: 'CVC now, then maybe split.'
description: 'CVC now, then maybe split.'
chapter: '07 / CVC'
order: 7
note: 'Idea only. Pitch it.'
links: [{ label: "CVC now and next", to: "/docs/cvc-now-and-next" }, { label: "CVC CI/CD", to: "/docs/cicd-cvc" }]
---

CVC is `@psvcommon/common-components`, one Nuxt module with 24 component categories and 62 component folders in `src/runtime/components`. It currently ships heavy dependencies through one package: CKEditor, premium CKEditor features, Plotly, D3, FontAwesome Pro, Highlight.js, and Pinia.

The pain is slow and high-maintenance developer experience for every consumer. The future shape is an idea, not an approved plan: pnpm plus Turborepo, a light `@psvcommon/ui` core package, and family packages for editor, charts, tables, tree, and similar areas. Heavy libraries become peer dependencies of the relevant family package.

The agreed migration path is incremental: release 0.3.0 stable; create a Turborepo workspace with the existing package unchanged; extract the heaviest family first, probably editor, with the old package re-exporting; repeat family by family; then use valibridge-client as the pilot. Sandro and Uqba decide boundaries, and the team pitches the logic to Kevin before treating this as approved.
