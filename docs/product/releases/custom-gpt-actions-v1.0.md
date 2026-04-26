# BuildFlow Custom GPT Actions v1.0

Status: stable baseline

Manual Custom GPT test: passed

This version is the reference point for future v1.1+ changes.

## Purpose

BuildFlow Custom GPT Actions v1.0 lets a Custom GPT inspect, search, read, and safely write to connected BuildFlow sources through a small verified action surface.

## Public Value

This feature lets users connect a Custom GPT to BuildFlow-backed project knowledge.

It gives the GPT enough structure to inspect repo and source layout, search and read relevant files instead of guessing, and write verified artifacts or file changes only through controlled endpoints.

That grounding reduces hallucination by forcing answers to come from actual connected sources.

## Canonical Files

These files are the source of truth for this release:

- `docs/CUSTOM_GPT_INSTRUCTIONS.md`
- `docs/openapi.chatgpt.json`
- `apps/web/src/app/api/openapi/route.ts`
- `scripts/generate-openapi-chatgpt.mjs`
- `scripts/verify-custom-gpt-actions.mjs`
- `scripts/verify-write-contracts.mjs`

## Import Sources

Preferred schema import:

- `https://buildflow.prochat.tools/api/openapi`

File import fallback:

- `docs/openapi.chatgpt.json`

Custom GPT instructions must be copied from:

- `docs/CUSTOM_GPT_INSTRUCTIONS.md`

## Stable Action Surface

The stable Custom GPT action surface for v1.0 is exactly:

- `getBuildFlowStatus`
- `listBuildFlowSources`
- `getBuildFlowActiveContext`
- `setBuildFlowActiveContext`
- `inspectBuildFlowContext`
- `readBuildFlowContext`
- `writeBuildFlowArtifact`
- `applyBuildFlowFileChange`

## Stable Exposed HTTP Paths

The stable exposed HTTP paths for v1.0 are exactly:

- `GET /api/actions/status`
- `GET /api/actions/sources`
- `GET /api/actions/context/active`
- `POST /api/actions/context/active`
- `POST /api/actions/inspect`
- `POST /api/actions/read-context`
- `POST /api/actions/write-artifact`
- `POST /api/actions/apply-file-change`

## Legacy Actions And Paths That Must Not Return

These legacy names and shapes must not return to the Custom GPT schema:

- `setBuildFlowContext`
- `/api/actions/context` as a GPT-exposed OpenAPI path
- `action=list_sources`
- `action=get_active`
- `action=set_active`
- `contextMode=all`
- per-action schema fragments under `docs/openapi.chatgpt/*.json`
- per-action OpenAPI wrapper routes under `apps/web/src/app/api/openapi/*/route.ts`

## Verification Commands

```bash
cd ~/Repos/stevewesthoek/buildflow
pnpm --dir packages/cli build
pnpm --dir apps/web build
pnpm -r build
# Requires local BuildFlow services running on 3052 and 3054.
LOCAL_DASHBOARD_BASE_URL=http://127.0.0.1:3054 pnpm generate:openapi-chatgpt
TOKEN=$(sed -n 's/^BUILDFLOW_ACTION_TOKEN="$begin:math:text$\.\*$end:math:text$"$/\1/p' apps/web/.env.local)
BUILDFLOW_ACTION_TOKEN="$TOKEN" node scripts/verify-write-contracts.mjs
BUILDFLOW_ACTION_TOKEN="$TOKEN" pnpm verify:dashboard
BUILDFLOW_ACTION_TOKEN="$TOKEN" pnpm verify:gpt-contract
BUILDFLOW_ACTION_TOKEN="$TOKEN" pnpm verify:gpt-actions
curl -i --max-time 15 https://buildflow.prochat.tools/api/openapi | sed -n '1,20p'
```

## Required Pass Criteria

BuildFlow Custom GPT Actions v1.0 is only considered valid when all of the following are true:

- builds pass
- `docs/openapi.chatgpt.json` regenerates from the canonical OpenAPI route
- `docs/openapi.chatgpt.json` matches local and public `/api/openapi`
- `docs/CUSTOM_GPT_INSTRUCTIONS.md` mentions all 8 operationIds
- no legacy context operation is exposed
- no stale `docs/openapi.chatgpt/*.json` fragments exist
- no stale `apps/web/src/app/api/openapi/*/route.ts` wrappers exist
- write actions return `verified:true`
- the write verifier proves the file exists on disk and can be read back
- the GPT contract verifier passes locally and publicly
- public `/api/openapi` returns `200` JSON
- smoke artifacts are cleaned up

## Definition Of `verified:true`

`verified:true` means the backend did not merely return HTTP 200. It means the write operation was completed, the target file exists on disk, metadata was produced, and the verifier/read-back path confirmed the result. It is a backend-level verification, not a promise that ChatGPT will always choose the correct action.

## Change Policy

These rules apply to all future updates:

- No schema change without updating `docs/CUSTOM_GPT_INSTRUCTIONS.md`.
- No instruction change without checking the schema.
- No action rename without updating the verifier.
- No new action without adding verifier coverage.
- No legacy action reintroduction.
- No Custom GPT import until the full verifier passes.
- Future changes must be documented as v1.1, v1.2, etc.

## Known Operational Gotcha

If local `/api/openapi` or `/api/agent/sources` returns HTML 500 with missing `.next` chunk errors, do a clean local restart:

- kill listeners on `3052`, `3053`, `3054`
- stop lingering BuildFlow/Next dev processes
- remove `apps/web/.next`
- restart `packages/cli dev serve`
- restart `apps/web dev`

This is runtime cache contamination, not necessarily schema breakage.

## Commit Guidance

Recommended commit message:

`Stabilize BuildFlow Custom GPT Actions v1.0 reference`
