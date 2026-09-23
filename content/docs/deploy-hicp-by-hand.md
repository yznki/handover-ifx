---
title: 'Deploy to HICP by hand'
description: 'Deploy to HICP by hand'
order: 4
---

# Deploy to HICP by hand

This is a runbook for understanding the deployment shape. It is not a command to paste blindly into a terminal. Use the normal CI/CD pipeline when possible. If a manual deployment is needed, use the same structure as the pipelines and never write secret values into this repository, a ticket, or a chat.

## Namespaces and clusters

| Application | Namespace | Cluster / host facts from source files |
| --- | --- | --- |
| AIDA | `aida` | AIDA values use `aida.icp.infineon.com` and `aida-demo.icp.infineon.com`; CI comments reference EU-DE-4 API URL by variable. |
| aida-planning hub | `aida` | The planning CI service account was confirmed scoped to `aida`; route host is `aida-planning.icp.infineon.com`. |
| handover site | `play-yazi-kamikazi` | Helm values in this repository set `yazi-kamikazi-handover.icp.infineon.com` and target the playground namespace. |
| CVC showcase | `lost` | CVC README and pipeline deploy the showcase there when enabled. |

## Service account pattern

The AIDA and planning pipelines use an OpenShift service account named `aida-deployer` in namespace `aida`. The pipeline variable `OC_SA_TOKEN` contains the token value. This runbook names the variable only; it does not contain or request the token.

The pipeline login pattern is:

```powershell
oc login --token=$env:OC_SA_TOKEN --server=$env:OC_SERVER --insecure-skip-tls-verify
```

That insecure TLS flag is a known current pipeline quirk. It is documented because it exists, not because it is a recommendation.

## Image pull secret pattern

The pipelines create or update an Artifactory image pull secret before Helm deploy:

```powershell
oc create secret docker-registry artifactory `
  --docker-server=artifactory.intra.infineon.com `
  --docker-username=$env:DOCKER_USERNAME `
  --docker-password=$env:DOCKER_PASSWORD `
  --namespace=$env:NAMESPACE `
  --dry-run=client -o yaml | oc apply -f -
```

Do not paste real usernames, passwords, or tokens into documentation. If the command fails, ask Kevin or the application owner for access rather than copying credentials into a workaround.

## Helm deploy pattern

AIDA and aida-planning use `helm upgrade --install` with values files and an explicit image tag from semantic-release. The handover chart follows the same shape.

For this handover site, the intended manual shape is:

```powershell
$env:NAMESPACE = "play-yazi-kamikazi"
$env:IMAGE_TAG = "<version-or-test-tag>"

helm upgrade --install handover-ifx .\helm `
  -f .\helm\values.master.yaml `
  --namespace $env:NAMESPACE `
  --set image.tag=$env:IMAGE_TAG `
  --timeout 10m `
  --wait

oc get pods -n $env:NAMESPACE
oc get route -n $env:NAMESPACE
```

The chart creates a Deployment, Service, Route, ServiceAccount, and optional HPA. It serves static Nuxt output through `nginxinc/nginx-unprivileged` on port 8080, which is compatible with arbitrary OpenShift UIDs.

## AIDA application extra checks

AIDA has additional application dependencies. Its deployment jobs check auth and database secrets before Helm deployment, and `docs/sso-deployment.md` describes MIAMI sidecar and database secret names. This site must not duplicate secret values. If AIDA deployment fails because a secret is missing, the correct escalation is Kevin or the current AIDA owner, not reverse-engineering the secret from a local machine.

## After deployment

Check the route, pods, and browser console. For a static site, the minimum useful checks are the home page, a docs page, the checklist, and mobile viewport behavior. For AIDA, also validate health/readiness endpoints, MIAMI login, user synchronization, and the database path according to the AIDA deployment docs.
