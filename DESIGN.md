# BuildFlow Design System

## Status

Canonical design source of truth for the BuildFlow dashboard and future product UI.

This document guides v1.2 dashboard design and implementation. It does not claim that the dashboard is already implemented.

## Product design goal

BuildFlow should feel like a premium, calm, practical control center for moving from AI reasoning to structured execution.

The dashboard should make the user feel:

- BuildFlow knows which sources are connected
- BuildFlow understands the current project context
- BuildFlow can show the active plan or execution packet
- BuildFlow knows the next useful action
- BuildFlow can help continue or resume work without terminal anxiety

The interface should be easy enough for non-technical users while still useful for experienced AI builders.

## Design direction

Use this direction:

> Linear + Resend + a little Apple.

Meaning:

- Linear: precise workflow, calm status, strong hierarchy, fast product feel
- Resend: clean developer-product polish, restrained surfaces, modern SaaS clarity
- Apple: spacious, obvious, premium, non-intimidating simplicity

Avoid:

- generic AI SaaS gradients
- cockpit-style developer clutter
- dense analytics dashboards
- neon cyber styling
- excessive cards and borders
- decorative animation that does not help the workflow
- default-looking shadcn UI without product-level styling

## Core dashboard rule: no page scroll

The BuildFlow dashboard is a dashboard, not a scrolling website.

The main `/dashboard` page should fit within the viewport and should not require vertical page scrolling during normal use.

Rules:

- the whole dashboard page should use a fixed viewport layout
- primary content should be visible above the fold
- avoid long stacked sections that push the page downward
- use tabs, panels, drawers, side navigation, split panes, or modals when more information is needed
- scrolling is allowed inside contained panels only when necessary
- examples of acceptable internal scroll areas:
  - source list panel
  - activity/timeline panel
  - execution packet preview
  - advanced/debug drawer
  - long prompt preview
- the browser page itself should not become the main navigation mechanism

Implementation implication:

- prefer `h-screen`, `overflow-hidden`, and contained `overflow-auto` panel regions
- test at common laptop sizes, especially 1440×900 and 1366×768
- if content does not fit, reduce density or move secondary details behind progressive disclosure instead of adding page scroll

## Dashboard information hierarchy

The first screen should answer, in this order:

1. What is connected?
2. Is BuildFlow healthy?
3. What project or workspace am I in?
4. What plan or execution packet is active?
5. What should I do next?
6. What has already happened?
7. What can I inspect if I need more detail?

The user should not need to scan a wall of widgets to understand the next step.

## Primary dashboard layout

Recommended desktop layout:

1. Top bar
   - BuildFlow identity
   - project/workspace selector
   - compact global status indicator
   - light/dark mode toggle
   - settings/advanced entry

2. Left rail or sidebar
   - Overview
   - Sources
   - Plan
   - Execution packet
   - Handoff
   - Activity
   - Settings

3. Main panel
   - current build flow
   - active plan or execution packet
   - one primary next action
   - concise task progress

4. Right insight panel
   - source/context health
   - agent health
   - latest event
   - prompt handoff shortcuts

5. Internal drawers/details
   - advanced debug state
   - raw paths
   - raw output
   - full prompt text
   - full packet preview

The default view should fit in one viewport without page scroll.

## v1.2 dashboard scope

The first dashboard implementation should focus on the free GitHub launch.

Include:

- local source status
- connect/disconnect source entry points
- active context mode
- local agent health
- current plan or execution packet preview
- simple task status model
- next recommended action
- copy-ready Codex prompt
- copy-ready Claude Code prompt
- local timeline/checklist preview
- empty/loading/error/connected states

Do not include yet:

- hosted account flows
- billing
- team workspaces
- direct managed executor sessions
- full live terminal replacement
- cloud sync
- aggressive Pro upsells

The design should be Pro-ready without making the free version feel restricted.

## Free, Pro, and Team UI treatment

BuildFlow Free:

- complete local-first planning and handoff workflow
- no artificial source count limits
- local dashboard included
- copy-ready prompts included
- Codex and Claude Code handoff included
- source management included

BuildFlow Pro later:

- hosted account
- easier onboarding
- cloud-backed plan history
- direct dashboard execution where feasible
- managed execution feedback
- reduced terminal and setup friction
- advanced integrations

BuildFlow Team later:

- team workspaces
- shared projects
- roles and permissions
- collaboration and review workflows

UI rule:

Do not make the free dashboard feel like a trial. Avoid locked core cards and aggressive upgrade banners.

Acceptable Pro treatment:

- subtle “future Pro” labels in secondary areas
- settings-level references to hosted features
- copy-prompt fallback where direct execution is future/Pro
- architecture that can later add account, cloud, and team states without redesign

## Visual principles

Use:

- high-quality spacing
- precise alignment
- restrained color
- strong text hierarchy
- subtle borders
- soft shadows only when useful
- status indicators that are easy to understand
- calm empty states
- crisp hover and focus states

Avoid:

- too many cards
- too many icons
- too many colors
- giant hero sections
- long marketing copy inside the dashboard
- gradients as the primary design language
- visual density that creates intimidation

## Typography

Typography should feel modern, precise, and readable.

Guidelines:

- use a clean sans-serif system or project-approved font stack
- prefer clear hierarchy over decorative typography
- keep body copy concise
- use sentence case for labels and headings
- avoid all-caps except for tiny status labels where useful
- use tabular numbers for counts, task progress, and status metrics if available

Suggested hierarchy:

- page title: calm and compact, not huge
- section titles: small but clear
- labels: muted and readable
- status values: visually stronger than labels
- helper text: short, plain language

## Color direction

Light mode:

- warm off-white background instead of harsh pure white
- near-black text, not absolute black everywhere
- soft neutral borders
- subtle surface elevation
- restrained accent color for primary actions and active state

Dark mode:

- deep neutral background
- avoid purple-heavy or neon style
- maintain contrast without glowing effects
- keep status colors clear but muted

Status color rules:

- ready/connected: green, subtle
- active/running: blue or neutral accent
- warning/needs attention: amber
- failed/error: red, restrained but clear
- paused: gray or amber
- verified/completed: green with clear text

Never rely on color alone. Always pair color with text or icon state.

## Spacing and density

Default density should be comfortable, not sparse to the point of wasting the viewport.

The dashboard must fit without page scroll, so use disciplined density:

- generous outer padding, but not oversized
- compact headers
- small, high-signal panels
- avoid large decorative blocks
- keep lists short by default with internal scrolling or expansion
- show summaries first and details on demand

## Component system

Core components:

- AppShell
- TopBar
- Sidebar or LeftRail
- StatusPill
- SourceStatusCard
- AgentHealthCard
- CurrentPlanPanel
- NextActionPanel
- ExecutionTimeline
- TaskStatusRow
- PromptHandoffCard
- PacketPreviewPanel
- EmptyState
- LoadingState
- ErrorState
- DetailsDrawer
- AdvancedDebugPanel

Each component should have:

- default state
- loading state where relevant
- empty state where relevant
- error or warning state where relevant
- keyboard focus state
- responsive behavior

## Dashboard states

Required product states:

1. No source connected
   - plain explanation
   - primary action: connect source

2. Source connected but not ready
   - show indexing or pending state
   - explain that BuildFlow is preparing context

3. Source ready, no active plan
   - show source health and readiness
   - primary action: start blueprint or continue in ChatGPT

4. Active plan exists
   - show plan name
   - show current phase
   - show progress summary
   - show next action

5. Execution packet exists
   - show compact packet preview
   - show prompt handoff options
   - show task status summary

6. Paused plan
   - show resume action
   - show last completed task
   - show next task

7. Blocked or failed task
   - show what needs attention
   - show non-scary recovery language
   - hide raw debug details behind advanced view

8. Verified/completed task
   - show success clearly
   - offer next task or review result

## Simple execution feedback model

For v1.2, use a simple status model:

- pending
- active
- done
- blocked
- failed
- verified
- paused

Do not design v1.2 around full live terminal orchestration.

The UI should still leave room for future richer feedback:

- live executor run state
- summarized terminal output
- pause/resume/stop controls
- task-level verification updates
- executor-agnostic run history

## Handoff design

Codex and Claude Code are equal first-class handoff targets.

The free GitHub dashboard should provide:

- clear Codex prompt card
- clear Claude Code prompt card
- one-click copy buttons
- short explanation of where to paste the prompt
- token-conscious prompts optimized for lower-cost executor models

Future Pro may add:

- direct run from dashboard
- managed executor sessions
- richer execution feedback

Do not make future Pro execution controls block free copy-prompt workflows.

## Plan and packet preview

The dashboard should design around the local `.buildflow/` packet structure shown in the README:

- blueprint
- plan
- prompts
- execution
- artifacts

Default preview:

- current phase
- progress count
- active task
- next task
- latest artifact or verification state

Progressive disclosure:

- full phases
- full task list
- generated prompts
- risks
- decisions
- raw packet files

Do not show full packet content by default if it makes the viewport scroll.

## Language and copy

Use plain, confident language.

Prefer:

- Connected
- Ready
- Resume plan
- Next task
- Copy Codex prompt
- Copy Claude Code prompt
- Generate packet
- Source needs attention
- Review result
- Verified

Avoid:

- scary terminal language
- internal endpoint names
- raw implementation details
- vague AI marketing phrases
- “unleash”
- “seamless”
- “next-gen”
- “revolutionary”

Tone:

- calm
- clear
- helpful
- direct
- never patronizing

## Accessibility

Minimum expectations:

- keyboard navigable primary actions
- visible focus states
- sufficient contrast in light and dark mode
- status text in addition to color
- semantic button/link usage
- readable text at laptop sizes
- no essential information hidden only behind hover
- reduced motion respected where possible

## Responsive behavior

Primary target:

- desktop and laptop dashboard use
- especially 1440×900 and 1366×768

Secondary target:

- tablet-width layouts should remain usable

Mobile:

- mobile can use stacked panels and page scroll if necessary
- the no-page-scroll rule primarily applies to desktop/laptop dashboard use

## Implementation rules for lower models

When Haiku, Codex mini, or another lower-capability model implements UI:

- read this `DESIGN.md` first
- read `docs/product/dashboard-design-brief.md`
- read `docs/product/launch-strategy.md`
- make one narrow change at a time
- do not redesign the product direction
- do not add Pro-only features to the free dashboard
- do not introduce page-level dashboard scrolling on desktop
- do not implement full live terminal orchestration in v1.2
- do not change API routes or Custom GPT action names
- preserve existing runtime behavior unless the task explicitly says otherwise

Each task must include:

- allowed files
- exact visual scope
- states to implement
- acceptance criteria
- verification commands
- screenshot or manual review checklist where possible

## Visual review checklist

Before accepting dashboard UI work, check:

- Does `/dashboard` fit in one viewport on 1440×900?
- Does `/dashboard` avoid page-level vertical scroll on desktop?
- Is the next action obvious within five seconds?
- Are source and agent health visible immediately?
- Is the current plan or empty state clear?
- Are Codex and Claude Code both visible as handoff paths when relevant?
- Are advanced/debug details hidden by default?
- Does the UI feel calm and premium rather than busy?
- Does light mode look warm and polished?
- Does dark mode avoid neon/generic AI styling?
- Are empty, loading, error, connected, paused, and verified states represented?

## Design references from Brain skills

Use the Brain design skills as supporting input:

- `brain/ai/skills/custom/design-system/SKILL.md` for durable design-system setup
- `brain/ai/skills/custom/web-design/SKILL.md` for implementation-ready UI specs
- `brain/ai/skills/custom/ui-ux-pro-max/SKILL.md` for style, palette, dashboard, shadcn, and Next.js design intelligence
- `brain/ai/skills/custom/taste-skill/redesign-skill/SKILL.md` for improving existing dashboard UI without product redesign
- `brain/ai/skills/custom/taste-skill/taste-skill/SKILL.md` for premium frontend guardrails

Use these skills to support BuildFlow's design direction, not to override the product strategy.

## Huashu Visual Production and Critique Layer

**Purpose:** BuildFlow uses Huashu (`brain/ai/skills/custom/huashu-design/`) for tangible visual production artifacts, side-by-side before/after comparisons, and structured 5-dimension design critique. Huashu is a supporting layer, not a replacement for this document.

### What Huashu Is Used For

- ✅ **HTML-native prototypes** — Clickable demos showing layout options, panel stacking, tab vs. drawer tradeoffs
- ✅ **Visual variants and A/B comparison** — Side-by-side layouts showing current dashboard vs. proposed improvements
- ✅ **5-dimension design critique** — Structured audit of typography, color/contrast, layout/spacing, interaction/motion, branding/consistency
- ✅ **Browser verification** — Testing dashboard at common sizes (1440×900, 1366×768) and ensuring no-page-scroll rule is maintained
- ✅ **Animations and motion** — Only when purposeful to the workflow (not decorative)

### What Huashu Does NOT Replace

- **`DESIGN.md` product strategy** — This document remains the canonical source of truth for brand direction, core dashboard rule, information hierarchy, non-goals
- **Implementation task order** — Tasks 1–11 in `docs/product/tasks/v1.2-dashboard.md` define the sequence; Huashu is a verification checkpoint, not a bypass
- **No-page-scroll rule** — The fixed-viewport constraint is non-negotiable; Huashu critique must confirm it is maintained
- **API contracts or Custom GPT schema** — Huashu is dashboard UI and design only; never touches backend, routes, or schema

### 5-Dimension Critique Framework

When a dashboard task requires visual review, use Huashu to audit these dimensions:

1. **Typography:** Hierarchy, readability, font choices, scanability
2. **Color & Contrast:** Palette cohesion, WCAG AA accessibility, emotional tone, no generic AI purple
3. **Layout & Spacing:** Alignment, breathing room, visual balance, consistent grid, generous whitespace
4. **Interaction & Motion:** Hover/focus states, transition smoothness (200–300ms), clear feedback, purposeful motion only
5. **Branding & Consistency:** Adherence to this `DESIGN.md`, no generic AI patterns, coherent across sections

### Anti-Patterns to Avoid in Huashu Critique

- Purple AI gradients or neon styling
- Emoji-as-icons or fake SVG people/faces
- Left-border accent card pattern overused
- Chaotic alignment or missing whitespace
- Decorative motion that doesn't serve the workflow
- Generic shadcn defaults without product-level polish
- Inconsistent typography, color, or spacing

### Verification Workflow

After major dashboard composition tasks (e.g., after Task 6, before Task 7):

1. **Run Huashu visual critique** on current dashboard using the 5 dimensions
2. **Identify layout issues** — Is the main content stack optimal? Should panels be tabs, drawers, or split-pane instead?
3. **Verify no-page-scroll** — Test at 1440×900 and 1366×768 to ensure desktop/laptop users never see vertical page scroll
4. **Document findings** in a checkpoint document (e.g., `docs/product/tasks/v1.2-dashboard-huashu-checkpoint.md`)
5. **Do not implement code** during the checkpoint unless explicitly requested in a follow-up task
6. **Restore local web health** after checkpoint verification (verify port 3054 is healthy)

### Honesty and Verification

- **Never claim export/screenshot success without generated files** — Huashu must produce actual HTML artifacts or report limitations
- **Check for tool dependencies before export** — Playwright, ffmpeg, python-pptx require explicit verification
- **Browser-verified only** — Designs shown must be tested in actual browser, not just claimed
- **When tools are missing** — Provide export-ready HTML + exact CLI commands instead of claiming success

### Integration with BuildFlow Tasks

- **Task 6.5 (Huashu Visual Checkpoint):** Perform 5-dimension critique of current dashboard (Tasks 1–6 complete)
- **Implementation tasks** (7, 8, 9, 10) can use Huashu critique findings as input
- **Task 11 (Final Verification):** Include Huashu-informed visual review checklist

## Non-goals

Do not design BuildFlow as:

- a generic analytics dashboard
- a terminal replacement in v1.2
- a developer-only cockpit
- a marketing landing page
- a locked-down trial UI
- a single-executor product
- a Pro-first SaaS that makes free users feel restricted

## Summary

BuildFlow's dashboard should be a calm, premium, fixed-viewport control center for local-first AI planning and execution handoff.

The free GitHub dashboard should feel complete, useful, and generous.

The future Pro dashboard should add convenience, hosted persistence, direct execution, and managed workflows without requiring a redesign.

Everything should serve the core product promise:

> Think in ChatGPT. Build anywhere.
