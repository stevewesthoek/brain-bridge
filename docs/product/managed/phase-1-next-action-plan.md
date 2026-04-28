# BuildFlow Managed Phase 1 Next Action Plan

## Proven Facts
- The repo is clean on `main` and aligned with `origin/main`.
- BuildFlow Local remains a separate free self-hosted path and must stay untouched.
- BuildFlow Managed is the Dokploy-hosted path for staging and future SaaS use.
- The managed topology is already encoded in the repo:
  - `Dockerfile` exposes the public proxy on `3054`
  - proxy routes relay paths to `3053` and web paths to `3055`
  - relay auth uses `RELAY_ADMIN_TOKEN`
  - relay-agent mode is enabled via `BUILDFLOW_BACKEND_MODE=relay-agent`
- The web app already supports relay-agent behavior:
  - `BRIDGE_URL` defaults to the local relay URL
  - `DEVICE_TOKEN` / bearer passthrough behavior is handled in relay-agent mode
  - `Authorization: Bearer <token>` is forwarded in relay-agent mode
- Dokploy staging app `enij_FshYINrDID8QGpZX` is healthy and verified on `buildflow-staging.prochat.tools`.
- The staging app’s admin token was rotated twice after exposure in tool output.
- The staging app’s public endpoints were verified with `200` responses.
- The staging app’s admin endpoint was verified with the rotated token.

## Assumptions
- Dokploy staging remains the correct place for further managed verification.
- No local Docker or OrbStack work is needed for the next narrow Managed Phase 1 step.
- The remaining useful evidence is operational, not architectural.

## Current Managed Phase 1 Status
- Managed Phase 1 is functionally implemented in code and reachable in staging.
- Runtime health and admin access have been proven at the HTTP level.
- The remaining question is whether the staging deployment logs and/or live device path show the expected runtime behavior under managed relay load.

## Already Verified
- Repo identity and clean state.
- Managed docs alignment on local vs managed boundaries.
- Managed runtime topology in `Dockerfile`, proxy, relay, and web code.
- Staging app identity, status, domain, mount, and env-key presence.
- Staging public endpoints:
  - `/`
  - `/api/openapi`
  - `/health`
  - `/ready`
- Staging admin endpoint:
  - `/api/admin/devices`
- Secret rotation for staging `RELAY_ADMIN_TOKEN`.

## Still Unverified
- Dokploy deployment logs for the most recent staging rotation.
- A staging-only managed device smoke test that exercises registration and runtime routing without touching Local.
- Any managed production planning beyond staging readiness.

## Exact Next Approved-Safe Step
- Read-only Dokploy log inspection for the BuildFlow Staging app, focused on the latest deployment and relay startup path.

## Forbidden Without Explicit Approval
- Touching BuildFlow Local.
- Using or binding host port `3054` locally.
- Running Docker or OrbStack locally.
- Mutating Dokploy outside the BuildFlow Staging app.
- Changing DNS, Cloudflare, tunnels, or local services.
- Switching or promoting `buildflow.prochat.tools` to managed production.
- Writing or printing secrets, bearer tokens, or raw env payloads.
- Running a local build/start flow as part of this managed verification.

## Recommendation
- Recommended next action: **A) read-only Dokploy log inspection**
- Reason: the staging app is already healthy and endpoint-verified, but the deployment log trail is the safest remaining way to confirm the managed relay boot path before any staging-only device smoke test.

## Bottom Line
- Keep BuildFlow Local untouched.
- Continue Managed Phase 1 in Dokploy staging only.
- Do not move to production planning or local Docker verification yet.
