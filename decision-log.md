# Decision Log

Durable decisions for brain-bridge. Append-only archive.

## 2026-04-16 -- Port migration and Cloudflare tunnel

- Decision: Migrate web app from port 3000 to fixed port 3054
- Reason: Avoid conflicts with other dev apps; stable endpoint for Cloudflare tunnel
- Impact: All references updated (package.json, README, docs, OpenAPI); public URL stable at https://brainbridge.prochat.tools

## 2026-04-16 -- ChatGPT Custom GPT MVP scope

- Decision: Phase 3 limited to read-only actions (search, read) with no authentication
- Reason: Fast iteration for MVP verification; safe for local testing
- Impact: Confirmed Custom GPT integration works; Phase 3.5 adds combined search-and-read for fewer confirmations

## 2026-04-16 -- OpenAPI 3.1.0 + operationId requirement

- Decision: Use OpenAPI 3.1.0 with operationId for each action
- Reason: ChatGPT requires operationId for Custom Actions (not 3.0.0)
- Impact: Created reusable schemas in components section; compatible with ChatGPT UI

## 2026-04-16 -- Phase 3.5 combined search-and-read action

- Decision: Add search-and-read endpoint to reduce ChatGPT confirmation prompts
- Reason: User feedback: Custom GPT asks for confirmation on every action call; combined action fewer calls
- Impact: New /api/actions/search-and-read (max 3 results capped for safety); all actions remain read-only, no authentication

