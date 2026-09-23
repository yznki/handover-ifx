---
title: 'AIDA CI/CD'
description: 'AIDA CI/CD'
order: 3
---

# AIDA CI/CD

Current pipeline stages from `.gitlab-ci.yml`:

| Stage | What it does |
| --- | --- |
| `verify` | Node 22, pnpm install, Nuxt prepare, lint, typecheck. Runs on merge requests and branch pipelines. |
| `build` | Node 20, production build, stores `.output/` artifact. |
| `docker-build` | Build-only Docker validation for merge requests to develop or master. |
| `semantic-release` | Runs on develop and master, writes version artifact. |
| `docker-push` | Builds and pushes develop or master tags to Artifactory. |
| `oc-deploy` | Logs into OpenShift, ensures image pull and application secrets exist, then Helm deploys. |

Variables by name only: `DOCKER_AUTH_CONFIG`, `IMAGE_REGISTRY`, `NAMESPACE`, `OC_SA_TOKEN`, `OC_SERVER`, `DOCKER_USERNAME`, `DOCKER_PASSWORD`, `ARTIFACTORY_TOKEN`, `LITELLM_BASE_URL`, `LITELLM_API_KEY`, and environment-specific auth or database secrets referenced by the jobs.

Release rules: `develop` produces prereleases, `master` produces stable releases, and semantic-release backmerges master release preparation into develop.

Known quirks:

- The verify stage has lint and typecheck, but no test job.
- Deployment uses `oc login --insecure-skip-tls-verify`.

To debug a failed release, start with the semantic-release job output, check whether a version was produced, then check Docker push and Helm deploy artifacts. Do not paste token values into notes or tickets.
