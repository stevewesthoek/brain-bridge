# BuildFlow & ProBot Dashboard Integration

**Cross-Repo Integration Guide**

This document explains how the BuildFlow service orchestrator integrates with the ProBot dashboard in the brain repo.

## Overview

The ProBot dashboard (running on http://localhost:7070 in the brain repo) provides a LocalApps card for BuildFlow with Start, Stop, and Restart buttons. These buttons invoke the BuildFlow orchestrator script.

## Architecture

```
┌──────────────────────────────────────────────┐
│  ProBot Dashboard (brain repo, port 7070)    │
│                                              │
│  LocalApps Tab → BuildFlow Card              │
│    ├─ Start Button                           │
│    ├─ Stop Button                            │
│    └─ Restart Button                         │
└────────────┬─────────────────────────────────┘
             │ Invokes
             ▼
┌──────────────────────────────────────────────┐
│  buildflow-orchestrator.sh (buildflow repo)  │
│                                              │
│  Command: start | stop | restart | status   │
│                                              │
│  Features:                                   │
│  - Fact-checking (lsof/ps/curl)             │
│  - Atomic operations (all-or-nothing)       │
│  - Graceful shutdown (SIGTERM→SIGKILL)      │
│  - Health endpoint verification             │
│  - Comprehensive error reporting            │
└────────────┬─────────────────────────────────┘
             │ Manages
             ▼
┌──────────────────────────────────────────────┐
│  BuildFlow Services                          │
│                                              │
│  1. Agent (port 3052)   - Local CLI server   │
│  2. Relay (port 3053)   - Docker bridge     │
│  3. Web   (port 3054)   - Next.js dashboard  │
└──────────────────────────────────────────────┘
```

## Configuration

The integration is configured in the brain repo at:

```
operations/infrastructure/local-apps.json
```

**Key fields:**

```json
{
  "name": "BuildFlow",
  "repoPath": "/Users/Office/Repos/stevewesthoek/buildflow",
  "port": 3054,
  "url": "http://localhost:3054",
  "check": "http://localhost:3054/api/unified-health",
  "start": "bash ~/Repos/stevewesthoek/buildflow/buildflow-orchestrator.sh start",
  "stop": "bash ~/Repos/stevewesthoek/buildflow/buildflow-orchestrator.sh stop",
  "restart": "bash ~/Repos/stevewesthoek/buildflow/buildflow-orchestrator.sh restart"
}
```

## Health Verification

ProBot uses the unified health endpoint to check if all services are running:

```
GET http://localhost:3054/api/unified-health
```

**Response (all healthy):**
```json
{
  "status": "ok",
  "allHealthy": true,
  "healthyCount": 3,
  "total": 3,
  "services": {
    "agent": { "url": "http://127.0.0.1:3052/health", "healthy": true },
    "relay": { "url": "http://127.0.0.1:3053/health", "healthy": true },
    "web": { "url": "http://localhost:3054/api/openapi", "healthy": true }
  }
}
```

**Response (any unhealthy):**
```json
{
  "status": "unhealthy",
  "allHealthy": false,
  "healthyCount": 2,
  "total": 3,
  "services": {
    "agent": { "url": "http://127.0.0.1:3052/health", "healthy": false },
    "relay": { "url": "http://127.0.0.1:3053/health", "healthy": true },
    "web": { "url": "http://localhost:3054/api/openapi", "healthy": true }
  }
}
```

HTTP status: `200` if all healthy, `503` if any unhealthy.

## User Workflow

### Starting Services via ProBot Dashboard

1. Open ProBot at http://localhost:7070
2. Navigate to the "LocalApps" tab
3. Find the "BuildFlow" card
4. Click "Start" button
5. ProBot shows "STARTING..." status
6. Orchestrator fact-checks all services
7. ProBot shows "RUNNING (healthy)" when all services respond

### Stopping Services via ProBot Dashboard

1. In the "BuildFlow" card
2. Click "Stop" button
3. ProBot shows "STOPPING..." status
4. Orchestrator gracefully shuts down services
5. ProBot shows "STOPPED" when all services are down

### Restarting Services via ProBot Dashboard

1. In the "BuildFlow" card
2. Click "Restart" button
3. ProBot runs the full restart sequence:
   - Stops all services gracefully
   - Waits 2 seconds
   - Cleans stale artifacts (rm -rf apps/web/.next)
   - Rebuilds packages (pnpm -r build)
   - Starts all services with health verification
4. ProBot shows result: "RUNNING (healthy)" or error details

## Fact-Checking Model

When ProBot invokes the orchestrator, the full fact-checking chain is:

```
User clicks button
  ↓
ProBot spawns orchestrator
  ↓
Orchestrator checks port availability (lsof -ti :PORT)
  ↓
Orchestrator starts each service
  ↓
Orchestrator waits for ports active (max 30s)
  ↓
Orchestrator polls health endpoints (up to 10 retries)
  ↓
Orchestrator verifies state (ps -p PID)
  ↓
Orchestrator reports success/failure
  ↓
ProBot displays result in dashboard
```

## Troubleshooting

### ProBot shows "Start initiated" but services don't start

1. Check OrbStack status: `orbctl status`
2. Verify relay environment: `ls ~/.config/buildflow/.env.relay`
3. Run orchestrator manually: `./buildflow-orchestrator.sh start`
4. Check logs: `tail -50 .buildflow/events.log`

### ProBot shows "UNHEALTHY" after start

1. Check unified health: `curl http://localhost:3054/api/unified-health | jq .`
2. Check individual services:
   - Agent: `curl http://localhost:3052/health`
   - Relay: `curl http://localhost:3053/health`
   - Web: `curl http://localhost:3054/api/openapi`
3. Check service logs:
   - `tail -50 .buildflow/agent.log`
   - `tail -50 .buildflow/web.log`
   - `tail -50 .buildflow/relay.log`

### ProBot can't reach orchestrator script

Verify the path in local-apps.json matches your installation:

```bash
ls -la ~/Repos/stevewesthoek/buildflow/buildflow-orchestrator.sh
bash ~/Repos/stevewesthoek/buildflow/buildflow-orchestrator.sh status
```

## Production Guarantees

The orchestrator provides production-grade guarantees:

- ✅ **Fact-checked**: Every state transition verified with lsof/ps/curl
- ✅ **Atomic**: All-or-nothing operations, no partial states
- ✅ **Graceful**: SIGTERM before SIGKILL, proper shutdown sequence
- ✅ **Audited**: Full event log in `.buildflow/events.log`
- ✅ **Reliable**: 10-retry health checks, configurable timeouts
- ✅ **OrbStack-only**: No Docker Desktop assumptions

## Related Documentation

- `buildflow-orchestrator.sh` - Canonical orchestrator script
- `ORCHESTRATOR_GUIDE.md` - Complete orchestrator documentation
- `brain/operations/infrastructure/local-apps.json` - ProBot registry
- `brain/operations/infrastructure/local-apps.md` - ProBot configuration guide

## Last Updated

2026-04-26
