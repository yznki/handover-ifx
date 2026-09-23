---
title: 'People and access.'
description: 'People and access.'
chapter: '10 / PEOPLE & ACCESS'
order: 10
note: 'Ask Kevin for keys, not markdown.'
links: [{ label: "People and access", to: "/docs/people-and-access" }]
---

Kevin is the approval, architecture, licence, credential, GitLab, and HICP escalation point. Uqba owns AIDA, co-owns CVC, and owns ValiBridge. Sandro owns CVC and the ValiBridge 4026 epic. Josh and Fernando are student interns supporting AIDA with software engineering tasks.

Do not write secret values anywhere. The site only names secret locations and points to Kevin.

The only known personal credential risk from the decisions file is the Jira PAT in Kubernetes secret `aida-planning-jira-token` in namespace `aida`. Rotate it.
