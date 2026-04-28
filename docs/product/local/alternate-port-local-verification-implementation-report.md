# BuildFlow Local Alternate-Port Verification Implementation Report

## Date
2026-04-28

## Problem
BuildFlow Local public beta needed a safe throwaway-clone path for fresh-clone verification while the current runtime remains on port `3054`.

## Files changed
- `scripts/buildflow-local-stack.sh`
- `apps/web/package.json`
- `docs/product/beta-release-gate.md`
- `docs/product/local/alternate-port-local-verification-plan.md`

## What changed
- `scripts/buildflow-local-stack.sh`
  - `AGENT_PORT`, `RELAY_PORT`, and `WEB_PORT` now respect environment overrides.
  - Agent and web startup commands pass the selected port through to the child process.
- `apps/web/package.json`
  - `dev` and `start` now read `PORT` instead of hard-coding `3054`.
- `docs/product/beta-release-gate.md`
  - Added a throwaway-clone-only alternate-port example for future fresh-clone verification.

## Exact defaults preserved
- Agent default: `3052`
- Relay default: `3053`
- Web default: `3054`
- README/public beta quickstart remains on `http://127.0.0.1:3054/dashboard`
- `pnpm local:restart` still targets the standard Local path unless env overrides are supplied explicitly

## Verification performed
- `bash -n scripts/buildflow-local-stack.sh`
- `node -e "const p=require('./apps/web/package.json'); console.log(p.scripts.dev); console.log(p.scripts.start)"`

## Verification result
- Shell syntax check passed.
- Web package scripts now show `${PORT:-3054}` for `dev` and `start`.

## Ready for later throwaway-clone test
- Yes. The repo now has an opt-in port override surface that can be exercised in a throwaway clone without changing the default Local public beta path.

## Untouched scope
- Current BuildFlow Local runtime
- Managed
- Dokploy
- DNS
- Cloudflare
- tunnels
- `buildflow.prochat.tools`
- Docker
- OrbStack

## Secret handling
- No secrets, bearer tokens, raw env values, or full config files were printed.

## Next step
- Run the throwaway-clone fresh-clone verification with explicit alternate ports only after confirming the live 3054 runtime remains untouched.
