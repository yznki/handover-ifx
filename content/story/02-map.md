---
title: "The repository map."
description: "How the handover repositories connect."
chapter: "02 / MAP"
order: 2
note: "AIDA does not consume CVC."
beats:
  - statement: "There are five active centers of gravity."
    support: "AIDA, aida-planning, common-vue-components, valibridge-client, and valibridge-api."
    visual: "repo-map"
  - statement: "CVC feeds seven verified consumers, not AIDA."
    support: "valibridge-client, lost-client, tim-client, jira-ai-client, instruments-client, editable-table, and legacy apps."
    visual: "cvc-consumers"
  - statement: "aida-planning is the memory layer for AIDA."
    support: "It holds PRD, V1 definition, workflow docs, epics, tickets, glossary, and the hub."
    visual: "planning-link"
  - statement: "ValiBridge has a client/API pair."
    support: "The project phases epic crosses both repositories."
    visual: "bridge-link"
  - statement: "Archived Bitbucket/local branches are cleanup, not future homes."
    support: "Anything not pushed and not deployed can usually disappear after the site build."
    visual: "archive-fade"
links:
  - label: "CVC consumers"
    to: "/docs/cvc-consumers"
  - label: "ValiBridge status"
    to: "/docs/valibridge"
---
