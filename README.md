# Brain Bridge

Connect your local knowledge vault (Obsidian, markdown files) to ChatGPT. Search, read, and create notes directly from your knowledge base.

## What Is It?

Brain Bridge is a privacy-first bridge between ChatGPT and your personal knowledge vault. It lets you:
- **Search** your local brain from ChatGPT using natural language
- **Read** specific notes to provide context for AI work
- **Create & Append** new notes directly from ChatGPT (e.g., save Claude Code plans back to your vault)

All your files stay local. ChatGPT never sees your vault directly—only the search results and content you explicitly ask it to access.

## Who Is It For?

- **Knowledge workers** using ChatGPT + local notes
- **Developers** who want Claude/ChatGPT to work with their codebase docs
- **Researchers** managing literature, experiments, and personal findings
- **Anyone** who wants to keep their brain vault private but leverage AI assistants

## Quick Start

### 1. Install & Initialize

```bash
git clone https://github.com/stevewesthoek/brain-bridge
cd brain-bridge
pnpm install
```

### 2. Initialize and Connect Your Vault

```bash
# Initialize Brain Bridge
brainbridge init

# Connect your vault folder
brainbridge connect ~/Obsidian/MyVault

# Start all services
pnpm dev  # Agent 3052, Relay 3053, Web 3054
```

### 3. In ChatGPT

1. Create a Custom GPT with the OpenAPI schema from `docs/openapi.chatgpt.json`
2. Set Bearer token to match `BRAIN_BRIDGE_ACTION_TOKEN` from `.env`
3. Ask: "Search my brain for notes about [topic]"
4. Ask: "Read the top result and create an implementation plan"
5. ChatGPT saves the plan back to your vault

## Architecture

Brain Bridge runs three services locally:

```
┌─────────────────────────────────────────────────────────────┐
│                    ChatGPT (HTTPS)                          │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴────────────────┐
         │                                │
    ┌────▼─────────────┐     ┌──────────▼──────────┐
    │  Web App (3054)  │     │ Relay (3053)        │
    │                  │     │ [Phase 5B+]         │
    │  Next.js with    │     │                     │
    │  ChatGPT Actions │     │ WebSocket bridge    │
    └────┬─────────────┘     └──────────┬──────────┘
         │                             │
    ┌────┴─────────────────────────────▼───────┐
    │                                           │
    │   Local Agent (3052)                      │
    │   • Vault search indexing                 │
    │   • File read/write with security guards  │
    │   • Device registration with relay        │
    │                                           │
    └─────────────────┬───────────────────────  │
                      │                         │
              ┌───────▼──────────┐              │
              │ Your Vault       │              │
              │ (Local Files)    │              │
              └──────────────────┘              │
```

**Two execution modes:**

- **direct-agent (default):** Web app → Agent (3052) directly. Simplest, best for local-only setups.
- **relay-agent (Phase 5C):** Web app → Relay (3053) → Agent (3052) via WebSocket. Supports single-device deployments with optional Bearer token authentication. Designed for enterprise architectures with device coordination (multi-device support planned for Phase 5D+).

## Features

- ✅ **Full-text search** over local Markdown/TXT files
- ✅ **Secure file read** with path traversal prevention and extension filtering
- ✅ **Create & append** notes to your vault from ChatGPT
- ✅ **Audit logging** of all operations (where, what, by whom)
- ✅ **Device registration & coordination** via relay WebSocket (single device currently)
- ✅ **Bearer token authentication** for relay-agent mode (Phase 5C+)
- ✅ **Health & readiness probes** for container orchestration
- ✅ **Docker & Docker Compose** support with persistent state

## Installation & Running

### Local Development (All Services)

```bash
# Install
pnpm install

# Initialize and connect vault
brainbridge init
brainbridge connect ~/Obsidian/MyVault

# Configure environment (optional for development)
export BRAIN_BRIDGE_ACTION_TOKEN=$(openssl rand -hex 32)
export RELAY_PROXY_TOKEN=$(openssl rand -hex 32)  # Only needed if using relay-agent mode

# Run all three services
pnpm dev

# Services now running:
# • Agent: http://127.0.0.1:3052
# • Relay: http://127.0.0.1:3053
# • Web: http://127.0.0.1:3054
```

### Docker

```bash
# Build & run relay
docker compose up -d

# View logs
docker compose logs -f relay

# Verify
curl http://localhost:3053/health | jq .

# Verify readiness
curl http://localhost:3053/ready | jq .
```

See `DEPLOYMENT.md` for detailed deployment workflows.

## Configuration

### Environment Variables (Web App)

Create `apps/web/.env.local`:

```bash
# ChatGPT Actions authentication
BRAIN_BRIDGE_ACTION_TOKEN="<generate-with-openssl-rand-hex-32>"

# Execution mode: direct-agent (default) or relay-agent (Phase 5B+)
BRAIN_BRIDGE_BACKEND_MODE="direct-agent"

# Local agent endpoint (if using direct-agent)
LOCAL_AGENT_URL="http://127.0.0.1:3052"

# Relay authentication token (if using relay-agent, Phase 5C+)
RELAY_PROXY_TOKEN="<generate-with-openssl-rand-hex-32>"
```

### Environment Variables (Relay)

Create `packages/bridge/.env.relay`:

```bash
# Relay listen port
BRIDGE_PORT=3053

# Admin token for /api/admin/* endpoints
RELAY_ADMIN_TOKEN="<generate-with-openssl-rand-hex-32>"

# Web app proxy authentication token (Phase 5C+)
RELAY_PROXY_TOKEN="<generate-with-openssl-rand-hex-32>"

# Enable development tokens (defaults to true)
RELAY_ENABLE_DEFAULT_TOKENS="false"
```

## ChatGPT Custom Actions

### Setup

1. Import `docs/openapi.chatgpt.json` into ChatGPT Custom GPT schema
2. Set authentication: Bearer token = `BRAIN_BRIDGE_ACTION_TOKEN`
3. Set custom headers if needed (optional)

### Available Actions

**Read operations** (no vault modifications):
- `POST /api/actions/search` — Full-text search your vault
- `POST /api/actions/read` — Read specific file
- `POST /api/actions/search-and-read` — Search, then read top result

**Write operations** (with guards):
- `POST /api/actions/append-inbox-note` — Append to personal inbox

Example ChatGPT prompt:
```
Search my brain for notes about "Claude Code"
Read the top result
Save a summary to my personal inbox
```

## Security

Brain Bridge implements strict security guardrails:

- ✅ **Path traversal prevention** — No `..` or `/` in file paths
- ✅ **Extension filtering** — Only `.md` and `.txt` files allowed
- ✅ **No deletion or overwrite** — File modifications are append-only
- ✅ **Audit logging** — All operations logged to `~/.brainbridge/audit.log`
- ✅ **Bearer token authentication** — API key required for ChatGPT access
- ✅ **Device token validation** — Agent registration with relay requires valid token
- ✅ **Relay proxy authentication** — Phase 5C+ adds Bearer token for relay-agent mode

## Testing

```bash
# Run type checking
pnpm type-check

# Run tests
pnpm test

# Verify endpoints
curl -X POST http://localhost:3054/api/actions/search \
  -H "Authorization: Bearer $(echo $BRAIN_BRIDGE_ACTION_TOKEN)" \
  -H "Content-Type: application/json" \
  -d '{"query":"brain","limit":5}'
```

## Limitations

- **Single relay per deployment** — Horizontal scaling for multiple relays planned
- **No external secret management** — Tokens via env vars (use container secrets for prod)
- **No structured logging** — Plain text logs (JSON logging planned)
- **No log rotation** — Audit logs may grow; auto-rotation planned for 2E
- **In-memory state** — Agent state lost on relay restart; database persistence planned

## Roadmap

### Completed

- ✅ Phase 5B: Relay WebSocket bridge with device coordination (single device per relay)
- ✅ Phase 5C: Bearer token authentication for relay-agent mode
- ✅ Personal inbox notes (write to Mind vault)
- ✅ Dual-repo architecture (Brain + Mind symlink)

### Planned (Open Source)

- **Multi-vault support** — Search/append across multiple Obsidian vaults
- **Semantic search** — Embedding-based relevance (Phase 6)
- **PDF/DOCX support** — Beyond Markdown (Phase 6)
- **GitHub export** — Push notes as Gists or repo files (Phase 7)
- **Structured logging** — JSON output with log rotation (Phase 2E)
- **Horizontal scaling** — Multiple relay instances with load balancing (Phase 2E)

### Planned (Paid SaaS)

We're planning a paid SaaS tier that adds:
- **Cloud relay** — No self-hosting needed; enterprise-grade infra
- **Multi-user vaults** — Share and collaborate on team knowledge bases
- **Advanced semantics** — LLM-powered search and note suggestions
- **Compliance & audit** — HIPAA, SOC 2, enterprise audit trails
- **Team admin dashboard** — User management, usage analytics

Pricing and launch date TBD. Open source Brain Bridge will remain free and fully featured for personal use.

## Support

- **Issues & features**: [GitHub issues](https://github.com/stevewesthoek/brain-bridge/issues)
- **Discussions**: [GitHub discussions](https://github.com/stevewesthoek/brain-bridge/discussions)
- **Docs**: See `DEPLOYMENT.md` for ops guides

## License

MIT
