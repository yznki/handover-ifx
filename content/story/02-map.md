---
title: 'The repository map.'
description: 'The repository map.'
chapter: '02 / MAP'
order: 2
note: 'The work is connected.'
links: [{ label: "AIDA architecture", to: "/docs/aida-architecture" }, { label: "ValiBridge status", to: "/docs/valibridge" }]
---

The active map is AIDA, aida-planning, common-vue-components, valibridge-client, and valibridge-api. The archived Bitbucket/local branches listed in the decisions file are cleanup targets, not places to keep building.

AIDA is the plotting app. aida-planning is the long-memory planning workspace and deployed planning hub. CVC is the shared component library consumed by several PSV applications. ValiBridge is the mature verification platform that already has project context and permissions.

AIDA does not use CVC today. It has its own `app/components/ui` layer. CVC documentation that says AIDA consumes CVC is wrong and appears in the checklist as a cleanup item.
