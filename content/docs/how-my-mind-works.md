---
title: 'How my mind works'
description: 'How my mind works'
order: 1
section: 'start'
owner: 'Sandro + Uqba'
updated: '2026-09-23'
---

# How my mind works

This page is the long-form version of story chapter 01. It is intentionally about the operating model, not a personality profile. The useful thing to inherit is how I decide what is safe to ship, how I use AI, and where I slow down.

## Root belief

The root belief from the handover decisions is: **clean code is good code**. The practical version is that I try to understand the structure and idea before letting an AI assistant write code. That means I care first about slices, boundaries, data flow, contracts, naming, and ownership. I do not need to understand every line before starting, but I do need to know what shape the solution should have. Once I know the shape, I can judge whether generated code fits or whether it is just locally plausible.

The phrase "own the architecture, AI writes the lines" is the shortest way to say it. AI is good at producing lots of syntax quickly. The human job is to decide whether that syntax belongs in the system. A change that works in the browser but violates the structure is still not good enough. A change that is slower to write but lands in the right layer and reuses the right pattern is the one I trust.

## Verification habit

My normal verification loop is manual testing, running the available checks, and doing full personal quality assurance. I do not like merging something into develop or master because it looks right in a diff. I want to see it work. For UI work that usually means applying it locally and testing in the browser. For AIDA and CVC that also means watching for the exact places where a locally reasonable change can break another layer: plot type registries, API contracts, transform outputs, and AI prompt/schema drift.

There are exceptions where I read line by line. The decisions file names security, major or critical features, and huge work where performance or application stability matters. In those cases I do not trust a high-level shape alone. I read the implementation because the cost of missing a subtle bug is higher.

## The VALIBRIDGE-4065 pattern

The clearest real example is the VALIBRIDGE-4065 workflow. The sequence matters:

| Step | What I do | Why it matters |
| --- | --- | --- |
| Understand | Find where the problem lives and what it causes. | This prevents patching a symptom in the nearest consumer. |
| Ticket | Write a ticket that is specific, but not so specific it blocks a better implementation. | The ticket should guide the fix without overfitting the solution. |
| Root cause | Go upstream when the cause belongs upstream. In that story, the fix belonged in CVC, not only in the consumer. | Shared defects should be fixed where they are shared. |
| Research and fix | Use Copilot and internet research to verify the fix path. | This is the guard against rebuilding what already exists. |
| Local test | Apply locally and test in the browser. | The browser is the truth for UI behavior. |
| Merge only when it works | Do not merge to develop or master without verification. | A green-looking diff is not a release signal. |

That pattern is also why the CVC split idea exists: if the root cause is upstream package shape, a consumer workaround is only a temporary pressure valve.

## AI orchestration

The decisions file says I rarely use plan mode and deliberately keep the tool/skill set small. The reason is bias. A heavily tooled agent can get locked into the same pattern, even when the problem needs a more creative route. For larger work, I use Opus to plan and orchestrate Sonnet subagents, then Opus checks the work afterward. That is still not a replacement for judgment; it is a way to parallelize implementation once the shape is clear.

The important rule is not "use this model for everything." The important rule is separation of responsibility: one layer plans and reviews; another executes focused changes. Then the final review asks whether the output structurally fits.

## Trade-off instincts

The recurring trade-offs are simple enough to put on a card:

| Scenario | Decision rule |
| --- | --- |
| Shared defect | Fix upstream in CVC first. |
| Deadline pressure | Ship a quick imperfect implementation by the deadline, then clean it with the remaining time. |
| Disagreement | Each person states the case; whoever makes more sense wins. No ego and no seniority shortcut. |

Those rules are not a substitute for context, but they stop common failure modes. Upstream-first prevents consumer drift. Deadline pragmatism prevents perfection from missing the delivery window. Logic-first disagreement keeps the team from turning code review into hierarchy.

## Red flags

The decisions file lists the red flags clearly: blind vibe coding, adding new packages without research, over-the-top solutions where a simpler one exists, not thinking beyond "does it work" or "does it look good," utility dumping grounds, god components, duplicated logic, abbreviations, redundant API calls, and condition pyramids.

Most of those are not style preferences. They are signs that the system is losing shape. A duplicated helper today becomes two incompatible behaviors later. A utility dumping ground today becomes a hidden architecture layer tomorrow. A new package added casually becomes every consumer's build problem in a shared package.

## Fear and correction

My biggest fear is reinventing the wheel because I did not research enough. What I would do differently is research and read more instead of over-debugging. I used to think I knew better, but many hard debugging sessions would have been shorter if I had searched once or read the existing code more carefully.

The proudest part is growth through failing, retrying, and actively seeking criticism, especially from Kevin. The Kevin rule is the closing line: come with logical reasoning and approval is usually easy. That rule is not about pleasing one person; it is about making decisions explainable enough that a reviewer can trust them.
