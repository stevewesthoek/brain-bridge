# BuildFlow Rename & Transition Strategy

## Summary

The product formerly known as **BuildFlow**, and more recently **BuildFlow**, will be sunset as a public brand and transitioned into **BuildFlow**.

This is not a cosmetic rename. It reflects a sharper product definition.

BuildFlow started as a local-first AI context bridge connecting local knowledge sources to ChatGPT. BuildFlow refined that concept into planning and handoff. BuildFlow is the clearest expression of where the product has now landed: a workflow from idea to execution.

The product is now better defined as:

> **BuildFlow turns ideas into execution packets tailored to your actual local toolchain.**

The local context bridge remains part of the architecture, but the public value proposition is now planning, handoff, execution structure, and visible workflow.

The transition should therefore include:
- public product rename from BuildFlow / BuildFlow to BuildFlow
- repo rename
- endpoint/domain rename to `buildflow.prochat.tools`
- documentation rewrite
- dashboard and UX language update
- website/product ladder update under ProKit / prochat.tools
- migration messaging for anyone who saw or used BuildFlow or BuildFlow previously

## Why the rename is correct

### The old BuildFlow framing emphasized:
- local context
- local knowledge sources
- privacy
- connection to ChatGPT

That was true, but too broad.

### The BuildFlow framing emphasized:
- planning
- structure
- packet generation
- handoff

That was useful, but slightly too static.

### The clearer wedge now is:
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

The rename also improves product-family coherence.

### Existing flagship
**SaaSKit**
- production-ready SaaS starter
- implementation base
- best-practice application foundation

### New sibling product
**BuildFlow**
- planning workflow
- idea intake
- capability-aware handoff
- execution packet generator

### Clear relationship
- **BuildFlow creates the execution flow**
- **SaaSKit accelerates the implementation**

This creates a stronger commercial system under ProKit than keeping BuildFlow or BuildFlow as transitional public brands.

## Public messaging shift

### Old public stories
- BuildFlow connects ChatGPT to local knowledge sources.
- BuildFlow helps builders go from idea to execution-ready packet.

### New public story
BuildFlow helps builders go from idea to execution-ready packet with local context, local toolchain awareness, and a clearer path from planning to implementation.

### What stays true technically
- local-first architecture
- local sources remain important
- search/read flows remain core building blocks
- relay/web/agent architecture remains useful
- privacy and local control remain part of the product value

### What changes publicly
The public product is no longer primarily sold as a knowledge connector.
It is sold as a **planning-to-execution workflow system**.

## Renaming scope

The rename should be executed completely and consistently.

### 1. Product name
Replace public-facing **BuildFlow** and **BuildFlow** with **BuildFlow**.

### 2. Repo name
Rename repository from legacy names such as:
- `buildflow`
- `buildflow`

to:

- `buildflow`

### 3. Domain / endpoint
Move public endpoint from:
- `buildflow.prochat.tools`
- `buildflow.prochat.tools`

to:

- `buildflow.prochat.tools`

### 4. Docs
Update:
- README
- strategy docs
- architecture docs
- deployment docs
- OpenAPI references where needed
- environment examples
- screenshots and labels

### 5. UI language
Update all visible UI labels from BuildFlow / BuildFlow to BuildFlow, including:
- dashboard title
- navigation labels
- settings copy
- health/status strings where user-visible
- setup instructions

### 6. Site / product pages
Update:
- prochat.tools product pages
- product navigation
- pricing / coming soon messaging
- product comparisons / complements with SaaSKit

### 7. Migration messaging
For any prior references, use temporary language like:
- “BuildFlow is the next evolution of BuildFlow.”
- “BuildFlow is the next evolution of BuildFlow.”

This should remain temporary and then be removed once the rename is fully absorbed.

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

The technical architecture continues to power the product, but the product story moves from bridge infrastructure and planning-kit language to execution workflow.

## Domain and endpoint transition strategy

### New canonical endpoint
`https://buildflow.prochat.tools`

### Legacy endpoint treatment

Recommended approach:
- keep `buildflow.prochat.tools` temporarily alive as a redirect or compatibility layer
- keep `buildflow.prochat.tools` temporarily alive as a redirect or compatibility layer
- point users and docs to `buildflow.prochat.tools` as the canonical endpoint
- gradually phase out BuildFlow and BuildFlow references

### Endpoint transition tasks
- provision new subdomain
- update web app environment/config
- update OpenAPI schema URL references
- update Custom GPT instructions
- update any static docs or screenshots showing old endpoints
- test health, readiness, and action routes under the new domain

## Documentation transition plan

### README
Rewrite around BuildFlow and execution packets.

### Strategy docs
Replace BuildFlow / BuildFlow framing with BuildFlow rename and transition strategy.

### Deployment docs
Update domain, app naming, and environment examples.

### Architecture docs
Keep architecture accurate, but rewrite the explanation to support BuildFlow’s public wedge.

### Examples and prompts
Update examples from:
- “search my brain”

to more BuildFlow-aligned examples such as:
- “turn this idea into an execution packet”
- “scan my repo and create a phased implementation plan”

## Open-source to SaaS path

The rename also improves the SaaS story.

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

This is cleaner than trying to monetize BuildFlow as a general context bridge or BuildFlow as a transitional planning brand.

## Risks of the rename

### 1. Temporary confusion
People may still see old references to BuildFlow or BuildFlow.

**Mitigation:**  
Use temporary transition lines:
- BuildFlow is the next evolution of BuildFlow.
- BuildFlow is the next evolution of BuildFlow.

### 2. Incomplete rename
Some docs, endpoints, or env variables may still use old names.

**Mitigation:**  
Run a full rename checklist across repo, site, docs, UI, and API references.

### 3. Technical debt in naming
Internal package names may still reference BuildFlow or BuildFlow for a while.

**Mitigation:**  
Allow internal names to lag behind the public rename temporarily, but avoid exposing them in public-facing docs or UI.

### 4. Lost continuity
A complete rename can make the prior project history feel disconnected.

**Mitigation:**  
Use one clear sentence during transition:

> BuildFlow evolves BuildFlow and BuildFlow into a planning-to-execution workflow product.

## Rename checklist

### Brand / product
- [ ] confirm final public product name: BuildFlow
- [ ] update tagline and USP
- [ ] update product descriptions

### Repo
- [ ] rename GitHub repo
- [ ] update package metadata where needed
- [ ] update badges / URLs / clone instructions

### Domain / app
- [ ] provision `buildflow.prochat.tools`
- [ ] update deployment configuration
- [ ] update canonical OpenAPI endpoint
- [ ] test all public routes

### Docs
- [ ] update README
- [ ] update strategy docs
- [ ] update deployment docs
- [ ] update architecture docs
- [ ] update examples and screenshots

### UI
- [ ] update dashboard name and visible strings
- [ ] update setup flows
- [ ] update empty states and prompts

### GPT / Actions
- [ ] update Custom GPT instructions
- [ ] update OpenAPI import references
- [ ] update action descriptions if needed

### Website / marketing
- [ ] add BuildFlow product page under ProKit / prochat.tools
- [ ] update product navigation
- [ ] position BuildFlow next to SaaSKit
- [ ] update X bio and public build-in-public messaging

## Recommended execution order

### Phase 1 — Lock the public identity
- finalize BuildFlow naming
- finalize USP and tagline
- update README
- update strategy doc

### Phase 2 — Move the public surface
- provision `buildflow.prochat.tools`
- update app branding
- update website/product page
- update OpenAPI docs and setup instructions

### Phase 3 — Rename repo and docs thoroughly
- rename repo
- update package/docs references
- add temporary migration notice

### Phase 4 — Remove transition language over time
- remove “formerly BuildFlow” messaging after transition period
- remove “formerly BuildFlow” messaging after transition period
- fully normalize BuildFlow as the only public identity

## Final recommendation

The rename should go ahead.

BuildFlow served as a useful early name while the product was a general local context bridge. BuildFlow served as a useful intermediate name while the product sharpened around planning and handoff. Now that the wedge is clearer, **BuildFlow** is the better product name.

It better matches the actual workflow, is clearer for builders, and gives the future SaaS a stronger commercial position.

## Final strategy statement

BuildFlow should replace BuildFlow and BuildFlow as the public product, repo, endpoint, and documentation identity.

The product should be positioned as a local-first planning and handoff workflow that turns ideas into execution packets tailored to the user’s actual local toolchain.

The technical bridge architecture remains important, but it should support the product story rather than define it publicly.