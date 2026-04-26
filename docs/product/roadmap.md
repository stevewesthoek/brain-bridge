# BuildFlow Roadmap

This roadmap is conservative and documents the current planning direction without claiming work is complete unless an existing canonical doc proves it.

## BuildFlow v1.0

Stable Custom GPT Actions baseline.

v1.0 is the current reference point for the public Custom GPT action surface and verified write contract.

Canonical release note:

- [`docs/product/releases/custom-gpt-actions-v1.0.md`](./releases/custom-gpt-actions-v1.0.md)

## BuildFlow v1.1

Documentation, roadmap, and execution-planning foundation.

Planned emphasis:

- make the canonical docs easier to find
- clarify which docs are canonical versus historical
- define a repeatable implementation-task format for lower-capability coding models
- preserve the stable v1.0 action surface and verified write contract

### v1.1 non-goals

- no product redesign
- no runtime behavior changes
- no new public Custom GPT actions
- no new endpoint names
- no removal of historical docs
- no broad architecture changes

## BuildFlow v1.2

Dashboard design and product expansion, subject to later implementation and verification.

Launch phase context: see [`docs/product/launch-strategy.md`](./launch-strategy.md) for the free GitHub, Pro SaaS, and Team boundaries that shape dashboard design and feature scope.

The first v1.2 feature is the BuildFlow dashboard design. This is the visual and functional product surface that should make BuildFlow feel premium, easy, trustworthy, and immediately useful.

### v1.2 primary feature: BuildFlow dashboard design

Goal:

- design a premium, non-intimidating dashboard that communicates BuildFlow's value without requiring scrolling or explanation
- show the user's current project, connected sources, active plan, next recommended action, and execution status in a clear above-the-fold layout
- make the interface feel calm, focused, and high-end rather than busy, technical, or generic
- use the dashboard as the visible product surface for future commercial readiness

Design principles:

- less is more
- above-the-fold clarity first
- strong hierarchy over dense information
- functional convenience over decorative complexity
- premium typography, spacing, and surfaces
- clear empty, loading, error, and connected states
- no generic AI-dashboard aesthetic
- no intimidating cockpit-style UI unless the user explicitly asks for expert mode

Likely dashboard areas:

- source and connection status
- current project or workspace
- active blueprint or planning session
- execution packet overview
- next recommended action
- recent activity or timeline summary
- prompt handoff area for Codex, Claude, or other tools
- verification and write status where relevant

Related v1.2 areas:

- Blueprint Wizard
- Capability Scan
- Execution Packet generation
- dashboard packet visualization
- per-tool prompt generation

These items are roadmap targets, not claims of current completion.

## Later

Potential future expansion, if and when validated:

- richer executor integrations
- hosted or pro workflows
- team workflows
- broader collaboration and coordination features

## Status discipline

- v1.0 means the stable baseline already released.
- v1.1 means documentation and planning maturity.
- v1.2 and later mean product expansion that must be documented and verified before being described as complete.

## Current next phase

The current next phase is BuildFlow v1.2 dashboard design for the free GitHub launch.

BuildFlow v1.1 documentation foundation is complete enough to serve as the current planning baseline.

v1.2 should focus first on the free/local dashboard surface.

Pro SaaS and Team features are planned later according to [`docs/product/launch-strategy.md`](./launch-strategy.md).

v1.2 design work should not be described as implementation complete.
