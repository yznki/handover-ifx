---
title: 'Current pipelines only.'
description: 'Current pipelines only.'
chapter: '06 / CI/CD'
order: 6
note: 'No future roadmap here.'
links: [{ label: "AIDA CI/CD", to: "/docs/cicd-aida" }, { label: "Planning CI/CD", to: "/docs/cicd-planning" }, { label: "CVC CI/CD", to: "/docs/cicd-cvc" }]
---

AIDA runs verify, build, Docker validation, semantic release, Docker push, and OpenShift deploy. The verify stage runs lint and typecheck; the known quirk is that verify has no test job.

aida-planning builds the hub, validates Docker on merge requests, releases only from master, pushes the image, and deploys the read-only hub to the shared `aida` namespace.

CVC installs, validates, tests, builds, releases the npm package, and conditionally builds and deploys the showcase. Showcase deployment is gated by `SHOWCASE_DEPLOY_ENABLED=true`.

A known current deployment quirk across these pipelines is `oc login --insecure-skip-tls-verify`.
