# Phase 3.7: Append Inbox Note – Personal Note Creation for ChatGPT

## Overview

Added the smallest safe write capability to BuildFlow: `POST /api/actions/append-inbox-note`.

Allows ChatGPT Custom GPT to create new markdown notes in the personal Mind vault (via symlink) inbox folder only. No arbitrary paths, no edit/delete/overwrite, bearer token authenticated.

## Implementation

### Files Changed

1. **apps/web/src/app/api/actions/append-inbox-note/route.ts** (new)
   - Route handler for ChatGPT action
   - Bearer token auth via `checkActionAuth()`
   - Accepts title + content only (no path parameter)
   - Generates safe filename: `{timestamp}-{slugified-title}.md`
   - Forwards to local agent at `{LOCAL_AGENT_URL}/api/create`
   - Returns `{ path, status: 'created' }`

2. **apps/web/src/app/api/openapi/route.ts** (updated)
   - Added `/api/actions/append-inbox-note` endpoint with:
     - `operationId: appendInboxNote`
     - Full OpenAPI 3.1.0 schema
     - Security: bearerAuth
     - Request: title (string), content (string)
     - Response: path (string), status (string)

3. **docs/openapi.chatgpt.json** (updated)
   - Added `/api/actions/append-inbox-note` for ChatGPT import
   - Static spec remains OpenAPI 3.1.0, ChatGPT-compatible
   - `components.schemas` is an object (valid)
   - All operations have `operationId`
   - `bearerAuth` configured and in use

## Safety Constraints

- **Path safety**: No path parameter accepted. Filename is auto-generated from title only.
- **Target folder locked**: Always writes to `mind/01-inbox/` via symlink (fixed in code). Never writes to brain root or old paths.
- **Dual-repo access**: BuildFlow reads from brain repo root; writes personal notes to mind repo (symlinked at repo root as `mind/`).
- **No overwrites**: Timestamp prefix + slug prevents collisions even with identical titles.
- **Read-only contract preserved**: Existing search/read/search-and-read actions unchanged.
- **Auth required**: Bearer token checked via `checkActionAuth()` (same as other actions).

## Testing

### Prerequisites
```bash
# Ensure stack running
pnpm dev

# Load token (already set from Phase 3.6)
export BUILDFLOW_ACTION_TOKEN="your-token"
```

### Local endpoint (port 3054)
```bash
# Test 1: Unauthenticated request (should fail 401)
curl -i -X POST http://127.0.0.1:3054/api/actions/append-inbox-note \
  -H 'Content-Type: application/json' \
  -d '{"title":"Test write without token","content":"Should fail"}'

# Test 2: Authenticated request (should create note)
curl -s -X POST http://127.0.0.1:3054/api/actions/append-inbox-note \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BUILDFLOW_ACTION_TOKEN" \
  -d '{"title":"BuildFlow write test","content":"This is a test note created by the Custom GPT action."}' | jq .

# Test 3: Second note with same title (should not overwrite, timestamp prevents collision)
curl -s -X POST http://127.0.0.1:3054/api/actions/append-inbox-note \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BUILDFLOW_ACTION_TOKEN" \
  -d '{"title":"BuildFlow write test","content":"Different content."}' | jq .
```

### Public endpoint (Cloudflare tunnel)
```bash
# Test 4: Public endpoint (requires Cloudflare tunnel running)
curl -s -X POST https://buildflow.prochat.tools/api/actions/append-inbox-note \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $BUILDFLOW_ACTION_TOKEN" \
  -d '{"title":"BuildFlow public write test","content":"This is a public endpoint write test."}' | jq .
```

### Verification in vault
- Check `mind/01-inbox/` folder for created files (via symlink in brain repo root)
- Verify filenames are `{timestamp}-{slug}.md` format
- Verify content matches what was sent
- Verify no files were overwritten

### ChatGPT import
1. Copy `docs/openapi.chatgpt.json` to ChatGPT Custom GPT "Actions" schema
2. Verify no import errors
3. Verify `append-inbox-note` appears in action list
4. Test via ChatGPT UI with bearer token

## Type Checking & Build

```bash
pnpm type-check    # Should pass
pnpm build          # Should pass
```

## Endpoint Signature

**POST** `/api/actions/append-inbox-note`

**Headers:**
```
Authorization: Bearer {BUILDFLOW_ACTION_TOKEN}
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Short title for the note",
  "content": "Markdown content here"
}
```

**Response (200):**
```json
{
  "path": "mind/01-inbox/1713268800000-short-title-for-the-note.md",
  "status": "created"
}
```

**Response (401):**
```json
{
  "error": "Unauthorized"
}
```

## Design Decisions

1. **Timestamp + slug, not UUID**: Human-readable filenames, sortable chronologically, easier to debug.
2. **Title slugification**: Removes special chars, converts to kebab-case, safe for filesystem.
3. **Fixed mind/01-inbox folder via symlink**: No path parameter = no path traversal possible. Writes to symlinked mind repo inbox only.
4. **Dual-repo architecture**: BuildFlow bridges two repos (brain as machine knowledge base, mind as personal Obsidian vault via symlink). Personal notes always go to mind.
5. **Bearer token auth**: Consistent with existing actions; token stored securely in ~/.config/buildflow/.env.
6. **Forward to local agent**: Reuses existing vault I/O infrastructure, no direct filesystem access.

## Backward Compatibility

- Zero breaking changes.
- Existing read/search endpoints unchanged.
- OpenAPI schema remains 3.1.0.
- Auth method unchanged (bearer token).

## Next Steps

Phase 3.7 is production-ready once testing passes. Merge to main. Can be deployed to Cloudflare tunnel immediately.

No further write capabilities should be added without explicit scope expansion.
