---
title: 'CVC CI/CD and semantic-release'
description: 'CVC CI/CD and semantic-release'
order: 5
---

# CVC CI/CD and semantic-release

CVC pipeline stages from `.gitlab-ci.yml`:

| Stage | Jobs |
| --- | --- |
| `install` | pnpm install with Artifactory authentication and cache. |
| `validate` | lint and type-check, both currently advisory. |
| `test` | Vitest with coverage and JUnit reports. |
| `build` | `prepack` library build and optional showcase build. |
| `release` | semantic-release, package publishing, GitLab release metadata. |
| `docker-push` | Showcase image push when a release happened and showcase deploy is enabled. |
| `oc-deploy` | Showcase deploy when enabled. |

Variables by name only: `ARTIFACTORY_USERNAME`, `ARTIFACTORY_PASSWORD`, `GITLAB_TOKEN`, `DOCKER_AUTH_CONFIG`, `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `OC_SERVER`, `OC_SA_TOKEN`, `NAMESPACE`, and `SHOWCASE_DEPLOY_ENABLED`.

Release rules: `develop` creates prereleases such as `0.3.0-develop.6`; `master` creates stable releases. The package is pre-1.0, so never use `feat!`, `fix!`, or the literal `BREAKING CHANGE:` footer. Use `feat:` and write migration impact under a plain heading instead.

Showcase deploy is gated by `SHOWCASE_DEPLOY_ENABLED=true`.
