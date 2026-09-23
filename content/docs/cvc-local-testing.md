---
title: 'Test a CVC change inside a consumer app'
description: 'Test a CVC change inside a consumer app'
order: 15
---

# Test a CVC change inside a consumer app

Testing CVC in isolation is not enough. Because CVC is a shared Nuxt module, the final confidence check is inside a real consumer app.

## Flow

| Step | Command or action | Purpose |
| --- | --- | --- |
| 1 | Run the CVC playground. | Verify the component behavior in the package development environment. |
| 2 | Run the CVC build through `prepack`. | Produce the local package output the consumer will install. |
| 3 | Install the local package in the consumer. | Test the built package shape, not only source files. |
| 4 | Run the consumer application. | Verify browser behavior in the real app context. |
| 5 | Watch for dependency and optimization issues. | CKEditor and other heavy libraries are sensitive to bundling and duplicated modules. |

## CVC commands

From the CVC README and package scripts:

```powershell
pnpm install
pnpm run dev:prepare
pnpm run dev
pnpm run prepack
pnpm run showcase
pnpm run showcase:build
```

Use the commands that match the task. `dev:prepare` generates stubs and prepares playground/showcase. `prepack` runs generated exports and `nuxt-module-build`. The showcase build uses `build/build-showcase.mjs`, which regenerates metadata before running Nuxt generation.

## Consumer verification

Pick the consumer that actually uses the component family you changed. For editor changes, `valibridge-client` is often the important verification target because it consumes the latest develop prerelease from the decisions file. Install the local package in that consumer, run the app, and test the exact screen that uses the component.

## editable-table caveat

`@pspm/editable-table` currently has CVC as a development dependency and uses the host's CVC at runtime. That means a CVC breaking change can silently affect editable-table. The decision is not to force a release only for that, but to declare an appropriate peer dependency range and later consume `@psvcommon/ui` in the split shape.

## What counts as done

A CVC change is not ready just because the package builds. It should work in playground, build through `prepack`, install into a relevant consumer, and pass browser testing in that consumer. If the change affects release behavior, also verify semantic-release commit format and avoid pre-1.0 major bump syntax.

## Browser-first acceptance

A local package install should end with browser acceptance, not only a terminal build. Check the exact interaction that changed, then check one neighboring interaction that shares the same component family. For table/editor work, also check initial render, edit state, save or emit behavior, and refresh/reopen behavior if the consumer app supports it.

## Keep the install reversible

Local package testing changes the consumer workspace. Keep the change easy to revert after the test. Do not commit a local file path dependency in a consumer application. The committed dependency should remain the Artifactory package version chosen by that project.

## When to test more than one consumer

Test a second consumer when the changed component is used in different contexts or when the dependency family is heavy. Editor, plotting, table, and tree changes can behave differently depending on host application configuration. A small visual primitive can usually be verified in one representative consumer plus the playground.
