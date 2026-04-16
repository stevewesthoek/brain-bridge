#!/bin/bash
set -e

echo "=== Phase 3.4 Verification Script ==="
echo ""

# Check if all servers are running
echo "1. Checking server status..."
BRIDGE_PID=$(ps aux | grep "bridge.*server.js" | grep -v grep | awk '{print $2}' || echo "")
AGENT_PID=$(ps aux | grep "packages/cli.*serve" | grep -v grep | awk '{print $2}' || echo "")
WEB_PID=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}' || echo "")

if [ -z "$BRIDGE_PID" ]; then
  echo "  ❌ Bridge not running (should be on port 3053)"
else
  echo "  ✓ Bridge running (PID $BRIDGE_PID)"
fi

if [ -z "$AGENT_PID" ]; then
  echo "  ❌ Agent not running (should be on port 3052)"
else
  echo "  ✓ Agent running (PID $AGENT_PID)"
fi

if [ -z "$WEB_PID" ]; then
  echo "  ❌ Web app not running (should be on port 3000)"
else
  echo "  ✓ Web app running (PID $WEB_PID)"
fi

echo ""
echo "2. Testing local endpoints..."

# Test OpenAPI
OPENAPI_TEST=$(curl -s http://127.0.0.1:3000/api/openapi | jq '.info.title' 2>/dev/null || echo "ERROR")
if [ "$OPENAPI_TEST" != "\"Brain Bridge API\"" ]; then
  echo "  ❌ OpenAPI endpoint failed"
else
  echo "  ✓ OpenAPI endpoint works"
fi

# Test search
SEARCH_TEST=$(curl -s -X POST http://127.0.0.1:3000/api/actions/search \
  -H 'Content-Type: application/json' \
  -d '{"query":"brain","limit":1}' | jq '.results | length' 2>/dev/null || echo "0")
if [ "$SEARCH_TEST" -lt 1 ]; then
  echo "  ❌ Search endpoint failed (no results)"
else
  echo "  ✓ Search endpoint works ($SEARCH_TEST result(s))"
fi

echo ""
echo "3. Checking tunnel..."

TUNNEL_PID=$(ps aux | grep "cloudflared tunnel --url" | grep -v grep | awk '{print $2}' || echo "")
if [ -z "$TUNNEL_PID" ]; then
  echo "  ❌ Tunnel not running"
  echo "  Start with: cloudflared tunnel --url http://localhost:3000"
else
  echo "  ✓ Tunnel running (PID $TUNNEL_PID)"
  echo "  Check /tmp/tunnel.log for URL if in background"
fi

echo ""
echo "4. OpenAPI spec location:"
echo "  Static: docs/openapi.chatgpt.json"
echo "  Live: http://127.0.0.1:3000/api/openapi"
echo ""
echo "5. To prepare for ChatGPT import:"
echo "  1. Get tunnel URL: grep trycloudflare /tmp/tunnel.log"
echo "  2. Run: jq '.servers[0].url = \"https://YOUR-TUNNEL.trycloudflare.com\"' docs/openapi.chatgpt.json > /tmp/brainbridge-openapi-chatgpt.json"
echo "  3. Go to https://chatgpt.com → My GPTs → Create a GPT → Actions → Create new action"
echo "  4. Paste contents of /tmp/brainbridge-openapi-chatgpt.json into Schema field"
echo "  5. Click Save and test with provided prompts"
echo ""
echo "=== Setup Complete ==="
