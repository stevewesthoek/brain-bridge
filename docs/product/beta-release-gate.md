# BuildFlow v1.2.0-beta Release Gate

## Status

Working checklist for the public free GitHub self-hosted beta.

This document defines the gate that must be satisfied before BuildFlow Local is marketed as a public beta.

## Release identity

- **Version:** v1.2.0-beta
- **Audience:** free GitHub self-hosted users
- **Primary user:** solo builders, indie hackers, AI-native developers, technical early adopters
- **Launch promise:** Think in ChatGPT. Build anywhere.
- **Product type:** local-first open-source planning and handoff workflow
- **Not included:** account-based access, team workspaces, cloud sync, execution infrastructure, or direct remote sessions

## Beta readiness definition

BuildFlow v1.2.0-beta is ready when a first-time technical user can complete the local planning-to-handoff workflow from the repo documentation without private help.

The user should be able to:

1. clone the repo
2. install dependencies
3. start the local stack
4. open the dashboard
5. connect a local source
6. see source and agent readiness
7. configure the accompanying Custom GPT
8. search/read local context through ChatGPT
9. create or inspect a plan or execution packet
10. copy a Codex or Claude Code handoff prompt
11. recover from common failures using docs
12. know how to ask questions, open issues, contribute, star, and share the project

## Gate focus

- keep the public docs focused on BuildFlow Local
- keep self-hosted Custom GPT setup clear
- keep `dryRun` / `preflight` behavior documented
- keep safety, verification, and confirmation gates visible
- keep launch-readiness evidence tied to local commands and local URLs only

## Verification commands

```bash
pnpm --dir apps/web type-check
pnpm local:rebuild-web
pnpm local:verify
curl -sS http://127.0.0.1:3052/health | head -20
curl -sS http://127.0.0.1:3053/health | head -20
curl -sS http://127.0.0.1:3054/api/openapi | head -20
curl -sS http://127.0.0.1:3054/api/actions/status | head -20
```

## Release note

Before tagging or announcing v1.2.0-beta:

- create or update the release note
- state what is complete and what remains beta
- keep the scope limited to BuildFlow Local
