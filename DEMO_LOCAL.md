# BuildFlow MVP — Local Demo Guide

This demo proves all local functionality works **without SaaS**. The CLI runs a local HTTP server you can test directly.

## Demo Objectives

- ✅ Create test vault with Markdown files
- ✅ Run CLI and connect to vault
- ✅ Index vault
- ✅ Search locally
- ✅ Read files locally
- ✅ Create new notes locally
- ✅ Export Claude Code plans locally

---

## Quick Start (5 minutes)

### Step 1: Create Test Vault

```bash
mkdir -p /tmp/buildflow-demo
```

### Step 2: Add Test Files

```bash
cat > /tmp/buildflow-demo/business.md << 'EOF'
# Business Context

BuildFlow connects local Markdown vaults to ChatGPT.

## Goals
- Search local notes from ChatGPT
- Create plans and save them back
- Keep everything local and private

## Tech Stack
- Node.js CLI for local agent
- Next.js for SaaS bridge
- WebSocket for real-time relay
- Fuse.js for search
EOF

cat > /tmp/buildflow-demo/architecture.md << 'EOF'
# Architecture

## Components

1. **Local CLI Agent** — Node.js, runs on your machine
2. **Search Engine** — Fuse.js, full-text search
3. **HTTP Server** — Fastify, port 3001
4. **File Manager** — Safe path handling, no deletions

## Security
- No path traversal (blocks `..`, `/`, hidden files)
- Read/create/append only (no delete)
- Audit logging to ~/.buildflow/audit.log

## Future
- WebSocket bridge to SaaS
- ChatGPT integration
- Multiple vaults
EOF

cat > /tmp/buildflow-demo/project-plan.md << 'EOF'
# BuildFlow MVP Plan

## Phase 1: Local Agent
- CLI commands ✅
- Vault connection ✅
- Search ✅
- File operations ✅

## Phase 2: SaaS Bridge
- WebSocket relay
- Device registration
- API authentication

## Phase 3: ChatGPT
- Custom GPT Action
- OpenAPI schema
- Conversation integration
EOF
```

### Step 3: Install and Build

```bash
cd /Users/Office/Repos/stevewesthoek/buildflow

pnpm install
pnpm build
```

### Step 4: Initialize CLI

```bash
cd packages/cli

# Option A: Run from dist (after build)
node dist/index.js init

# Option B: Run in dev mode
pnpm dev init
```

Output:
```
[BuildFlow] BuildFlow initialized.
[BuildFlow] Config directory: /Users/Office/.buildflow
```

### Step 5: Connect Vault

```bash
node dist/index.js connect /tmp/buildflow-demo
```

Output:
```
[BuildFlow] Connected to vault: /tmp/buildflow-demo
[BuildFlow] Indexed 3 files.
[BuildFlow] Next: buildflow serve
```

### Step 6: Show Status

```bash
node dist/index.js status
```

Output:
```
[BuildFlow] BuildFlow Status
[BuildFlow] ==================
[BuildFlow] Vault: /tmp/buildflow-demo
[BuildFlow] Indexed files: 3
[BuildFlow] API Base: http://localhost:3000
[BuildFlow] Device Token: Not configured
[BuildFlow] 
[BuildFlow] Next steps:
[BuildFlow] - Run: buildflow serve
```

### Step 7: Start Local Server

**Terminal 1:**
```bash
cd packages/cli
node dist/index.js serve
```

Output:
```
[BuildFlow] Starting local agent server...
[BuildFlow] Local agent running on http://127.0.0.1:3001
[BuildFlow] No device token configured. Local agent running in standalone mode.
[BuildFlow] BuildFlow agent is running!
```

**Keep this running.** The server listens on port 3001.

---

## Test Each Operation (Terminal 2)

### Test 1: Search

```bash
curl -X POST http://127.0.0.1:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "architecture", "limit": 5}'
```

Expected response:
```json
{
  "results": [
    {
      "path": "architecture.md",
      "title": "Architecture",
      "score": 0.123,
      "snippet": "# Architecture\n\n## Components\n\n1. **Local CLI Agent** ...",
      "modifiedAt": "2026-04-16T..."
    }
  ]
}
```

### Test 2: Search with Multiple Results

```bash
curl -X POST http://127.0.0.1:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "local", "limit": 10}'
```

Should return multiple files mentioning "local".

### Test 3: Read File

```bash
curl -X POST http://127.0.0.1:3001/api/read \
  -H "Content-Type: application/json" \
  -d '{"path": "business.md"}'
```

Expected response:
```json
{
  "path": "business.md",
  "content": "# Business Context\n\nBuildFlow connects..."
}
```

### Test 4: Create Note

```bash
curl -X POST http://127.0.0.1:3001/api/create \
  -H "Content-Type: application/json" \
  -d '{
    "path": "BuildFlow/Inbox/test-note.md",
    "content": "# Test Note\n\nThis was created via API."
  }'
```

Expected response:
```json
{
  "path": "BuildFlow/Inbox/test-note.md",
  "created": true
}
```

Verify file was created:
```bash
cat /tmp/buildflow-demo/BuildFlow/Inbox/test-note.md
```

Should show frontmatter + content:
```
---
created: 2026-04-16T10:00:00.000Z
source: buildflow
type: plan
---

# Test Note

This was created via API.
```

### Test 5: Append to Note

```bash
curl -X POST http://127.0.0.1:3001/api/append \
  -H "Content-Type: application/json" \
  -d '{
    "path": "BuildFlow/Inbox/test-note.md",
    "content": "\n\n## Update\n\nAppended content at $(date)."
  }'
```

Expected response:
```json
{
  "path": "BuildFlow/Inbox/test-note.md",
  "appended": true
}
```

Verify:
```bash
cat /tmp/buildflow-demo/BuildFlow/Inbox/test-note.md
```

### Test 6: Export Claude Plan

```bash
curl -X POST http://127.0.0.1:3001/api/export-plan \
  -H "Content-Type: application/json" \
  -d '{
    "title": "BuildFlow MVP Implementation",
    "summary": "Build a local vault connector for ChatGPT",
    "projectGoal": "Connect Obsidian to ChatGPT for context-aware ideation",
    "techStack": "Node.js CLI, Next.js SaaS, Fuse.js search",
    "implementationPlan": "Phase 1: Local agent. Phase 2: SaaS bridge. Phase 3: ChatGPT.",
    "tasks": [
      "CLI commands",
      "Vault indexing",
      "Local search",
      "File operations",
      "SaaS relay",
      "ChatGPT integration"
    ],
    "acceptanceCriteria": [
      "CLI runs and connects to vault",
      "Search returns relevant results",
      "Files can be created and read",
      "Claude Code plan exports successfully"
    ]
  }'
```

Expected response:
```json
{
  "path": "Handoffs/claude-code/2026-04-16-buildflow-mvp-implementation.md",
  "created": true
}
```

Verify:
```bash
cat /tmp/buildflow-demo/Handoffs/claude-code/2026-04-16-buildflow-mvp-implementation.md
```

Should contain full Claude Code implementation brief.

### Test 7: List Folder

```bash
curl -X GET "http://127.0.0.1:3001/api/list?path=BuildFlow"
```

Expected response:
```json
{
  "items": [
    {
      "path": "BuildFlow/Inbox",
      "type": "folder"
    },
    {
      "path": "BuildFlow/Inbox/test-note.md",
      "type": "file"
    }
  ]
}
```

---

## Verify Audit Log

All operations are logged to `~/.buildflow/audit.log`:

```bash
cat ~/.buildflow/audit.log
```

Should show entries like:
```json
{"timestamp":"2026-04-16T10:00:00.000Z","tool":"search","status":"success"}
{"timestamp":"2026-04-16T10:00:01.000Z","tool":"read_file","path":"business.md","status":"success"}
{"timestamp":"2026-04-16T10:00:02.000Z","tool":"create_file","path":"BuildFlow/Inbox/test-note.md","status":"success"}
```

---

## Check Index File

The local search index is cached at `~/.buildflow/index.json`:

```bash
cat ~/.buildflow/index.json | jq '.[] | {path, title}' | head -20
```

Shows indexed documents with title extraction.

---

## Full Automation Script

Save as `demo.sh`:

```bash
#!/bin/bash

set -e

echo "=== BuildFlow MVP Local Demo ==="
echo ""

# Create test vault
echo "1. Creating test vault..."
mkdir -p /tmp/buildflow-demo

cat > /tmp/buildflow-demo/business.md << 'EOF'
# Business Context

BuildFlow connects local Markdown vaults to ChatGPT.

## Goals
- Search local notes from ChatGPT
- Create plans and save them back
- Keep everything local and private
EOF

cat > /tmp/buildflow-demo/architecture.md << 'EOF'
# Architecture

## Components

1. **Local CLI Agent** — Node.js, runs on your machine
2. **Search Engine** — Fuse.js, full-text search
3. **HTTP Server** — Fastify, port 3001
EOF

# Install and build
echo "2. Installing dependencies..."
cd /Users/Office/Repos/stevewesthoek/buildflow
pnpm install > /dev/null 2>&1

echo "3. Building packages..."
pnpm build > /dev/null 2>&1

# Initialize
echo "4. Initializing CLI..."
cd packages/cli
node dist/index.js init > /dev/null 2>&1

echo "5. Connecting to vault..."
node dist/index.js connect /tmp/buildflow-demo > /dev/null 2>&1

echo "6. Showing status..."
node dist/index.js status

echo ""
echo "=== To Test Locally ==="
echo ""
echo "Terminal 1 (start server):"
echo "  cd $(pwd)"
echo "  node dist/index.js serve"
echo ""
echo "Terminal 2 (test endpoints):"
echo "  curl -X POST http://127.0.0.1:3001/api/search \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"query\": \"architecture\", \"limit\": 5}'"
echo ""
echo "See DEMO_LOCAL.md for all test commands."
```

Run it:
```bash
chmod +x demo.sh
./demo.sh
```

---

## Clean Up

```bash
# Remove test vault
rm -rf /tmp/buildflow-demo

# Remove config
rm -rf ~/.buildflow

# Or re-run demo fresh
rm -rf ~/.buildflow && rm -rf /tmp/buildflow-demo && ./demo.sh
```

---

## Success Criteria

All of these should work without errors:

- ✅ `buildflow init` — Config created
- ✅ `buildflow connect` — Vault connected and indexed
- ✅ `buildflow status` — Shows status
- ✅ `buildflow serve` — HTTP server starts
- ✅ Search endpoint returns results
- ✅ Read endpoint returns file content
- ✅ Create endpoint creates new file
- ✅ Append endpoint adds to file
- ✅ Export endpoint creates Claude Code plan
- ✅ Audit log records all operations
- ✅ Index file exists with all documents

---

## Notes

- **Local only:** No SaaS bridge needed for this demo
- **Standalone HTTP:** All endpoints on `http://127.0.0.1:3001`
- **Real files:** Vault is actual Markdown files on disk
- **No delete:** Operations are create/read/append only
- **Audit trail:** Every operation logged to `~/.buildflow/audit.log`
- **Next:** Connect this to ChatGPT via separate bridge server (Phase 2)

---

## Troubleshooting

**Port 3001 in use?**
```bash
lsof -i :3001
# Kill with: kill -9 <PID>
```

**Vault not found?**
```bash
# Check path
ls -la /tmp/buildflow-demo
# Reconnect
buildflow connect /tmp/buildflow-demo
```

**Search returns no results?**
```bash
# Rebuild index
buildflow index
```

**Permission denied on file creation?**
```bash
# Check vault permissions
chmod 755 /tmp/buildflow-demo
# Try creating in Inbox folder
mkdir -p /tmp/buildflow-demo/BuildFlow/Inbox
```

---

**Status: ✅ READY FOR LOCAL DEMO**

No SaaS required. All functionality works locally.
