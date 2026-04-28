# BuildFlow Local v1.2.0-beta Launch Asset Checklist

## Purpose
Define the minimum public-facing assets needed to present the free GitHub Local beta clearly without expanding Managed/SaaS work.

## First asset to create
- A single dashboard screenshot of BuildFlow Local showing the first impression state after launch.

## Where it should live
- Preferred location: `docs/product/assets/`
- Acceptable location: `docs/product/`
- Link it from the beta release note once created.

## What must be visible
- The BuildFlow Local dashboard hero or first impression section
- A visible signal that this is the free GitHub Local beta
- A clear source/readiness area
- A clear handoff area for Codex or Claude Code
- Enough of the dashboard to show what the product does at a glance

## What must be hidden or redacted
- Secrets
- Bearer tokens
- Raw env values
- Private local paths
- Private repo names
- Any machine-specific data that would leak user context

## Recommended capture angle
- One clean desktop screenshot of the dashboard landing state
- Prefer a state where the new Local beta hero is visible
- Avoid cluttering the frame with debug panels or terminal windows

## How it will be linked
- Add a short link in `docs/product/releases/buildflow-v1.2.0-beta.md`
- Optionally reference it from the README beta bridge if needed

## Stop point
- Do not expand Managed/SaaS work before the Local beta launch asset is ready.
- Do not add more launch assets until the first dashboard screenshot is complete and reviewed.

## Next asset to create first
- The first screenshot of the BuildFlow Local dashboard landing state.
