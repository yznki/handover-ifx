---
title: "Current pipelines only."
description: "CI/CD as it works now."
chapter: "06 / CI/CD"
order: 6
note: "No roadmap in this chapter."
beats:
  - statement: "AIDA deploys through six current stages."
    support: "verify → build → docker-build → semantic-release → docker-push → oc-deploy."
    visual: "pipeline-aida"
  - statement: "develop is prerelease. master is stable."
    support: "Semantic-release decides versions from commit history."
    visual: "branch-release"
  - statement: "aida-planning is master-only."
    support: "It deploys the read-only hub to namespace aida."
    visual: "pipeline-planning"
  - statement: "CVC releases package and showcase separately."
    support: "Showcase deployment waits for SHOWCASE_DEPLOY_ENABLED=true."
    visual: "pipeline-cvc"
  - statement: "Known quirks are factual."
    support: "AIDA verify has no test job; deployments use oc login with insecure skip TLS verify."
    visual: "quirks-box"
links:
  - label: "AIDA CI/CD"
    to: "/docs/cicd-aida"
  - label: "CVC CI/CD"
    to: "/docs/cicd-cvc"
---
