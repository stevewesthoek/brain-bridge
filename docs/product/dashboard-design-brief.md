# BuildFlow Dashboard Design Brief

## Status

Draft design brief for BuildFlow v1.2.

This document defines the product and UX direction for the first BuildFlow dashboard design phase. It is not a claim that the dashboard is implemented.

## Product intent

Launch strategy context: see [`docs/product/launch-strategy.md`](./launch-strategy.md) for the free GitHub, Pro SaaS, and Team boundaries that shape dashboard design.

BuildFlow helps users move from AI-assisted reasoning to structured execution.

The dashboard is the visible control surface for that flow. It should make the user feel that BuildFlow knows their context, understands the current plan, and can guide execution without requiring them to understand terminals, local agents, or implementation details.

The dashboard should feel calm, premium, and immediately useful. It should not feel like an engineering cockpit.

## Target user

The primary user is a SaaS customer who wants to create an app, website, or project with AI assistance.

The user may understand basic concepts such as projects, files, sources, repos, and prompts, but should not need technical confidence to use the dashboard.

The dashboard should be beginner-safe while still useful for experienced AI builders.

Design requirement:

- default view: simple, guided, low-friction
- advanced details: available through progressive disclosure
- no terminal-first mental model
- no requirement to understand BuildFlow internals before receiving value

## Core product promise

The dashboard should communicate this within five seconds:

> BuildFlow has your sources, knows your project context, and is ready to help you continue the build plan.

## Primary user jobs

The dashboard must support these jobs:

1. See which knowledge sources are connected.
2. See whether the local agent and action surface are healthy.
3. Understand whether one source or multiple sources are active in context.
4. See the current project, blueprint, plan, or execution packet.
5. Resume a stopped plan.
6. Continue from the next recommended action.
7. Understand which tasks are done, active, blocked, or pending.
8. Copy or launch a handoff prompt for Codex, Claude Code, or another executor.
9. See validation and execution feedback when tasks complete.

## Above-the-fold requirements

The first screen, without scrolling, should show:

1. Source status
   - number of connected sources
   - enabled/disabled state
   - active context mode: single source or multiple sources
   - source health/index status

2. Agent health
   - local agent status
   - web/action status
   - relay/backend status if relevant
   - clear warning if something prevents execution

3. Current build flow
   - current project or workspace
   - active blueprint or plan name
   - current execution phase
   - task progress summary

4. Next action
   - one primary recommended action
   - examples: connect source, start blueprint, resume plan, generate execution packet, copy Codex prompt, review completed task

5. Plan/execution preview
   - short timeline or checklist summary
   - latest completed task
   - current active task
   - next pending task

The dashboard should never require the user to scan many panels to know what to do next.

## Default dashboard structure

Recommended layout:

1. Top bar
   - BuildFlow identity
   - current project/workspace selector
   - agent/source health indicator
   - light/dark mode toggle
   - settings or advanced menu

2. Main command area
   - large but restrained current-plan panel
   - one clear primary action button
   - short explanation of what happens next

3. Source and context panel
   - connected sources
   - active context mode
   - indexing/readiness state
   - direct action to manage sources

4. Execution flow panel
   - phase/timeline view
   - done/active/next task states
   - resume button when paused
   - validation state where available

5. Handoff panel
   - Codex prompt
   - Claude Code prompt
   - execution packet status
   - copy/open action

## Information hierarchy

The dashboard should prioritize:

1. What is connected?
2. Is BuildFlow healthy?
3. What plan are we working on?
4. What should I do next?
5. What has already happened?
6. What can I inspect if I need more detail?

Do not prioritize logs, raw endpoints, internal IDs, port numbers, or implementation details in the default view.

## Progressive disclosure

Advanced users should still be able to inspect details, but details should not dominate the default interface.

Default view should hide:

- raw API paths
- raw file paths unless needed
- raw terminal output
- full audit logs
- full OpenAPI details
- internal source IDs unless useful
- dense JSON responses
- stack traces
- verbose debug state

Expose these through:

- details drawers
- advanced tabs
- expandable cards
- copyable debug panels
- developer settings

## Visual direction

Preferred direction:

Linear + Resend + a little Apple.

Meaning:

- Linear: precise workflow, calm status, strong structure
- Resend: clean developer-product polish, restrained surfaces
- Apple: spacious, obvious, premium, non-intimidating

The dashboard should feel:

- premium
- calm
- precise
- trustworthy
- focused
- guided
- commercially credible

The dashboard should not feel:

- busy
- neon
- gamified
- terminal-heavy
- generic AI SaaS
- analytics-dashboard-first
- enterprise cluttered

## Light and dark mode

BuildFlow should support both light mode and dark mode.

Recommended default:

- light-first for approachability
- dark mode available for experienced builders and long work sessions

Light mode should be warm, clean, and premium. Avoid harsh pure white everywhere.

Dark mode should be calm and deep, not neon or purple-heavy.

## Component principles

Use a small set of high-quality components:

- project/workspace selector
- health/status pill
- source list card
- current-plan card
- next-action panel
- timeline/checklist
- execution packet preview
- copy prompt button
- resume button
- empty state
- loading state
- warning/error state

Use cards only when they clarify grouping. Prefer spacing, typography, and subtle dividers over too many boxed widgets.

## Interaction principles

The dashboard should actively guide the user.

It should answer:

- What is ready?
- What is missing?
- What is happening now?
- What just finished?
- What should I do next?
- Can I resume safely?

Important interactions:

- Resume plan
- Connect/manage source
- Start blueprint
- Generate execution packet
- Copy Codex prompt
- Copy Claude Code prompt
- Review task result
- Expand advanced/debug details

## Execution feedback direction

Future BuildFlow versions should allow execution feedback from Codex CLI, Claude Code CLI, or other executors to update the dashboard.

For v1.2 design, the UI should leave space for this future direction without requiring full executor automation immediately.

Design for these future states:

- idle
- ready
- running
- paused
- needs review
- blocked
- failed
- verified
- completed

## Empty states

Empty states are critical because many new users will start with nothing connected or no active plan.

Required empty states:

1. No source connected
   - explain what a source is in plain language
   - offer one primary action: connect source

2. Source connected but not indexed/ready
   - show progress or pending state
   - explain that BuildFlow is preparing context

3. No active plan
   - explain that plans can start from chat or dashboard
   - offer one primary action: start blueprint

4. No execution packet yet
   - explain execution packets as build-ready handoff plans
   - offer one primary action: generate packet

5. Executor not connected
   - explain that Codex/Claude execution is not yet connected
   - offer copy-prompt fallback

## Language rules

Use plain, confident product language.

Prefer:

- Connected
- Ready
- Resume plan
- Next task
- Review result
- Generate packet
- Copy prompt
- Source needs attention

Avoid:

- raw technical jargon
- excessive acronyms
- internal endpoint names
- scary terminal language
- vague AI marketing phrases
- words like seamless, unleash, elevate, next-gen

## Design source of truth

The canonical design system is `DESIGN.md` at the repository root. It defines the product direction, visual principles, and Huashu integration for the BuildFlow dashboard.

Recommended Brain skills:

1. `brain/ai/skills/custom/design-system/SKILL.md`
2. `brain/ai/skills/custom/web-design/SKILL.md`
3. `brain/ai/skills/custom/ui-ux-pro-max/SKILL.md`
4. `brain/ai/skills/custom/taste-skill/redesign-skill/SKILL.md`
5. `brain/ai/skills/custom/taste-skill/taste-skill/SKILL.md`

Use `design-system` first, then `web-design`, then `ui-ux-pro-max` for supporting research. Use `redesign-skill` when improving existing dashboard code.

## v1.2 recommended implementation order

1. Audit existing dashboard files.
2. Create or select `DESIGN.md`.
3. Convert this brief into a concise dashboard UI spec.
4. Implement above-the-fold dashboard shell only.
5. Add source/context and agent health panels.
6. Add current plan and next-action panel.
7. Add execution flow preview.
8. Add prompt handoff area.
9. Add empty, loading, error, connected, paused, and verified states.
10. Run Huashu visual composition checkpoint and dashboard verification.

**Note on step 10:** After implementation completes (Tasks 1–6), perform a Huashu visual composition checkpoint (Task 6.5 in `docs/product/tasks/v1.2-dashboard.md`) before adding handoff UI. This structured 5-dimension critique audits typography, color/contrast, layout/spacing, interaction/motion, and branding consistency. See `DESIGN.md` (canonical design system) for full Huashu integration details.

## Non-goals for first v1.2 dashboard pass

Do not build all future execution automation in the first pass.

Do not attempt full terminal replacement immediately.

Do not add complex executor orchestration unless separately planned.

Do not clutter the first screen with advanced logs or low-level technical state.

Do not redesign the product direction established by v1.0 and v1.1.

## Open questions

These questions remain open and should be answered before detailed implementation:

1. What exact plan object or execution packet format should the dashboard render first?
2. Which visual treatment should the dashboard use for active plan and execution timeline states?
3. How much of the packet preview should be visible by default versus behind progressive disclosure?
4. Which advanced debug details, if any, should remain visible in the initial v1.2 build?

## Confirmed v1.2 decisions

- Source management in v1.2 should support connect and disconnect.
- Codex and Claude Code are equal first-class handoff targets.
- The dashboard should remain AI-agnostic.
- The global command bar is planned for v1.3 or later, not required for v1.2.
- The minimum viable execution feedback loop for v1.2 is simple task status: pending, active, done, blocked, failed, verified, paused.
- The main product dashboard route should be `/dashboard`.
- Free GitHub should use copy-ready prompts, while Pro SaaS can later add direct dashboard execution.

## Acceptance criteria for the design phase

The v1.2 dashboard design phase is ready for implementation when:

- this brief is reviewed and accepted
- `DESIGN.md` (canonical design system) is complete and includes Huashu integration
- the first dashboard UI spec exists
- the first implementation task is file-scoped and above-the-fold only
- the task includes empty/loading/error states
- the task includes verification commands
- no lower-model task requires broad product reasoning
- Task 6.5 (Huashu visual checkpoint) is planned after initial composition work
