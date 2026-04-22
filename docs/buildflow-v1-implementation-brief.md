# BuildFlow v1 Implementation Brief
## Product summary
**BuildFlow turns ideas into execution packets tailored to the user’s actual local toolchain.**
BuildFlow is the evolution of **BuildFlow** and **BuildFlow** into a local-first planning and handoff workflow for builders. The product starts with local context, guides a user through a blueprint-style planning flow, scans the machine and repo for real capabilities, and generates structured execution packets that can be picked up by Codex CLI, Claude Code, or any IDE workflow.
## Core product promise
**Think in ChatGPT. Build anywhere.**
BuildFlow helps users:
- start planning with real local context
- capture the idea through a Blueprint Wizard
- scan the actual local environment and repo
- generate execution packets tailored to the detected toolchain
- hand off to any execution tool with visibility in the dashboard
## Why this matters
Most AI workflows break between thinking and doing.
Users can brainstorm in ChatGPT, but then they lose context, lose structure, and manually recreate the plan inside a coding tool. Many tools are good at reasoning or good at execution, but the handoff between the two is weak.
BuildFlow solves this by preserving context, structuring planning output, and converting it into execution-ready local artifacts.
## Product entities
### 1. Blueprint Wizard
A guided conversational intake flow that clarifies what the user wants to build.
### 2. Capability Scan
A local scan that detects installed tools, repo signals, and useful execution capabilities.
### 3. Execution Packet
A structured local artifact bundle containing the plan, phases, tasks, prompts, and run metadata.
### 4. Timeline
A dashboard-visible execution view showing the state of a packet and its progress over time.
## v1 product scope
BuildFlow v1 should focus on one strong loop:
1. user starts with an idea
2. BuildFlow helps capture the idea via a Blueprint Wizard
3. BuildFlow scans the machine and repo
4. BuildFlow generates an execution packet into the local file system
5. dashboard shows the packet, prompts, phases, and execution status
6. user copies a prompt into Codex CLI, Claude Code, or an IDE
v1 should not try to become a full runtime replacement for coding agents.
## v1 folder structure
```text
.buildflow/
  blueprint/
    session.json
    summary.md
    capability-profile.json
    repo-profile.json
  plan/
    overview.md
    phases.json
    tasks.json
    acceptance-criteria.md
  prompts/
    codex/
      phase-01.txt
      phase-02.txt
    claude/
      phase-01.txt
      phase-02.txt
  execution/
    active-run.json
    timeline.jsonl
    status.json
    logs/
  artifacts/
    decisions.md
    risks.md

Note: during migration, legacy .buildflow/ or .buildflow/ structures may still exist temporarily, but the target public structure should be .buildflow/.

Engineering phases

Phase 0 — Reposition BuildFlow / BuildFlow as BuildFlow

Goal

Update the product identity, messaging, and core terminology without discarding the working architecture.

Tasks

* rename public-facing product from BuildFlow / BuildFlow to BuildFlow
* keep older names only as temporary migration references if needed
* update README
* update repo description
* update dashboard copy
* update strategy document
* align site copy on prochat.tools / ProKit
* define final terminology:
    * Blueprint Wizard
    * Capability Scan
    * Execution Packet
    * Timeline

Deliverables

* consistent BuildFlow naming
* updated public messaging
* aligned docs and product language

Acceptance criteria

* repo front page reflects BuildFlow clearly
* all user-facing copy describes the planning-to-execution workflow
* no major public-facing docs still describe the product only as a context bridge or planning-kit concept

⸻

Phase 1 — Capability Scan foundation

Goal

Make BuildFlow aware of the user’s local machine and repo before planning is finalized.

Scope

Detect:

* executors like codex, claude
* package managers like pnpm, npm, bun
* runtimes like node, python, uv
* deployment tools like docker, dokploy, vercel
* repo signals like package.json, lockfiles, framework markers
* useful capabilities like read/write access and shell availability

Tasks

* create capability scanner module in local agent
* create repo profile scanner
* expose profile data through API
* store scan outputs locally in .buildflow/blueprint/
* show capability profile in dashboard

Proposed API endpoints

* getCapabilityProfile
* getRepoProfile

Example capability profile

{
  "executors": ["codex-cli", "claude-code"],
  "package_managers": ["pnpm"],
  "runtime": ["node"],
  "deployment": ["dokploy", "docker"],
  "vcs": ["git"],
  "permissions": {
    "can_read_repo": true,
    "can_write_buildflow": true,
    "can_run_shell": true
  }
}

Deliverables

* capability profile JSON
* repo profile JSON
* dashboard capability scan panel

Acceptance criteria

* scan runs locally and produces stable JSON
* common tools are detected reliably
* dashboard presents environment information clearly

⸻

Phase 2 — Blueprint Wizard schema and session flow

Goal

Create the structured planning intake model that turns chat into machine-usable planning input.

Blueprint session schema

* id
* idea_summary
* project_mode
* problem_statement
* target_user
* constraints
* stack_preferences
* deployment_target
* preferred_executor
* success_criteria
* capability_profile_ref
* repo_profile_ref
* open_questions
* status

Tasks

* define Blueprint Session schema
* create session storage model
* add endpoints to create, read, update, finalize
* support incremental updates from chat
* render a draft blueprint in dashboard

Proposed API endpoints

* startBlueprintSession
* saveBlueprintAnswers
* getBlueprintSession
* finalizeBlueprintSession

Example blueprint session

{
  "id": "bp_001",
  "idea_summary": "Build a small SaaS for ...",
  "project_mode": "existing-repo",
  "preferred_executor": "codex-cli",
  "deployment_target": "dokploy",
  "constraints": ["speed", "low cost"],
  "status": "draft"
}

Deliverables

* stable blueprint session schema
* draft/finalized session states
* dashboard blueprint draft view

Acceptance criteria

* a session can be started from chat
* answers can be saved incrementally
* session can be finalized without manual JSON editing

⸻

Phase 3 — Execution Packet generator

Goal

Convert a finalized blueprint into a structured local execution packet.

Packet outputs

Human-readable

* overview.md
* decisions.md
* risks.md
* acceptance-criteria.md

Machine-readable

* phases.json
* tasks.json
* status.json
* active-run.json

Executor-specific

* prompts for Codex
* prompts for Claude Code

Tasks

* define packet generation rules
* choose packet template based on blueprint + capability scan + repo mode
* write files into .buildflow/
* generate phased task files
* generate executor-specific prompts
* persist metadata for dashboard rendering

Proposed API endpoints

* generateExecutionPacket
* listExecutionPackets
* readExecutionPacket

Deliverables

* packet schema
* packet generator
* packet files written locally

Acceptance criteria

* a finalized blueprint generates a usable packet
* generated prompts are directly usable in Codex/Claude workflows
* packet files are deterministic and inspectable

⸻

Phase 4 — Dashboard mission control

Goal

Make the dashboard the visible product differentiator.

Required views

Blueprint view

* idea summary
* selected stack
* preferred executor
* deployment target
* constraints
* open questions

Environment view

* installed CLIs
* repo profile
* write permissions
* execution capabilities

Packet view

* overview
* phases
* tasks
* copy prompt buttons
* open file buttons

Timeline view

* blueprint started
* packet generated
* execution started
* files changed
* task completed
* next recommended step

Tasks

* redesign dashboard IA around Blueprint → Packet → Timeline
* add copy-to-clipboard prompt UX
* add environment summary card
* render packet file contents cleanly
* add status indicators

Deliverables

* updated dashboard flows
* packet visualization
* timeline view

Acceptance criteria

* user can understand the workflow visually in one session
* prompts and tasks are accessible without opening raw files first
* dashboard reflects current packet state clearly

⸻

Phase 5 — Handoff UX

Goal

Make manual handoff to execution tools fast and reliable.

v1 handoff model

* copy Codex prompt
* copy Claude prompt
* open packet folder
* open task file
* mark task or phase status

Tasks

* expose prompt retrieval endpoints
* build per-executor prompt views
* add buttons for copy/open actions
* support manual status changes
* write events into timeline file

Proposed API endpoints

* getExecutorPrompts
* updateRunStatus
* appendTimelineEvent

Deliverables

* manual handoff UX
* prompt actions
* task status actions

Acceptance criteria

* user can move from packet generation to execution in under 2 minutes
* prompts are specific to the selected executor
* timeline updates reflect user actions

⸻

Phase 6 — Lightweight execution visibility

Goal

Provide useful progress visibility without trying to fully automate every coding tool.

Mechanisms

* watch .buildflow/execution/status.json
* watch .buildflow/execution/timeline.jsonl
* watch selected repo changes
* summarize git diffs
* show last activity and changed files

Tasks

* build file watchers
* ingest status/timeline events into dashboard
* summarize touched files and recent changes
* show current phase and last update

Deliverables

* live-ish timeline
* recent changes panel
* active phase panel

Acceptance criteria

* dashboard shows meaningful progress signals
* users can tell what was planned, what is running, and what changed
* no deep executor integration is required for basic usefulness

⸻

Phase 7 — SaaS readiness boundary

Goal

Prepare a clean open-source to SaaS path without undermining the free repo.

Free BuildFlow

* local capability scan
* blueprint sessions
* local execution packet generation
* local dashboard
* manual handoff
* basic timeline

Future BuildFlow Pro

* hosted control plane
* guided onboarding and installer
* synced packet history across projects
* enhanced packet templates
* richer execution visibility
* diagnostics and support
* later: teams and collaboration

Tasks

* define free vs pro line clearly
* document hosted control plane concept
* define first paid convenience features
* prepare pricing positioning

Acceptance criteria

* open-source BuildFlow is useful on its own
* paid layer is clearly convenience, not coercion
* the repo naturally leads to a future Pro story

⸻

Repo-area implementation map

Local agent / CLI layer

Should own:

* capability scan
* repo scan
* blueprint session file handling
* packet writing
* timeline/status writing

Relay layer

Should remain mostly stable in v1.
Only extend if new session/packet APIs require relay routing.

Web app / dashboard

Should own:

* Blueprint Wizard UI
* environment scan UI
* packet visualization
* prompt copy UX
* timeline view

Docs

Should add:

* packet spec
* blueprint schema
* capability profile spec
* free vs pro boundary
* migration notes from BuildFlow / BuildFlow to BuildFlow

Suggested v1 milestone

Demo target

Idea to packet

1. user starts with a product idea in ChatGPT
2. BuildFlow loads local context
3. BuildFlow asks clarifying questions
4. BuildFlow scans the local toolchain and repo
5. BuildFlow generates a local execution packet
6. dashboard shows phases, prompts, and run status
7. user copies a Codex or Claude prompt and starts execution

This is the first strong public demo milestone.

Success metrics for v1

* a user can go from vague idea to packet in one session
* packet output is visibly tailored to machine and repo context
* prompts are immediately usable in at least one external executor
* dashboard makes the workflow legible without raw file inspection
* product value is understandable in under 10 seconds

Immediate next actions

1. lock product naming: BuildFlow
2. update README and public copy
3. define CapabilityProfile JSON schema
4. define BlueprintSession JSON schema
5. define packet folder specification
6. implement capability scan in local agent
7. implement blueprint session persistence
8. implement packet generator for one main path
9. build first dashboard packet view
10. prepare the first “idea to packet” demo

One-line USP

BuildFlow turns ideas into execution packets tailored to your actual local toolchain.

Supporting line

Think in ChatGPT. Build anywhere.