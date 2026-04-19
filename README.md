# Brain Bridge MVP

Connect your local brain folder (Obsidian vault) to ChatGPT. Search, read, create, and export implementation plans directly from your notes.

## Quick Start

### 1. Install the CLI

```bash
npm install -g brainbridge
# or
pnpm add -g brainbridge
```

### 2. Initialize

```bash
brainbridge init
```

### 3. Connect Your Vault

```bash
brainbridge connect ~/Obsidian/MyVault
```

### 4. Start the Local Agent

```bash
brainbridge serve
```

Your local agent is now running on `http://127.0.0.1:3052`

## Demo Flow

1. In ChatGPT, ask: "Search my brain for notes about Brain Bridge"
2. ChatGPT searches your local vault and returns relevant notes
3. Ask: "Read the most relevant note"
4. Ask: "Create a Claude Code implementation plan and save it to my brain"
5. A new Markdown file appears in your vault at `Handoffs/claude-code/`

## Features

- **Search** — Full-text search over your local Markdown files
- **Read** — Get file contents from approved paths
- **Create** — Save new Markdown notes to your vault
- **Append** — Add to existing files
- **Export** — Generate Claude Code-ready implementation briefs
- **Privacy** — All files stay local. The SaaS bridge only relays tool calls.

## Architecture

**Current Setup (Local + ChatGPT):**

```
ChatGPT Custom GPT (with Bearer token)
    ↓ (HTTPS)
Web App (Next.js on port 3054)
    ↓ (HTTP)
Local Agent (Node.js CLI on port 3052)
    ↓
Your Vault (Markdown files)

Relay Server (WebSocket, port 3053)
    ↓
Local Agent coordination & device registry
```

All files stay local. The web app and relay are optional for ChatGPT integration; the local agent works standalone.

## Commands

```bash
brainbridge init           # Initialize Brain Bridge
brainbridge connect <path> # Connect a vault folder
brainbridge index          # Rebuild search index
brainbridge serve          # Start local agent on port 3052
brainbridge status         # Show connection status
```

## File Structure

```
brainbridge/
  packages/
    shared/          # Shared types and constants
    cli/             # Local Node.js CLI/agent
  apps/
    web/             # Next.js SaaS bridge
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run CLI in dev mode
cd packages/cli
pnpm dev init

# Run web app in dev mode
cd apps/web
pnpm dev
```

## Security

- ✅ Path traversal prevention (no `..`, no `/`, no hidden files)
- ✅ Allowed extensions only (`.md`, `.txt`)
- ✅ No file deletion or overwrite
- ✅ Audit logging to `~/.brainbridge/audit.log`
- ✅ API key authentication
- ✅ Device token validation

## MVP Scope

This MVP proves the core value:

> ChatGPT can search your local brain, read relevant notes, and save Claude-ready plans back to your vault.

Future versions will add:
- Multiple vaults
- PDF/DOCX support
- Semantic search
- GitHub export
- Team accounts

## Support

For issues, feature requests, or questions, open an issue on GitHub.

## License

MIT
