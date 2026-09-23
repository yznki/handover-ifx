---
title: 'CVC now and next'
description: 'CVC now and next'
order: 6
---

# CVC now and next

CVC is `@psvcommon/common-components`, version `0.3.0-develop.6` in `package.json`, with 24 categories and 62 component folders under `src/runtime/components`.

Current heavy dependencies include CKEditor 5 and premium features, Plotly, D3, FontAwesome Pro, Highlight.js, and Pinia. `src/module.ts` configures aliases, installs Tailwind and exports, installs Pinia, and adjusts Vite dependency optimization to avoid CKEditor duplicated-module and premium-feature bundling problems.

Verified local consumers from the decisions file: valibridge-client, lost-client, tim-client, jira-ai-client, instruments-client, editable-table, and legacy ai-plotting/dialogopenconcept/testEditor. AIDA is not a CVC consumer.

The future split is an idea only:

1. Release 0.3.0 stable.
2. Create a pnpm plus Turborepo workspace with the existing package unchanged.
3. Extract the heaviest family first, likely editor, while the old package re-exports.
4. Repeat family by family and deprecate the meta package last.
5. Pilot in valibridge-client.

Proposed target shape: `@psvcommon/ui` for primitives, tokens, Tailwind preset, and class-variance-authority; family packages for editor, charts, tables, tree, and similar groups; heavy libraries as peer dependencies of the family packages. Sandro and Uqba decide boundaries. The team pitches Kevin with logic before acting.
