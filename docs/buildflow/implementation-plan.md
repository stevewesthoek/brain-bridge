# BuildFlow Implementation Plan

This document defines how future BuildFlow work should be planned and documented.

## Principles

- Keep planning small, explicit, and file-scoped.
- Write tasks so a lower-capability model can execute them without broad architectural inference.
- Prefer verified, incremental changes over speculative refactors.
- Preserve the stable v1.0 Custom GPT Actions baseline unless a change is explicitly part of a documented next phase.
- Separate reasoning/design from handoff tasks.

## Repo areas

Future work should be organized around these areas:

- `docs/` for canonical docs, release notes, roadmap, and planning artifacts
- `apps/web/` for the dashboard, proxy routes, and GPT-facing HTTP actions
- `packages/cli/` for the local agent, source/context management, indexing, and write helpers
- `packages/bridge/` for relay and device coordination infrastructure
- `packages/shared/` for types and shared constants

## Documentation update rules

- Update canonical docs first when product meaning changes.
- Keep `docs/buildflow/README.md` as the documentation index.
- Keep `docs/buildflow/roadmap.md` as the planning overview.
- Keep `docs/buildflow/releases/custom-gpt-actions-v1.0.md` as the stable release note for the current baseline.
- Mark older docs as historical/reference instead of rewriting them into new canonical truth.
- Avoid duplicating canonical content across many files.

## Release note rules

- Release notes should state status, scope, and stable boundaries.
- A release note should say what is canonical, what is historical, and what changed.
- A release note should not claim completion unless the referenced build/verifier evidence exists.
- If a release note mentions a write contract, it must mention `verified:true`.

## OpenAPI and GPT action update rules

- Keep the public GPT action surface aligned with `docs/CUSTOM_GPT_INSTRUCTIONS.md`.
- Any OpenAPI change must be reflected in the instructions and verified by the public verifier.
- Any write response exposed to GPT must require `verified:true`.
- If a route or schema changes, update the verifier before describing the change as done.
- Do not rename stable actions unless the release note explicitly documents the rename.

## Verification expectations

- Build the affected packages before claiming success.
- Run the dashboard verifier for dashboard or proxy changes.
- Run the write-contract verifier for write-path changes.
- Run the public GPT action verifier against the real public HTTPS URL for GPT-facing changes.
- If a test creates smoke files, clean them up and say so explicitly.

## Lower-model task format

Tasks for Codex 5.1 mini, Haiku, or similar models should be:

- one file scope or one small folder scope
- clearly bounded
- explicit about allowed files
- explicit about steps
- explicit about acceptance criteria
- explicit about verification commands
- free of broad design judgment

Task prompts should not require the model to infer architecture across unrelated systems.
Do the reasoning and design first, then hand off the implementation details.

## v1.1 documentation foundation tasks

Use these tasks when starting the v1.1 documentation foundation. Keep them file-scoped and cheap to execute.

### Task A: Canonical docs index

- **Title:** Maintain `docs/buildflow/README.md`
- **Scope:** Documentation only
- **Allowed files:** `docs/buildflow/README.md`
- **Steps:**
  1. Keep `docs/buildflow/README.md` as the canonical docs index.
  2. Keep v1.0 marked as the stable baseline.
  3. Keep canonical links and the historical/reference split current.
- **Acceptance criteria:**
  - the file exists
  - it names v1.0 as the stable baseline
  - it links the release note, instructions, OpenAPI README, root README, roadmap, and implementation plan
- **Verification:** `sed -n '1,160p' docs/buildflow/README.md`

### Task B: Roadmap

- **Title:** Maintain `docs/buildflow/roadmap.md`
- **Scope:** Documentation only
- **Allowed files:** `docs/buildflow/roadmap.md`
- **Steps:**
  1. Keep v1.0, v1.1, v1.2, and later sections conservative and factual.
  2. Keep v1.1 focused on documentation and planning maturity.
  3. Keep v1.2 clearly separated as later product expansion.
- **Acceptance criteria:**
  - roadmap exists
  - it does not claim unverified completion
  - it includes v1.0, v1.1, v1.2, and later sections
- **Verification:** `sed -n '1,220p' docs/buildflow/roadmap.md`

### Task C: Implementation plan

- **Title:** Maintain `docs/buildflow/implementation-plan.md`
- **Scope:** Documentation only
- **Allowed files:** `docs/buildflow/implementation-plan.md`
- **Steps:**
  1. Keep planning principles explicit and narrow.
  2. Keep repo areas, docs rules, and verification expectations current.
  3. Keep lower-model task formatting file-scoped and testable.
- **Acceptance criteria:**
  - document exists
  - it instructs task writers to keep tasks narrow and file-scoped
  - it says reasoning/design should happen before task handoff
- **Verification:** `sed -n '1,260p' docs/buildflow/implementation-plan.md`

## Suggested workflow

1. Read the canonical docs and release note.
2. Write a narrow task brief.
3. Hand off the task with file scope and verification commands.
4. Run the relevant verifier.
5. Update the roadmap or release note only if the result changes canonical meaning.
