---
title: 'aida-planning CI/CD'
description: 'aida-planning CI/CD'
order: 4
---

# aida-planning CI/CD

The planning hub pipeline is master-only and deploys the read-only hub.

| Stage | What it does |
| --- | --- |
| `build` | Enters `hub/`, installs dependencies, typechecks, and builds. |
| `docker-build` | Build-only Docker validation for merge requests targeting master. |
| `semantic-release` | Uses the AIDA semantic-release image, pushes release metadata through `GITLAB_TOKEN`, and may produce no version for non-release commits. |
| `docker-push` | Builds the repository-root Dockerfile and pushes version/latest image tags. |
| `oc-deploy` | Logs into OpenShift and Helm deploys `aida-planning-hub` to namespace `aida`. |

Important current facts: the namespace is `aida`, not a separate aida-planning namespace; a previous deploy confirmed the CI service account is scoped there. Jira sync is configured by secret name only. The token value itself must never live in Git.
