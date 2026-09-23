---
title: 'Glossary'
description: 'Plain-word definitions used by the handover site.'
order: 99
---

# Glossary

## semantic-release

A release tool that reads Conventional Commits, decides the next version, creates changelogs and tags, and can publish packages or images through the pipeline.

## prerelease

A version meant for an integration branch before stable release, such as CVC `0.3.0-develop.6`.

## HICP

Infineon's OpenShift hosting environment used for AIDA, the planning hub, CVC showcase, and the playground namespace mentioned in the handover.

## Helm

The Kubernetes packaging tool used by the CI pipelines to deploy applications and routes to OpenShift.

## Turborepo

A monorepo build system proposed for the CVC split idea, so a core package and family packages can live and build together.

## peerDependency

A package dependency that the consuming application must provide. This is useful when a CVC family package needs a heavy library without forcing every consumer to install it through one meta package.

## vertical slice

A small piece of work that crosses layers and delivers one user-visible outcome. The AIDA planning tickets sometimes split by client and backend instead because that was the explicit planning preference.

## DAG

A directed acyclic graph: connected steps with arrows and no loops. The transform workflow uses this idea for reusable pipelines.

## MIAMI SSO

Infineon's single sign-on identity system. AIDA has deployment documentation for MIAMI-related secrets, but this handover never stores secret values.

## LiteLLM

The proxy used by AIDA's AI feature. The application stores only variable names and secret locations in documentation, never key values.
