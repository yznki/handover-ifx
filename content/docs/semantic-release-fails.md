---
title: 'What to do when semantic-release fails'
description: 'What to do when semantic-release fails'
order: 16
---

# What to do when semantic-release fails

Semantic-release failures usually come from one of four places: branch rules, commit analysis, token permissions, or downstream image/deploy assumptions. Debug them in that order.

## Step 1: Did this commit produce a release?

A non-release commit may correctly produce no version. The aida-planning pipeline explicitly handles this by writing an empty `VERSION` and skipping Docker push/deploy. CVC writes `RELEASED=false` when semantic-release produces no new tag, and downstream showcase jobs skip.

If you expected a release, check the commit messages since the last tag. `fix:` should produce a patch. `feat:` should produce a minor. Documentation, chore, refactor, and CI commits may not release unless configured otherwise.

## Step 2: Is the branch allowed?

| Project | Release branches |
| --- | --- |
| AIDA | `develop` prerelease and `master` stable. |
| CVC | `develop` prerelease and `master` stable. |
| aida-planning | `master` only. |

Running semantic-release on an unconfigured branch can look like a failure when it is just the branch policy.

## Step 3: Is the token allowed to push?

aida-planning hit a real CI issue where the job token checkout could not push release commits and tags. The fix in the pipeline points the Git remote at `GITLAB_TOKEN`. If a release job can calculate a version but cannot push a tag, check remote authentication and token scopes. Do not print token values.

## Step 4: Is CVC accidentally asking for 1.0?

CVC is intentionally pre-1.0. Do not use `feat!`, `fix!`, or the literal `BREAKING CHANGE:` footer. Those trigger a major version bump. Use `feat:` and add a plain migration-notes heading in the commit body if reviewers need impact details.

## Step 5: Did downstream jobs assume a version?

A Docker push job needs a non-empty version. A deploy job needs an image tag that exists. If semantic-release produced no version, downstream jobs should skip. If they do not, fix the job rules or guards rather than hardcoding a tag.

## Step 6: Check generated files

AIDA and CVC release jobs update changelog and package metadata. If the job fails after committing generated files locally, inspect whether the repository is dirty and whether the release commit message uses the configured format. Do not amend or force-push release commits without understanding the branch policy.

## Fast triage table

| Symptom | Likely area | First check |
| --- | --- | --- |
| No version emitted | Commit analysis or branch rules | Commit types since last tag and allowed branch list. |
| Version emitted, tag push fails | Token or remote setup | `GITLAB_TOKEN` permissions and rewritten remote. |
| Package release succeeds, image missing | Docker push guard | Whether `VERSION` and release flags were passed through dotenv artifacts. |
| Image exists, deploy fails | OpenShift or Helm | Login, pull secret, required secret names, and values file. |

Keep fixes narrow. A semantic-release failure is usually configuration or permissions, not a reason to rewrite the release strategy.

## Recovery rule

Do not manually create a tag unless the team has decided that semantic-release state is irrecoverable. A hand-created tag can confuse the next automated run. Prefer fixing commit format, token permissions, branch configuration, or dotenv propagation, then rerun the intended job.

When in doubt, preserve the automated release history. The safest repair is the one that lets semantic-release make the next tag itself.
