---
title: 'Timeline for handover week'
description: 'The handover-week sequence, walkthrough timing, cleanup window, and last-day boundary.'
order: 2
section: 'start'
owner: 'Yazan'
updated: '2026-09-23'
---

# Timeline for handover week

The decisions file gives the handover week plan. This page keeps it visible without adding extra guesses.

| Date | Focus | Notes |
| --- | --- | --- |
| Wed 2026-09-23 | Build site and content review | Start from decisions file and real repositories. The site must be accurate before it is beautiful, but design quality is a top priority. |
| Thu 2026-09-24 | Continue content review and cleanup | Cleanup after site build: showcase split, dead branches/stashes, Jira PAT rotation, CVC CLAUDE.md consumer list fix. |
| Fri 2026-09-25 | Deploy and walkthroughs | Deploy the site. Run Uqba AIDA walkthrough. Run Sandro/Uqba CVC and CI/CD session where they do a release while watched. |
| Mon 2026-09-28 | Last day | Q&A, gap fixes, goodbye. Afterward contact Yazan through the WhatsApp group. |

## Walkthrough goals

The AIDA walkthrough should cover the product vision, the current code architecture, the planning workspace, workflow status, CI/CD, and unfinished AIDA work. The CVC walkthrough should cover current package shape, consumers, semantic-release rules, local testing in a consumer app, and the split idea as an idea only.

## Cleanup boundaries

The decisions file says cleanup happens after the site build, not before. That matters because the site needs to preserve the current state honestly. Once the site exists, the cleanup items can be acted on without losing the handover record.

## Last-day contact

The verified contact path after Monday 2026-09-28 is the WhatsApp group. The site should not publish personal numbers or private contact details.

## What “done” means by Friday

Friday is successful if Uqba can explain the AIDA product direction and planning workflow without Yazan driving, Sandro and Uqba can run through CVC release mechanics, Kevin has the credential rotation path, and the unfinished work has named owners. The site is not meant to freeze every answer forever. It is meant to make the first week without Yazan boring.

## After the final day

After Monday, the correct escalation path is the WhatsApp group for Yazan-specific questions and Kevin for access or approval questions. Technical decisions should still be made in the repositories, planning docs, merge requests, and Jira rather than in private chat.

## Meeting shape

Keep walkthroughs practical. Open the repository, show the relevant files, run the command or release step where appropriate, and ask the future owner to narrate the next action. The goal is not a slide presentation; the goal is confidence that the next person can continue without private context.

## What to defer

Do not use handover week to redesign AIDA, approve the CVC split, or solve every ValiBridge branch. Capture the current truth, transfer ownership, and leave decision-making in the normal project channels.

## Evidence to have open

During each walkthrough, keep the relevant evidence open beside the site: AIDA codebase-map pages for architecture, aida-planning workflow folders for product planning, CVC pipeline and package files for release work, and the checklist for unfinished ownership. The site tells the story; the repositories prove it. If the two ever disagree, trust the repository and update the handover page while it is still maintained.

Keep notes factual.
