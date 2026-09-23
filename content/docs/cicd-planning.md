---
title: 'aida-planning CI/CD'
description: 'aida-planning CI/CD'
order: 8
---

# aida-planning CI/CD

The aida-planning pipeline deploys the planning hub, not AIDA itself. It is simpler than AIDA because the deployed hub is read-only and master-only.

## Global variables by name

| Variable | Purpose |
| --- | --- |
| `IMAGE_REGISTRY` | Artifactory image path for the planning hub. |
| `NAMESPACE` | OpenShift namespace, confirmed as `aida`. |
| `OC_SA_TOKEN`, `OC_SERVER` | OpenShift login credentials by variable name. |
| `DOCKER_AUTH_CONFIG`, `DOCKER_USERNAME`, `DOCKER_PASSWORD` | Artifactory Docker authentication and pull secret creation. |
| `GITLAB_TOKEN` | Used by semantic-release to push release commits and tags. |
| `VERSION` | Dotenv output from semantic-release. |

## Jobs

| Job | Stage | When it runs | What it does |
| --- | --- | --- | --- |
| `build` | build | Normal pipeline. | Enters `hub/`, runs `npm ci`, typecheck, build, and stores `hub/dist/`. |
| `docker-build` | docker-build | Merge requests targeting master. | Builds the root Dockerfile for validation only. |
| `semantic-release` | semantic-release | `master`. | Uses the AIDA semantic-release image, rewrites remote to use `GITLAB_TOKEN`, runs release, writes `VERSION`. |
| `docker-push-master` | docker-push | `master` with non-empty version. | Builds the image and pushes version plus latest tags. |
| `deploy-master` | oc-deploy | `master` with non-empty version. | Logs into OpenShift, applies Artifactory pull secret, and Helm deploys `aida-planning-hub`. |

## Namespace fact

The planning hub originally could have looked like it deserved its own namespace, but `hub/SPEC.md` records a real failed deploy attempt: the CI service account token is scoped only to the shared `aida` namespace. The chart and pipeline therefore deploy to `aida`.

## Read-only deployed model

The deployed hub has `HUB_READ_ONLY=true`. It does not write markdown files in the container. Editing happens locally, where save actions commit under the editor's local Git identity. Live Jira sync can overlay Jira status in memory on the deployed instance, but secret values are supplied through a Kubernetes secret and never committed.

## Debugging a failed release

If semantic-release produces no version, that may be a valid no-op for a non-release commit. If `VERSION` is empty, Docker push and deploy should skip. If semantic-release should have produced a release but did not, check commit format and whether `GITLAB_TOKEN` can push tags and release commits.

## Manual deploy mental model

The manual deploy runbook mirrors the pipeline: build the hub, build the container image, push it to the image registry, log into OpenShift with the service account, ensure pull credentials exist, and run Helm with the master values. If manual and pipeline behavior diverge, prefer fixing the pipeline documentation or chart values rather than preserving a one-off command.

## Live Jira overlay

The planning hub can show Jira status through a live overlay, but markdown remains source of truth for planned work. If Jira is unavailable or the token is rotated, the hub should still be useful as a read-only planning library. That is why token rotation is an access task, not a content migration task.

## Quick verification after deploy

After deployment, open the route and confirm the hub loads without authentication surprises. Then check that the rendered content matches repository files and that read-only behavior is still intentional. If live Jira status is unavailable, the hub can still be correct as a markdown browser; do not treat Jira overlay failure as loss of source-of-truth content.
