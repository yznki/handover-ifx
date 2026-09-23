---
title: 'CVC showcase'
description: 'What the showcase branch contains, why it should be split, and how to avoid release confusion.'
order: 3
section: 'cvc'
owner: 'Sandro'
updated: '2026-09-23'
---

# CVC showcase

The CVC showcase is the live component browser for `@psvcommon/common-components`. It is a Nuxt SPA under `showcase/app/`, built from generated metadata plus hand-written fixtures.

## How components enter the showcase

`showcase/app/componentConfig.ts` exports `VISIBLE_COMPONENTS`, a `Set` of top-level component names. Sub-components such as row components or implementation details are intentionally excluded. When adding a new component, add the top-level component name there and add a realistic fixture in `showcase/app/componentFixtures.ts`.

The current visible list covers categories such as AccordionGroup, Branding, Charts, Clickables, Inputs, Layout, Modals, Notifications, Tables, Tooltips, and Tree. The decisions file verified 24 categories and 62 component folders in `src/runtime/components`.

## Fixtures

`componentFixtures.ts` is a map from component name to initial prop and model state. It also supports a special `_slots` key. Slot values can be literal HTML strings or functions receiving slot props. This is why the showcase can render realistic examples instead of empty type defaults.

Fixtures matter because the metadata generator can infer shapes, but it cannot know a meaningful example. For a chart, the fixture needs realistic data. For a dialog, it needs an open model state. For a content card, it needs action examples and slot content.

## Metadata generation

`build/generate-component-metadata.mjs` scans `src/runtime/components` recursively for Vue files, excluding story files. It extracts props, defaults, `defineModel` calls, and interface information, including sibling `.types.ts` files where needed. It writes `showcase/app/public/componentMeta.json`.

The generator includes logic for parsing balanced TypeScript blocks, cleaning JSDoc, normalizing default values, and evaluating safe default expressions. This is part of why CVC's coding conventions matter: clean props interfaces and multi-line JSDoc improve generated showcase metadata.

## Showcase build

`build/build-showcase.mjs` does two steps: generate component metadata, then run `nuxi generate showcase/app`. Output goes to `showcase/dist`. The GitLab pipeline has a `build-showcase` job that runs `pnpm run dev:prepare` and `pnpm run showcase:build` when `SHOWCASE_DEPLOY_ENABLED=true` on develop or master.

## Browser-only components

Some components use browser APIs or heavy client libraries, especially CKEditor-related components. CVC project memory says components that use browser APIs are wrapped in `ClientOnly`. Keep that pattern. The showcase is a browser tool, but Nuxt generation still needs server-safe rendering boundaries.

## Fixture quality

A showcase component is only useful if the fixture represents the shape a real consumer uses. Prefer small but believable fixtures over decorative placeholders. If a component needs asynchronous browser-only behavior, keep the example safe for static generation and use `ClientOnly` where the existing showcase pattern requires it.

## Metadata generator

The metadata generator is part of the showcase contract. When a category or component folder changes, regenerate metadata and confirm the showcase still lists the expected visible components. This is especially important after moving files, because broken discovery can make a component look deleted even when the source still exists.

## Deployment relationship

The package can release without a showcase deploy because the showcase path is gated separately. When `SHOWCASE_DEPLOY_ENABLED` is off, package consumers can still receive a new prerelease or stable package even though the public showcase remains unchanged.
