# BuildFlow Local No-Docker Verification Mode Plan

## Date
2026-04-28

## Goal
Define the smallest possible verification mode for BuildFlow Local public beta that does not require Docker or OrbStack and does not touch the current runtime on port `3054`.

## What the review found
- The current Local stack script still starts the relay through `docker compose`.
- The local verification scripts assume the standard `3052/3053/3054` topology.
- `pnpm local:restart` still maps to the full stack script, so it is not yet a no-Docker verification command.
- The dashboard and agent verification scripts can already be pointed at alternate base URLs, but that alone does not remove the Docker relay dependency.

## Smallest no-Docker verification mode

The smallest useful mode is a **dashboard-only verification command** that proves the free GitHub beta can be verified in a throwaway clone without starting the relay through Docker.

Proposed command:

```bash
pnpm local:verify:dashboard-only
```

## What it should verify

This mode should prove:

- the dashboard starts on an alternate web port
- the dashboard OpenAPI route responds
- the dashboard can read local agent-backed surfaces that do not require Docker-only relay startup
- the verification path does not bind or touch the current `3054` runtime

## What it should not prove

This mode should not claim:

- full relay behavior
- managed relay/device registration
- Docker-backed relay startup
- production or Dokploy behavior
- any change to the default Local public beta path

## Suggested ports and env vars

Keep the default path unchanged:

- `AGENT_PORT=3052`
- `RELAY_PORT=3053`
- `WEB_PORT=3054`

For throwaway-clone verification, use opt-in overrides:

- `AGENT_PORT`
- `RELAY_PORT`
- `WEB_PORT`
- `LOCAL_DASHBOARD_BASE_URL`
- `LOCAL_AGENT_URL`

If Docker must be avoided, the verification command should only start the dashboard and any local agent surface that is already available without the relay.

## Files likely needing changes

- `package.json`
- `scripts/buildflow-local-stack.sh`
- `scripts/restart-buildflow-local.sh`
- `scripts/verify-dashboard.mjs`
- `scripts/verify-custom-gpt-actions.mjs`
- `README.md`
- `docs/product/beta-release-gate.md`

## Suggested implementation shape

1. Add a new script entry for dashboard-only verification.
2. Make that script skip relay startup entirely.
3. Reuse the existing dashboard verification logic with alternate base URLs.
4. Keep the default public beta path on `3052/3053/3054` unchanged.
5. Document the new command as verification-only for throwaway clones.

## Open question

If the dashboard-only mode still needs a relay-backed route to prove readiness, then the repo needs a separate non-Docker relay option before fresh-clone runtime verification can proceed.

## Secret handling

No secrets, bearer tokens, raw env values, or full config files are included in this plan.
