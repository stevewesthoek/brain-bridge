# BuildFlow v1.2.11-beta

## Summary
BuildFlow v1.2.11-beta expands repo-local write capability from docs/config style edits to normal application code and maintenance paths while preserving secret, traversal, generated, and vendor protections.

## New in v1.2.11-beta
- Added a repo-agnostic `repo_app_write` profile for normal app implementation work.
- Allowed common code, app, test, schema, and script roots such as `src/**`, `app/**`, `components/**`, `lib/**`, `pages/**`, `server/**`, `shared/**`, `features/**`, `scripts/**`, `prisma/**`, `tests/**`, and related paths.
- Preserved docs, notes, and artifact writes from earlier beta releases.
- Added confirmation-gated handling for risky maintenance paths like lockfiles, `.github/**`, `LICENSE`, and Prisma migrations.
- Exposed the new write profile in source metadata.
- Kept structured blocked-write responses and preflight/dry-run behavior.
- Exposed `dryRun` and `preflight` on the direct Custom GPT write actions so ChatGPT can preflight writes without trial-and-error.

## Safety model
The new profile still blocks:
- path traversal
- absolute paths outside the repo
- secret and credential files
- generated/vendor/build output
- binary-ish sensitive files
- lockfiles and selected maintenance paths unless explicitly confirmed

## Confirmation-gated edits
The write layer now requires explicit confirmation for:
- lockfiles
- GitHub workflow files
- `LICENSE`
- Prisma migrations
- package dependency changes

## Preflight / dry-run
Dry-run checks now apply to app-code writes as well as docs/config writes. Preflight returns:
- `allowed`
- `wouldWrite`
- `verified: false`
- requested and normalized paths
- structured reasons and hints for blocked paths

## Verification
- Safe create, append, patch, overwrite, and artifact writes are verified with read-back checks.
- Blocked paths return structured errors.
- `src/**` and common app paths are allowed when they are repo-relative and safe.
- Secret paths, traversal paths, generated output, and vendor directories remain blocked.

## Remaining limitations
- Delete, move, and rename remain disabled by default.
- Confirmation-gated paths still require explicit human intent.
- Binary writes remain out of scope for the general repo-app profile.

## Usage notes
- Use normal repo-relative app paths for implementation work.
- Use preflight before writing if you need to know whether a path is allowed.
- The direct ChatGPT write tools accept `dryRun: true` or `preflight: true` for no-write policy checks.
- If a change touches a confirmation-gated path, expect `REQUIRES_EXPLICIT_CONFIRMATION`.
