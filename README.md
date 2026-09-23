# Yazan Kiswani — Infineon handover

A Nuxt 4 static handover site for AIDA, aida-planning, CVC, ValiBridge, current CI/CD, access, people, and the local handover checklist.

## Run locally

```powershell
pnpm install
pnpm dev
```

## Edit content

Story chapters live in `content/story`. Long-form reference pages live in `content/docs`. Glossary entries live in `content/glossary/index.md`. The site uses Nuxt Content, so most copy edits do not require touching Vue components.

## Verify

```powershell
pnpm nuxt typecheck
pnpm generate
pnpm review
```

## Deployment files

The repository includes a multi-stage `Dockerfile` that builds with Node 22 and serves `.output/public` through `nginxinc/nginx-unprivileged` on port 8080. Helm files live in `helm/` and target namespace `play-yazi-kamikazi` with host `yazi-kamikazi-handover.icp.infineon.com` as a configurable value.

No secrets belong in this repository. Secret locations are documented by name only in the site content.
