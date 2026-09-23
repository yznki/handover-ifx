---
title: 'What to do when semantic-release fails'
description: 'What to do when semantic-release fails'
order: 8
---

# What to do when semantic-release fails

Use the current pipeline facts, not guesses:

1. Check whether semantic-release produced a version at all. aida-planning treats no release as valid for non-release commits and skips downstream jobs.
2. Check the branch rule. AIDA and CVC release from develop and master; aida-planning releases from master only.
3. Check commit format. CVC uses Conventional Commits and must not use major-bump syntax while pre-1.0.
4. Check whether the release token can push tags and release commits. aida-planning explicitly rewrites the remote to use `GITLAB_TOKEN` because the default job token could not push.
5. Check whether downstream jobs are gated on a release flag or non-empty version.

Never paste token values into debugging notes.
