---
title: 'AIDA CI/CD'
description: 'AIDA CI/CD'
order: 7
---

# AIDA CI/CD

This page documents the current AIDA pipeline only. It does not propose a future CI/CD roadmap.

## Global variables by name

| Variable | Purpose |
| --- | --- |
| `GIT_DEPTH` | Full history for semantic-release and tags. |
| `DOCKER_TLS_CERTDIR`, `DOCKER_CERT_PATH`, `DOCKER_TLS_VERIFY`, `DOCKER_BUILDKIT` | Docker-in-Docker configuration. |
| `IMAGE_REGISTRY` | Artifactory image path for AIDA. |
| `NAMESPACE` | OpenShift namespace, currently `aida`. |
| `OC_SA_TOKEN` | Service account token stored in GitLab CI variables. |
| `OC_SERVER` | OpenShift API server URL stored in GitLab CI variables. |
| `DOCKER_AUTH_CONFIG`, `DOCKER_USERNAME`, `DOCKER_PASSWORD` | Docker registry authentication and pull secret values. |
| `ARTIFACTORY_TOKEN` | Build argument used by Docker build jobs. |
| `LITELLM_BASE_URL`, `LITELLM_API_KEY` | Application AI configuration passed into Kubernetes secret creation. |

No secret values belong in documentation.

## Jobs

| Job | Stage | When it runs | What it does |
| --- | --- | --- | --- |
| `verify` | verify | Merge requests and branch pipelines. | Node 22 image, corepack pnpm 9, install, Nuxt prepare, lint, typecheck. |
| `build` | build | Default branch pipeline behavior. | Node 20 image, install, production build, uploads `.output/` for one day. |
| `docker-build` | docker-build | Merge requests targeting develop or master. | Builds the Dockerfile as validation; does not push. |
| `semantic-release` | semantic-release | `develop` and `master`. | Runs semantic-release and writes `VERSION` to dotenv artifact. |
| `docker-push-develop` | docker-push | `develop`. | Builds image tagged `${VERSION}-develop` and `develop`, pushes both, writes digest. |
| `docker-push-master` | docker-push | `master`. | Builds image tagged `${VERSION}` and `latest`, pushes both, writes digest. |
| `deploy-develop` | oc-deploy | `develop`. | Logs into OpenShift, ensures secrets exist, checks non-production auth/database secrets, Helm deploys `aida-develop`. |
| `deploy-master` | oc-deploy | `master`. | Logs into OpenShift, ensures secrets exist, checks production auth/database secrets, Helm deploys `aida`. |

## Release behavior

AIDA semantic-release uses `master` for stable releases and `develop` for prereleases. The `.releaserc.json` also includes changelog, git asset updates, and a backmerge plugin from master to develop. Docker tags follow the branch: develop images get `-develop` tags and master images get stable version and latest tags.

## Deploy flow

The deploy jobs use `alpine/helm`, install the OpenShift client, run `oc login --token=$OC_SA_TOKEN --server=$OC_SERVER --insecure-skip-tls-verify`, create or update the Artifactory image pull secret, create or update `aida-secrets` from LiteLLM variable names, check required auth/database secrets, and run `helm upgrade --install` with the environment values file and image tag.

## Known quirks

- The verify stage has lint and typecheck, but no test job.
- Deployment currently uses `oc login --insecure-skip-tls-verify`.
- AIDA data storage is in-memory in the app; deployment scaling above one replica would need careful architecture work, not just a Helm value change.

## Debugging a failed release

Start at semantic-release. If no tag/version was produced, downstream version-dependent jobs will not have a valid image tag. If semantic-release passes, check Docker push output for the digest and then the Helm deploy output for pod and route status. For deploy failures, check whether required Kubernetes secrets exist by name; do not print their values.

## Reading the deploy logs

Read deploy logs in order. First confirm `oc login` succeeds. Then confirm image pull secret creation or update succeeds. Then confirm `aida-secrets` is created or updated from variable names. Then confirm the environment-specific required secrets are present by name. Only after those checks does Helm matter. A Helm failure before image rollout is usually values, chart, or secret wiring. A rollout failure after Helm succeeds is usually image, runtime configuration, or pod health.

## What not to document

Do not paste service account tokens, LiteLLM keys, Docker passwords, database passwords, or OpenShift server secrets into the repository. This page deliberately lists variable names and purposes only. If a developer lacks access, the handover answer is to ask Kevin.
