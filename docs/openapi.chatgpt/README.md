# BuildFlow Custom GPT Action Imports

Import the canonical schema from:

- `docs/openapi.chatgpt.json`
- or `https://buildflow.prochat.tools/api/openapi`

For the stable product baseline, see [`docs/buildflow/README.md`](../buildflow/README.md) and the v1.0 release note at [`docs/buildflow/releases/custom-gpt-actions-v1.0.md`](../buildflow/releases/custom-gpt-actions-v1.0.md).

The Custom GPT surface is exactly these 8 operations:

- `getBuildFlowStatus`
- `listBuildFlowSources`
- `getBuildFlowActiveContext`
- `setBuildFlowActiveContext`
- `inspectBuildFlowContext`
- `readBuildFlowContext`
- `writeBuildFlowArtifact`
- `applyBuildFlowFileChange`

## Notes

- Do not import legacy context actions such as `setBuildFlowContext`.
- Keep the imported schema aligned with `docs/CUSTOM_GPT_INSTRUCTIONS.md`.
- Use Bearer API key auth with `Authorization: Bearer <BUILDFLOW_ACTION_TOKEN>`.
- Older per-action OpenAPI fragments are historical/reference material unless a release note says otherwise.

## Verification

- Run `pnpm verify:gpt-contract` after regenerating the schema file.
- If the root schema changes, re-import the Custom GPT actions.
