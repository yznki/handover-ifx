---
title: 'CVC consumers'
description: 'Which applications rely on CVC today and what that means for release safety.'
order: 2
section: 'cvc'
owner: 'Sandro'
updated: '2026-09-23'
---

# CVC consumers

The decisions file includes a local scan of CVC consumers. The important conclusion is that CVC is shared by multiple PSV applications, but AIDA is not one of them. CVC documentation that lists AIDA as a consumer is wrong and appears in the checklist as a cleanup item.

## Verified consumer table

| Consumer | Package version from decisions file | Notes |
| --- | --- | --- |
| `valibridge-client` | `0.3.0-develop.6` | Main modern consumer and proposed pilot for the future split. |
| `lost-client` | `0.0.19-develop.305` | Pinned to a develop prerelease. |
| `tim-client` | `.295` | Pinned to a develop prerelease according to local scan. |
| `jira-ai-client` | `.288` | Pinned to a develop prerelease according to local scan. |
| `instruments-client` | `.264` | Pinned to a develop prerelease according to local scan. |
| `@pspm/editable-table` | `0.2.0-develop.4` as dev dependency | Uses host CVC at runtime; peer dependency should be declared. |
| legacy `ai-plotting`, `dialogopenconcept`, `testEditor` | not versioned in the decisions summary | Legacy consumers from the scan. |

Every listed active consumer is pinned to a develop prerelease. That is one reason the stable `0.3.0` release matters before bigger package-shape conversations.

## Why the consumer list matters

A single CVC change can affect many applications. The current package includes heavy dependencies such as CKEditor, premium CKEditor features, Plotly, D3, FontAwesome Pro, Highlight.js, and Pinia. Because they are dependencies of the single package, consumers can pay for libraries they do not directly use. `src/module.ts` also contains Vite optimization decisions that exist specifically to avoid CKEditor duplicated-module and premium bundling problems.

That is the core pain behind the proposed split: not aesthetics, but developer experience and dependency boundaries.

## editable-table note

The decisions file calls out `@pspm/editable-table` specifically. It has CVC only as a development dependency and uses the host application's CVC at runtime. The decision is not to force a release just for this note. The right cleanup is to declare a peer dependency range so breaking CVC changes cannot silently break editable-table. In the future split, editable-table should consume `@psvcommon/ui`.

## AIDA is not a consumer

AIDA has its own UI primitives under `app/components/ui`. This matters for handover accuracy. Do not plan a CVC migration for AIDA unless the codebase changes later and someone verifies that relationship again.

## How to use the table

Use this page to answer two questions quickly: which applications can be affected by a CVC change, and which prerelease line they currently follow. It is not a live dependency scanner. Before changing a shared component, open the actual consumer repository and verify the package version in its lockfile or manifest. The decisions file is the handover snapshot; consumer repositories are the current technical truth.

## AIDA correction

AIDA is intentionally called out because a stale CVC memory file listed it as a consumer. That is wrong. AIDA has its own UI components and does not consume CVC. Fixing that stale note is in the checklist so future reviews do not waste time following a false dependency edge.

## Release communication

For CVC changes that affect a family used by several applications, write the release note in consumer language. Name what changed, which component family is affected, and whether the consumer must change code. Keep the dependency version table close by so reviewers can judge who needs testing before master release.
