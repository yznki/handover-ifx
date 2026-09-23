---
title: 'CVC now and next'
description: 'CVC now and next'
order: 14
---

# CVC now and next

CVC is `@psvcommon/common-components`, the PSV shared Vue component library. The current `package.json` version is `0.3.0-develop.6`. It is published to the PSV Artifactory npm registry and consumed by multiple applications.

## Current package shape

The current package is one Nuxt module. Its `src/module.ts` sets aliases, pushes the CVC Tailwind CSS, installs Tailwind and generated exports, installs Pinia, and configures Vite dependency optimization around CKEditor. The CKEditor comments matter: `ckeditor5` and `ckeditor5-premium-features` are excluded from pre-bundling to avoid duplicated modules and excessive bundling; some CommonJS dependencies are included so they load correctly.

The verified component tree has 24 categories and 62 component folders under `src/runtime/components`. The README says the library provides 130+ production-ready components via a Nuxt module.

## Current dependency pain

The package dependencies include CKEditor 5, premium CKEditor features, Plotly, D3, FontAwesome Pro, Highlight.js, Pinia, and supporting packages. Because CVC is currently one package, consumers can inherit heavy dependency concerns even when they only need a smaller UI subset.

This is the practical problem behind the future idea. The goal is not to make the package structure prettier; it is to stop every consumer from paying for every family and to reduce high-maintenance development experience.

## Future idea: shape B

The decisions file names the target idea as shape B: pnpm plus Turborepo monorepo, `@psvcommon/ui` core, and family packages. The core would contain primitives, tokens, Tailwind preset, class-variance-authority patterns, and no heavy dependencies. Family packages would cover editor, charts, tables, tree, and similar groups. Heavy libraries become peer dependencies of the relevant family package.

This is explicitly Yazan's idea only. It is not approved. Sandro and Uqba decide package boundaries and pitch Kevin with logic.

## Migration path

1. Release `0.3.0` stable.
2. Create a Turborepo workspace with the existing package unchanged.
3. Extract the heaviest family first, likely editor, while the old package re-exports it.
4. Repeat family by family and deprecate the meta package at the end.
5. Use `valibridge-client` as the pilot consumer.

## Access notes

CKEditor license and FontAwesome Pro access sit with Kevin. Do not write license keys or credentials in documentation. Ask Kevin when a developer needs access.

## Local testing reminder

The handover decision says the local testing flow is: CVC playground, build local package through `prepack`, install local package in the consumer app, then test in the browser.

## Package boundary principle

Package boundaries should follow dependency gravity, not folder aesthetics. If a family needs CKEditor, Plotly, D3, or another large dependency, that family belongs outside the lightweight core. If a primitive is needed everywhere and has no heavy dependency, it belongs in the core. The pitch to Kevin should be framed around consumer cost, release safety, and maintainability rather than personal preference.

## Why not rewrite first

The agreed migration path keeps the current package alive while families move out. That matters because several applications are already on develop prereleases. A dramatic rewrite would create unnecessary migration risk. Incremental extraction lets the team keep releases flowing and prove the split with one pilot before widening the blast radius.
