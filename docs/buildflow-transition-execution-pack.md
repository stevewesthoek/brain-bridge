# BuildFlow Transition Execution Pack
## Goal
Execute the transition from **BuildFlow / BuildFlow** to **BuildFlow** across:
- repository naming
- documentation
- endpoint/domain usage
- product messaging
- UI language
The end state should be a coherent public product named **BuildFlow**, positioned as:
> **BuildFlow turns ideas into execution packets tailored to your actual local toolchain.**
Supporting line:
> **Think in ChatGPT. Build anywhere.**
---
# 1. Repo Rename Checklist
## Objective
Rename the repo and public references from legacy names:
- `buildflow`
- `buildflow`
- BuildFlow
- `buildflow`
- BuildFlow
- `buildflow.prochat.tools`
- `buildflow.prochat.tools`
to the new public identity:
- `buildflow`
- BuildFlow
- `buildflow.prochat.tools`
while preserving working internals until later cleanup.
## Rename targets
### GitHub / repo
- [ ] rename GitHub repo from `buildflow` or `buildflow` to `buildflow`
- [ ] update repository description
- [ ] update homepage / repo website link
- [ ] update issue templates if they mention BuildFlow or BuildFlow
- [ ] update discussion/category labels if needed
### Root docs and metadata
- [ ] update `README.md`
- [ ] update `package.json` names where public-facing
- [ ] update monorepo metadata where public-facing
- [ ] update badges, clone URLs, and repo links
- [ ] update screenshots/alt text/captions if they mention BuildFlow or BuildFlow
### Internal documentation
- [ ] update strategy docs
- [ ] update deployment docs
- [ ] update architecture docs
- [ ] update setup instructions
- [ ] update examples and prompt text
### Public branding/UI
- [ ] update dashboard title
- [ ] update visible navigation labels
- [ ] update empty states and onboarding strings
- [ ] update settings copy
- [ ] update page titles and metadata
### API / setup docs
- [ ] update references to `buildflow.prochat.tools`
- [ ] update references to `buildflow.prochat.tools`
- [ ] replace canonical endpoint with `buildflow.prochat.tools`
- [ ] update OpenAPI import instructions
- [ ] update Custom GPT setup instructions
### Temporary transition language
- [ ] add temporary note: “BuildFlow is the next evolution of BuildFlow and BuildFlow.”
- [ ] remove this note later after transition is complete
## Acceptance criteria
- all top-level public docs and UI use BuildFlow
- no critical onboarding docs still instruct users to use BuildFlow or BuildFlow naming
- repo is understandable as BuildFlow in under 10 seconds
---
# 2. Repo Strategy File
## Suggested path
`docs/strategy/buildflow-rename-transition-strategy.md`
## Markdown content
```md
# BuildFlow Rename & Transition Strategy
## Summary
The product formerly known as **BuildFlow**, and later **BuildFlow**, will be sunset as a public brand and transitioned into **BuildFlow**.
This is not a cosmetic rename. It reflects a sharper product definition.
BuildFlow started as a local-first AI context bridge connecting local knowledge sources to ChatGPT. BuildFlow sharpened that into a planning and handoff concept. BuildFlow is the clearest expression of where the product has now landed: a workflow from idea to execution.
The product is now better defined as:
> **BuildFlow turns ideas into execution packets tailored to your actual local toolchain.**
The local context bridge remains part of the architecture, but the public value proposition is now planning, handoff, execution structure, and visible workflow.
## Why the rename is correct
### BuildFlow emphasized
- local context
- local knowledge sources
- privacy
- connection to ChatGPT
That was true, but too broad.
### BuildFlow emphasized
- planning
- structure
- packet generation
- handoff
That was useful, but slightly too static.
### BuildFlow emphasizes
- idea capture
- blueprint generation
- capability-aware planning
- execution packet generation
- handoff into local execution tools
- visible progress flow
The name **BuildFlow** fits this better because it is:
- more dynamic
- more workflow-oriented
- clearer for indie hackers and builders
- a better match for the actual product loop from idea to execution
## New product positioning
### One-line USP
**BuildFlow turns ideas into execution packets tailored to your actual local toolchain.**
### Supporting line
**Think in ChatGPT. Build anywhere.**
### Core positioning
BuildFlow is a local-first planning and handoff workflow for AI-native builders.
It helps users:
- start with real local context
- clarify what they want to build
- scan the tools and repo they actually have
- generate blueprint-driven execution packets
- hand off into Codex CLI, Claude Code, or any IDE workflow
## Product ladder under ProKit
### SaaSKit
- production-ready SaaS starter
- implementation base
- best-practice application foundation
### BuildFlow
- planning workflow
- idea intake
- capability-aware handoff
- execution packet generator
### Relationship
- **BuildFlow creates the execution flow**
- **SaaSKit accelerates the implementation**
## Public messaging shift
### Old public stories
- BuildFlow connects ChatGPT to local knowledge sources.
- BuildFlow helps builders go from idea to execution-ready packet.
### New public story
BuildFlow helps builders move from idea to execution-ready packet with local context, local toolchain awareness, and a clearer path from planning to implementation.
## Renaming scope
### Product name
Replace public-facing **BuildFlow** and **BuildFlow** with **BuildFlow**.
### Repo name
Rename repository from legacy names like `buildflow` or `buildflow` to `buildflow`.
### Domain / endpoint
Move public endpoint from:
- `buildflow.prochat.tools`
- `buildflow.prochat.tools`
to:
- `buildflow.prochat.tools`
### Docs
Update:
- README
- strategy docs
- architecture docs
- deployment docs
- OpenAPI references
- environment examples
- screenshots and labels
### UI language
Update all visible UI labels from BuildFlow / BuildFlow to BuildFlow.
### Site / product pages
Update prochat.tools product pages and position BuildFlow next to SaaSKit.
## Architecture continuity
The rename does not require rebuilding the technical base from scratch.
### Keep
- local agent
- relay layer
- web/API layer
- dashboard shell
- auth model
- local source management
- search/read infrastructure
- safe write flows
### Add / emphasize
- Blueprint Wizard
- Capability Scan
- Execution Packet generator
- Timeline / mission control
## Domain and endpoint transition strategy
### New canonical endpoint
`https://buildflow.prochat.tools`
### Legacy endpoint treatment
Keep legacy domains temporarily alive as redirects or compatibility layers:
- `buildflow.prochat.tools`
- `buildflow.prochat.tools`
while all docs and onboarding move to the new domain.
## Open-source to SaaS path
### Free BuildFlow
- local planning
- local context access
- capability scan
- execution packet generation
- local dashboard
- manual handoff to local tools
### Future BuildFlow Pro
- guided onboarding
- hosted control plane
- packet history across projects
- enhanced templates
- richer timeline and visibility
- diagnostics/support
- later: teams
## Final recommendation
BuildFlow should replace BuildFlow and BuildFlow as the public product, repo, endpoint, and documentation identity.
The product should be positioned as a local-first planning and handoff workflow that turns ideas into execution packets tailored to the user’s actual local toolchain.

⸻

3. Domain and Endpoint Migration Task List

Objective

Move the canonical public endpoint from legacy domains:

* buildflow.prochat.tools
* buildflow.prochat.tools

to:

* buildflow.prochat.tools

and update all connected docs, product surfaces, and setup instructions.

Tasks

Infrastructure

* provision buildflow.prochat.tools
* point it to the current web/API layer
* verify TLS / certificate issuance
* verify app routing under new domain

Application config

* update canonical app URL in environment/config
* update metadata / SEO / page titles
* update any hardcoded domain references in web app
* update OpenAPI endpoint generation if domain-aware

GPT / OpenAPI

* update canonical OpenAPI URL to https://buildflow.prochat.tools/api/openapi
* update Custom GPT instructions in docs
* test action import from new endpoint
* test bearer auth flow from new endpoint
* test action calls end-to-end

Compatibility

* keep buildflow.prochat.tools active temporarily
* keep buildflow.prochat.tools active temporarily
* redirect or proxy both legacy domains to the new canonical domain where sensible
* avoid breaking existing imports abruptly

Docs

* replace all public docs references to old endpoints
* update README quickstart
* update deployment docs
* update screenshots / examples
* update site copy and CTA links

QA

* test /api/openapi
* test health endpoint(s)
* test readiness endpoint(s)
* test search/read action flow
* test any write action currently exposed
* verify CORS / auth / proxy behavior if relevant

Acceptance criteria

* new domain is canonical everywhere public
* old domains do not break existing workflows during transition
* Custom GPT setup works against the new domain

⸻

4. Practical Codex LLM Prompts

These prompts are designed to be:

* cheap
* focused
* file-specific
* reliable
* executable in sequence

They are intentionally small and task-oriented.

Prompt 1 — Repo rename audit

You are working in the BuildFlow repo, which may still contain legacy references to BuildFlow and BuildFlow.
Goal:
Create a rename audit of all public-facing references that should move from:
- BuildFlow / buildflow / buildflow / buildflow.prochat.tools
- BuildFlow / buildflow / buildflow.prochat.tools
to:
- BuildFlow / buildflow / buildflow.prochat.tools
Tasks:
1. Search the repo for these strings:
   - BuildFlow
   - buildflow
   - buildflow
   - buildflow.prochat.tools
   - BuildFlow
   - buildflow
   - buildflow.prochat.tools
2. Group findings into:
   - README and top-level docs
   - deployment/config docs
   - UI copy
   - code comments and internal-only strings
   - endpoint/domain references
3. Output a markdown checklist at `docs/transition/rename-audit.md`.
4. Do not change files yet.
Keep the output concise and practical.

Prompt 2 — Rewrite README to BuildFlow

Update the root README.md to reposition the project from BuildFlow / BuildFlow to BuildFlow.
Requirements:
- Product name: BuildFlow
- USP: "BuildFlow turns ideas into execution packets tailored to your actual local toolchain."
- Supporting line: "Think in ChatGPT. Build anywhere."
- Keep the tone attractive to GitHub users, especially solo developers and indie hackers.
- Make the free/open-source value clear.
- Preserve the local architecture explanation.
- Frame the product as planning + handoff + execution packet generation.
- Mention that the project is transitioning from BuildFlow / BuildFlow to BuildFlow where necessary.
- Keep it practical and not overly marketing-heavy.
Also update any clone URLs, labels, and endpoint references that should point toward the new public identity.

Prompt 3 — Add strategy doc

Create a new file at `docs/strategy/buildflow-rename-transition-strategy.md`.
Write a concise strategy document explaining:
- why BuildFlow and BuildFlow are being renamed to BuildFlow
- the new product positioning
- how BuildFlow fits next to SaaSKit under ProKit
- what technical architecture remains the same
- what public messaging changes
- how the endpoint moves from buildflow.prochat.tools / buildflow.prochat.tools to buildflow.prochat.tools
- the open-source to SaaS path
Use clear markdown headings and keep it readable for future reference.

Prompt 4 — Add endpoint migration checklist

Create a file at `docs/transition/domain-endpoint-migration.md`.
Write a practical migration checklist for moving from:
- buildflow.prochat.tools
- buildflow.prochat.tools
to:
- buildflow.prochat.tools
Include:
- infrastructure tasks
- app config tasks
- OpenAPI and Custom GPT tasks
- compatibility/redirect tasks
- documentation updates
- QA checklist
- acceptance criteria
Keep the checklist execution-focused.

Prompt 5 — Rename visible UI copy only

Update visible UI copy from BuildFlow / BuildFlow to BuildFlow.
Scope:
- dashboard title
- page headings
- navigation labels
- empty states
- setup instructions shown to users
- page metadata/titles where user-visible
Rules:
- do not rename deep internal identifiers unless necessary
- do not break imports or package boundaries
- prefer minimal safe changes
- if unsure whether a string is user-visible, leave it untouched and note it
After edits, output a short summary of changed files.

Prompt 6 — Endpoint/config update pass

Update the codebase so the canonical public endpoint becomes `https://buildflow.prochat.tools`.
Tasks:
1. Find all references to:
   - `buildflow.prochat.tools`
   - `buildflow.prochat.tools`
2. Update docs and public-facing config to use `buildflow.prochat.tools`.
3. Preserve backward compatibility where obvious and low-risk.
4. If some areas should remain temporarily unchanged for compatibility, note them clearly in the final summary.
Do not invent deployment details. Only update what is already represented in the repo.

Prompt 7 — BuildFlow terminology pass

Perform a terminology cleanup pass for public docs.
Preferred terms:
- BuildFlow
- Blueprint Wizard
- Capability Scan
- Execution Packet
- Timeline
Replace or reduce old framing such as:
- BuildFlow as the primary public product name
- BuildFlow as the primary public product name
- generic "context bridge" or "planning kit" language when a more specific BuildFlow workflow term is better
Do not rewrite everything. Improve clarity while preserving technical truth.

Prompt 8 — Final transition summary

Create `docs/transition/buildflow-transition-summary.md`.
Summarize:
- what was renamed
- what still uses BuildFlow internally
- what still uses BuildFlow internally
- what endpoint is now canonical
- which files/docs were updated
- what remains to do next
Keep it short, practical, and useful for the next implementation session.

⸻

Recommended execution order for Codex

1. Prompt 1 — repo rename audit
2. Prompt 2 — README rewrite
3. Prompt 3 — strategy doc
4. Prompt 4 — endpoint migration checklist
5. Prompt 5 — visible UI copy update
6. Prompt 6 — endpoint/config update pass
7. Prompt 7 — terminology cleanup
8. Prompt 8 — final transition summary

⸻

Success criteria

This transition pack is successful when:

* the repo clearly presents as BuildFlow
* the new USP is visible in core docs
* buildflow.prochat.tools becomes the canonical public endpoint
* the old BuildFlow and BuildFlow identities are reduced to temporary migration references only
* the work can be executed in small, cheap, reliable Codex steps

This version explicitly treats **both BuildFlow and BuildFlow as legacy layers** and standardizes the destination as **BuildFlow** throughout. It is based on the uploaded transition pack, but corrected to remove the leftover and self-referential naming drift.  [oai_citation:1‡buildflow-transition-execution-pack.md](sediment://file_00000000dac071f4bace0648992aab3d)
The next document that should be transformed the same way is the **Custom GPT schema + instruction**, because that is where name drift will break the migration fastest.