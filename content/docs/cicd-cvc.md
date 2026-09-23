---
title: 'CVC CI/CD and semantic-release'
description: 'How CVC verifies, releases, publishes packages, and deploys the showcase from GitLab CI.'
order: 4
section: 'cvc'
owner: 'Sandro'
updated: '2026-09-23'
---

# CVC CI/CD and semantic-release

This page documents the current `@psvcommon/common-components` pipeline. It does not propose a future pipeline.

## Variables by name

| Variable | Purpose |
| --- | --- |
| `ARTIFACTORY_USERNAME`, `ARTIFACTORY_PASSWORD` | npm install and publish authentication. |
| `GITLAB_TOKEN` | semantic-release push/tag and GitLab release token. |
| `DOCKER_AUTH_CONFIG` | Docker auth for showcase build/push. |
| `DOCKER_USERNAME`, `DOCKER_PASSWORD` | Image pull secret credentials. |
| `OC_SERVER`, `OC_SA_TOKEN` | OpenShift deploy login. |
| `NAMESPACE` | Showcase namespace, documented as `lost`. |
| `SHOWCASE_DEPLOY_ENABLED` | Gate for showcase build, push, and deploy jobs. |
| `IMAGE_REGISTRY` | Artifactory showcase image path. |
| `NODE_IMAGE` | Node base image from the Infineon mirror. |

## Jobs

| Job | Stage | When it runs | What it does |
| --- | --- | --- | --- |
| `install` | install | Merge requests, develop, master. | Installs pnpm 10, writes npm auth by variable name, runs `pnpm install --frozen-lockfile`. |
| `lint` | validate | Merge requests, develop, master. | Runs `pnpm run lint`; currently advisory via `allow_failure`. |
| `type-check` | validate | Merge requests, develop, master. | Runs `dev:prepare` and `test:types`; currently advisory. |
| `test` | test | Merge requests, develop, master. | Runs Vitest report with coverage and JUnit artifacts. |
| `build` | build | Merge requests, develop, master. | Runs `pnpm run prepack` and stores `dist/`. |
| `semantic-release` | release | develop and master. | Runs semantic-release, publishes to Artifactory only if a new tag appears, writes `VERSION` and `RELEASED`. |
| `build-showcase` | build | develop/master when showcase deploy is enabled. | Runs `dev:prepare` and `showcase:build`, stores `showcase/dist/`. |
| `docker-push-develop` | docker-push | develop when showcase deploy is enabled. | Pushes `${VERSION}-develop` and `develop` showcase images if released. |
| `docker-push-master` | docker-push | master when showcase deploy is enabled. | Pushes `${VERSION}` and `latest` showcase images if released. |
| `deploy-develop` | oc-deploy | develop when showcase deploy is enabled. | Helm deploys `common-components-showcase-develop`. |
| `deploy-master` | oc-deploy | master when showcase deploy is enabled. | Helm deploys `common-components-showcase`. |

## Release rules

CVC uses Conventional Commits through semantic-release. `develop` creates prereleases such as `0.3.0-develop.6`; `master` creates stable releases. The package is intentionally still pre-1.0. Do not use `feat!`, `fix!`, or the literal `BREAKING CHANGE:` footer, because semantic-release would treat that as a major bump to 1.0.0. When a change affects consumers, use a normal `feat:` and describe migration impact under a plain heading such as `Migration notes for consuming applications:`.

## Showcase gate

The showcase build/push/deploy path is wired but dormant until `SHOWCASE_DEPLOY_ENABLED=true`. This means package release and showcase deployment are related but separately gated. If a package release succeeds and the showcase does not update, check the gate before investigating Helm.

## Debugging package versus showcase

Separate package release failures from showcase deployment failures. The package release path depends on install, validation, build artifacts, semantic-release, and Artifactory npm publish. The showcase path depends on `SHOWCASE_DEPLOY_ENABLED`, showcase build output, Docker image push, OpenShift credentials, Helm values, and route availability. A broken showcase should not automatically imply a broken package release.

## Consumer safety check

After a release candidate, verify the package in at least one real consumer before treating the release as safe for the team. The decisions file names `valibridge-client` as the practical pilot for CVC work. If a change touches editor dependencies, also remember the CKEditor optimization rules in `src/module.ts` because duplicate CKEditor modules can fail in ways that only appear in the browser.

This is the place where pipeline success and product safety separate. Green CI proves the package was built and published; a consumer check proves the browser still renders the shared components.
