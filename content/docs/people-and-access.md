---
title: 'People and access'
description: 'People and access'
order: 18
---

# People and access

This page names who to ask. It intentionally does not contain secret values.

| Person | Handover role |
| --- | --- |
| Kevin | Approvals, architecture, licences, credentials, GitLab and HICP admin. Ask Kevin for access. |
| Uqba | AIDA owner, CVC co-owner, ValiBridge owner. |
| Sandro | CVC owner and ValiBridge VALIBRIDGE-4026 owner. |
| Josh | Student intern supporting AIDA software engineering tasks. |
| Fernando | Student intern supporting AIDA software engineering tasks. |

## Access facts

The decisions file says Yazan and Kevin are GitLab group Owners, and Kevin can grant access. HICP AIDA admin is Yazan plus Kevin; lost admin is Kevin. Kevin already has nearly everything.

The only personal credential risk identified is the Jira personal access token behind Kubernetes secret `aida-planning-jira-token` in namespace `aida`. Rotate it away from Yazan's personal account before account deactivation. Do not write the token value into any repository, ticket, or chat.

## Licences

CKEditor licence and FontAwesome Pro access are with Kevin. If CVC work touches editor or icon licensing, ask Kevin rather than copying values from a local machine.

## Contact after leaving

After Monday 2026-09-28, contact Yazan through the WhatsApp group. The site should not publish a personal phone number.

## Access request pattern

When someone is blocked by access, name the system and ask Kevin. Good requests are specific: GitLab group/project, HICP namespace, Artifactory npm access, CKEditor licence, FontAwesome Pro access, or Kubernetes secret ownership. Bad requests ask for a password in chat. This site should help the team ask the right person without exposing values.

## Student intern support

Josh and Fernando are student interns. Give them codebase maps, ticket context, acceptance criteria, and verification steps. Do not assume hidden domain knowledge. The AIDA planning ticket format was designed to make work independently grabbable by explaining why the change exists, where code lives, and how to verify it.

## Approval culture

The decisions file captures the practical rule: Kevin approves logical reasoning. That means a proposal should explain trade-offs, evidence, and why the chosen path fits the current system. It does not need to be theatrical, and it should not depend on who argues loudest.

## Credentials boundary

This page should stay useful even after every secret rotates. That is why it records owners, systems, namespaces, and secret names only. A future reader should know who to ask and what to ask for, but should never find a usable credential here.
