# BuildFlow Service Orchestrator Guide

## Overview

The `buildflow-orchestrator.sh` script replaces the fragile `restart-all.sh`, `stop-all.sh`, and `start-all.sh` scripts with a production-grade service management system that ensures reliability, fact-checking, and atomic operations.

## Requirements

- **OrbStack** (not Docker Desktop) — start with `orbctl start`
- All three services must be managed as a cohesive unit (no partial states)
- Health endpoints must be responsive before services are considered "ready"

## Quick Start

```bash
# Check status (with fact-checking)
./buildflow-orchestrator.sh status

# Start all services with health verification
./buildflow-orchestrator.sh start

# Stop all services gracefully
./buildflow-orchestrator.sh stop

# Full restart with clean rebuild
./buildflow-orchestrator.sh restart
```

## Architecture

### Services Managed

| Service | Port | Type | Path | Health Endpoint |
|---------|------|------|------|-----------------|
| **Agent** | 3052 | tsx | packages/cli | http://localhost:3052/health |
| **Web** | 3054 | next | apps/web | http://localhost:3054/api/openapi |
| **Relay** | 3053 | docker | docker-compose.yml | http://localhost:3053/health |

### State Management

- **State file**: `.buildflow/services.state.json` — persistent service state
- **Events log**: `.buildflow/events.log` — timestamped audit trail
- **Service logs**: `.buildflow/{agent,web,relay}.log` — per-service startup logs

## Command Reference

### `./buildflow-orchestrator.sh status`

**What it does:**
- Queries actual port usage with `lsof` (fact-check: port in use?)
- Verifies processes are alive with `ps` (fact-check: process alive?)
- Calls health endpoints (fact-check: responding?)

**Output:**
```
SERVICE STATUS:
===============
● agent (port 3052, PID 9100) - RUNNING (healthy)
● web (port 3054, PID 9429) - RUNNING (healthy)
● relay (port 3053, PID 82684) - RUNNING (healthy)
```

### `./buildflow-orchestrator.sh start`

**Sequence:**
1. Verify Docker is running (`docker ps > /dev/null`)
2. For each service (agent → relay → web):
   - Verify port is free (fact-check)
   - Launch service via pnpm/docker
   - Wait for port to become in use (0-30s based on service)
   - Poll health endpoint up to 10 times
   - Proceed to next service or fail with logs
3. Verify all services are running and healthy
4. Report success or detailed failure with logs

**Timeouts:**
- Agent: 10 seconds for port to be in use
- Web/Relay: 30 seconds for port to be in use
- Health check: 5 seconds per curl, up to 10 retries

### `./buildflow-orchestrator.sh stop`

**Sequence:**
1. For each service (web → relay → agent):
   - Send SIGTERM to process
   - Wait 10 seconds for graceful shutdown
   - If not stopped, send SIGKILL
   - Wait 1 second
   - Verify port is now free
2. Verify all services are stopped
3. Report success or detailed failure

### `./buildflow-orchestrator.sh restart`

**Sequence:**
1. Run `./buildflow-orchestrator.sh stop` (verify all stopped)
2. Wait 2 seconds
3. Delete stale artifacts: `rm -rf apps/web/.next`
4. Rebuild: `pnpm -r build` (with log capture)
5. Run `./buildflow-orchestrator.sh start` (verify all healthy)
6. Report success or detailed failure

## Fact-Checking Model

The orchestrator **never assumes**. It verifies facts through multiple channels:

```
State Check             →  Real State
Is port in use?        →  lsof -ti :PORT
Is process alive?      →  ps -p PID
Is service responding? →  curl -s HEALTH_URL
```

If any check fails, the orchestrator provides:
- **Port**: The port number
- **PID**: The process ID (if running)
- **Last 20 lines of service log** (if startup failed)
- **Detailed error message** with context

## Log Files

### Events Log (`.buildflow/events.log`)

Timestamped audit trail of all operations:

```
[2026-04-26 21:44:24] INFO: === STOPPING ALL SERVICES ===
[2026-04-26 21:44:24] INFO: Stopping web (port 3054, PID 96188)...
[2026-04-26 21:44:24] INFO: ✓ web stopped gracefully
[2026-04-26 21:44:34] INFO: ✓ relay stopped gracefully
[2026-04-26 21:44:34] INFO: Stopping agent (port 3052, PID 94480)...
```

### Service Logs (`.buildflow/{agent,web,relay}.log`)

Service startup output, useful for debugging:

```
[2026-04-26 21:44:38] Starting agent with pnpm exec tsx src/index.ts serve
[BuildFlow] Starting local agent server...
[BuildFlow] BuildFlow agent is running!
[BuildFlow] Local server: http://127.0.0.1:3052
```

## Error Scenarios & Recovery

### Scenario: Port Still in Use After Stop

**What happens:**
```
✗ web failed to stop even after SIGKILL!
Service log:
  [error output from previous attempt]
```

**Recovery:**
```bash
# Manually verify what's using the port
lsof -i :3054

# If it's a stale process
kill -9 <PID>

# Then try again
./buildflow-orchestrator.sh start
```

### Scenario: Health Check Timeout

**What happens:**
```
relay failed to become healthy after 10s
Service log:
  Network buildflow_default Creating
  Container buildflow-relay Created
  Container buildflow-relay Starting
```

**Recovery:**
```bash
# Wait for docker to fully initialize
sleep 5

# Try again
./buildflow-orchestrator.sh start
```

### Scenario: Service Startup Fails

**What happens:**
```
agent failed to start (port never became in use after 10s)
Service log:
  nohup: command not found
  [error details]
```

**Recovery:**
```bash
# Verify pnpm is available
pnpm --version

# Check if dependencies are installed
pnpm install

# Try again
./buildflow-orchestrator.sh restart
```

## Configuration

Timeout values are configured at the top of `buildflow-orchestrator.sh`:

```bash
GRACEFUL_STOP_TIMEOUT=10        # Time to wait for graceful SIGTERM shutdown
HARD_KILL_TIMEOUT=3             # Time between SIGKILL and verification
START_WAIT_TIMEOUT=30           # Max time waiting for port to be in use
HEALTH_CHECK_TIMEOUT=5          # Curl timeout per health check
HEALTH_CHECK_RETRIES=10         # Number of health check attempts
```

To adjust: edit these variables before running the orchestrator.

## OrbStack-Specific Notes

**This orchestrator uses OrbStack ONLY, not Docker Desktop.**

- **Start OrbStack**: `orbctl start`
- **Stop OrbStack**: `orbctl stop`
- **Status**: `orbctl status`

The relay service runs in Docker via docker-compose, which requires OrbStack to be running. If you get:

```
Docker daemon not responding. Start OrbStack: orbctl start
```

Run:
```bash
orbctl start
sleep 5
./buildflow-orchestrator.sh start
```

## Troubleshooting

### View full event log

```bash
cat .buildflow/events.log
```

### Enable debug output

```bash
DEBUG=1 ./buildflow-orchestrator.sh status
```

### Check service-specific logs

```bash
tail -f .buildflow/agent.log
tail -f .buildflow/web.log
tail -f .buildflow/relay.log
```

### Manual port check

```bash
lsof -i :3052 :3053 :3054
```

### Manual health check

```bash
curl -v http://localhost:3052/health
curl -v http://localhost:3054/api/openapi
curl -v http://localhost:3053/health
```

## Comparison: Old vs New

| Aspect | Old Scripts | New Orchestrator |
|--------|------------|------------------|
| State verification | ❌ Assumed | ✅ Fact-checked (lsof, ps, curl) |
| Partial states | ❌ Possible | ✅ Atomic: all or nothing |
| Graceful shutdown | ❌ pkill only | ✅ SIGTERM→SIGKILL escalation |
| Health verification | ❌ None | ✅ Health endpoints checked |
| Port conflicts | ❌ Common | ✅ Detected and resolved |
| Error reporting | ❌ Generic | ✅ Context + logs |
| Logging | ❌ None | ✅ Structured audit trail |
| Timeouts | ❌ Hardcoded | ✅ Configurable |

## Implementation Details

### Port Detection

```bash
local actual_pid=$(lsof -ti :$port 2>/dev/null || echo "")
```

Uses `lsof` to find the exact PID using each port.

### Process Verification

```bash
if ps -p "$actual_pid" > /dev/null 2>&1; then
  # Process is alive
fi
```

Verifies the PID is actually alive before declaring it running.

### Health Checking

```bash
local response=$(curl -s -m "$HEALTH_CHECK_TIMEOUT" "$health_url" 2>/dev/null || echo "")
if [[ -n "$response" ]]; then
  echo "healthy"
fi
```

Waits up to 5 seconds for health endpoint to respond with data (any data = healthy).

### Graceful Shutdown

```bash
pkill -TERM -P "$pid" 2>/dev/null || true  # Kill children
kill -TERM "$pid" 2>/dev/null || true      # Kill parent
# Wait 10 seconds
# If still running, SIGKILL
```

Sends SIGTERM to parent and children, waits gracefully, then force-kills if needed.

## Future Enhancements

Potential improvements (not yet implemented):

- Dashboard API endpoint for real-time status
- Metrics collection (uptime, restart count)
- Alerts on health check failures
- Automatic restart on crash
- Service dependency management
- Load balancing across multiple instances
- Configuration file support
- Service enablement/disablement

---

**Last Updated:** 2026-04-26  
**Status:** Production Ready  
**Platform:** OrbStack (macOS)
