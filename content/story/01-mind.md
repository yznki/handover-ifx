---
title: 'How my mind works.'
description: 'How my mind works.'
chapter: '01 / MIND'
order: 1
note: 'Architecture first. Lines second.'
links: [{ label: "People and access", to: "/docs/people-and-access" }, { label: "Using planning", to: "/docs/aida-planning" }]
---

My root belief is that clean code is good code. Before I let AI write lines, I need the structure and idea: slices, boundaries, data flow, contracts, and naming. I do not need to understand every line first, but I do need to know what the correct shape is so I can judge whether generated code structurally fits.

I verify through manual testing, running checks, and full personal quality assurance. The exceptions are security work, major or critical features, and large performance-sensitive work where reading line by line is the safer path.

The real workflow is the VALIBRIDGE-4065 story: understand where the problem lives and what it causes, write a ticket that is specific but not over-prescriptive, fix the root cause upstream in CVC instead of patching the consumer, have Copilot research the fix, apply it locally, test it in the browser, and never merge to develop or master without seeing that it actually works.

When the work is large, Opus plans and orchestrates Sonnet subagents, then Opus checks their work. I deliberately keep the skill set small so agents are not biased into the same pattern every time.

The trade-off rules are plain. Fix upstream in CVC first. Under a deadline, ship a quick imperfect version by the deadline, then clean it with the time left. In disagreement, each person states the case; whoever makes more sense wins. No ego, no seniority shortcut.

Red flags: blind vibe coding, adding packages without research, overbuilt solutions where a simple one exists, utility dumping grounds, god components, duplicated logic, abbreviations, redundant API calls, and pyramids of conditionals.

My biggest fear is reinventing the wheel because I did not research enough. What I would do differently is research and read more instead of over-debugging. I used to think I knew better; often one search or one careful read would have solved it faster.

The proudest part is not a trophy feature. It is growth through failing, retrying, and actively seeking criticism, especially from Kevin. The unwritten rule is also Kevin-shaped: come with logical reasoning and most things are easy to approve.
