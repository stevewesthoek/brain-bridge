#!/bin/bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
AGENT_PORT="${AGENT_PORT:-3052}"
RELAY_PORT="${RELAY_PORT:-3053}"
WEB_PORT="${WEB_PORT:-3054}"
AGENT_HEALTH_URL="http://127.0.0.1:${AGENT_PORT}/health"
RELAY_HEALTH_URL="http://127.0.0.1:${RELAY_PORT}/health"
WEB_HEALTH_URL="http://127.0.0.1:${WEB_PORT}/api/openapi"
WEB_ACTION_STATUS_URL="http://127.0.0.1:${WEB_PORT}/api/actions/status"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-${LOCAL_DASHBOARD_BASE_URL:-http://127.0.0.1:${WEB_PORT}}}"
PUBLIC_OPENAPI_URL="${PUBLIC_BASE_URL}/api/openapi"
PUBLIC_STATUS_URL="${PUBLIC_BASE_URL}/api/actions/status"

AGENT_LOG="/tmp/buildflow-agent.log"
AGENT_ERR_LOG="/tmp/buildflow-agent.err.log"
RELAY_LOG="/tmp/buildflow-relay.log"
RELAY_ERR_LOG="/tmp/buildflow-relay.err.log"
WEB_LOG="/tmp/buildflow-web.log"
WEB_ERR_LOG="/tmp/buildflow-web.err.log"

die() {
  echo "buildflow-local-stack: $*" >&2
  exit 1
}

log() {
  echo "buildflow-local-stack: $*"
}

kill_port() {
  local port="$1"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN || true)"
  if [ -n "$pids" ]; then
    log "Stopping listeners on port $port: $pids"
    kill $pids || true
  fi
}

wait_for_docker() {
  if docker info >/dev/null 2>&1; then
    return 0
  fi
  if command -v orbctl >/dev/null 2>&1; then
    log "Docker is not ready. Starting OrbStack."
    orbctl start || true
  fi
  for _ in $(seq 1 12); do
    if docker info >/dev/null 2>&1; then
      log "Docker is ready."
      return 0
    fi
    sleep 5
  done
  die "Docker/OrbStack did not become ready"
}

agent_healthy() {
  curl -sf "$AGENT_HEALTH_URL" >/dev/null 2>&1
}

relay_healthy() {
  curl -sf "$RELAY_HEALTH_URL" >/dev/null 2>&1
}

web_healthy() {
  local openapi_body status_body
  openapi_body="$(curl -sS "$WEB_HEALTH_URL" 2>/dev/null || true)"
  status_body="$(curl -sS "$WEB_ACTION_STATUS_URL" 2>/dev/null || true)"
  [[ "$openapi_body" == *'"openapi":"3.1.0"'* ]] || return 1
  [[ "$openapi_body" != *'Cannot find module'* && "$openapi_body" != *'MODULE_NOT_FOUND'* && "$openapi_body" != *'webpack-runtime'* ]] || return 1
  [[ "$status_body" == *'"error":"Unauthorized"'* || "$status_body" == *'"error": "Unauthorized"'* || "$status_body" == *'"connected"'* || "$status_body" == *'"status":"ok"'* ]] || return 1
  [[ "$status_body" != *'Cannot find module'* && "$status_body" != *'MODULE_NOT_FOUND'* && "$status_body" != *'webpack-runtime'* ]] || return 1
  return 0
}

web_status_healthy() {
  local body
  body="$(curl -sS "$WEB_ACTION_STATUS_URL" 2>/dev/null || true)"
  [[ "$body" == *'"error":"Unauthorized"'* || "$body" == *'"error": "Unauthorized"'* ]]
}

public_openapi_healthy() {
  local body
  body="$(curl -sS "$PUBLIC_OPENAPI_URL" 2>/dev/null || true)"
  [[ "$body" == *'"openapi":"3.1.0"'* ]] || return 1
  [[ "$body" != *'Cannot find module'* && "$body" != *'MODULE_NOT_FOUND'* && "$body" != *'webpack-runtime'* && "$body" != *'502 Bad Gateway'* ]] || return 1
  return 0
}

public_status_healthy() {
  local body
  body="$(curl -sS "$PUBLIC_STATUS_URL" 2>/dev/null || true)"
  [[ "$body" == *'"error":"Unauthorized"'* || "$body" == *'"error": "Unauthorized"'* || "$body" == *'"status":"ok"'* || "$body" == *'"connected"'* ]] || return 1
  [[ "$body" != *'Cannot find module'* && "$body" != *'MODULE_NOT_FOUND'* && "$body" != *'webpack-runtime'* && "$body" != *'502 Bad Gateway'* ]] || return 1
  return 0
}

assert_no_stale_next_errors() {
  local openapi_body status_body
  openapi_body="$(curl -sS "$WEB_HEALTH_URL" 2>/dev/null || true)"
  status_body="$(curl -sS "$WEB_ACTION_STATUS_URL" 2>/dev/null || true)"
  if [[ "$openapi_body" == *'Cannot find module'* || "$openapi_body" == *'MODULE_NOT_FOUND'* || "$openapi_body" == *'webpack-runtime'* || "$openapi_body" == *'8352.js'* ]]; then
    die "Stale Next.js chunk/runtime errors detected in /api/openapi"
  fi
  if [[ "$status_body" == *'Cannot find module'* || "$status_body" == *'MODULE_NOT_FOUND'* || "$status_body" == *'webpack-runtime'* || "$status_body" == *'8352.js'* ]]; then
    die "Stale Next.js chunk/runtime errors detected in /api/actions/status"
  fi
}

start_agent_if_needed() {
  if agent_healthy; then
    log "Agent already healthy on ${AGENT_PORT}."
    return 0
  fi
  log "Starting agent on ${AGENT_PORT}."
  if command -v setsid >/dev/null 2>&1; then
    AGENT_PORT="$AGENT_PORT" setsid pnpm --dir "$REPO_ROOT/packages/cli" dev >"$AGENT_LOG" 2>"$AGENT_ERR_LOG" </dev/null &
  else
    AGENT_PORT="$AGENT_PORT" nohup pnpm --dir "$REPO_ROOT/packages/cli" dev >"$AGENT_LOG" 2>"$AGENT_ERR_LOG" </dev/null &
  fi
}

start_relay() {
  wait_for_docker
  log "Starting relay via docker compose."
  (cd "$REPO_ROOT" && docker compose up -d)
}

start_web_if_needed() {
  if web_healthy; then
    log "Web already healthy on ${WEB_PORT}."
    return 0
  fi
  log "Starting web on ${WEB_PORT}."
  if command -v setsid >/dev/null 2>&1; then
    HOST="127.0.0.1" PORT="$WEB_PORT" setsid pnpm --dir "$REPO_ROOT/apps/web" dev >"$WEB_LOG" 2>"$WEB_ERR_LOG" </dev/null &
  else
    HOST="127.0.0.1" PORT="$WEB_PORT" nohup pnpm --dir "$REPO_ROOT/apps/web" dev >"$WEB_LOG" 2>"$WEB_ERR_LOG" </dev/null &
  fi
}

stop_web() {
  kill_port "$WEB_PORT"
}

stop_agent() {
  kill_port "$AGENT_PORT"
}

stop_relay() {
  log "Stopping relay via docker compose."
  (cd "$REPO_ROOT" && docker compose down) || true
}

rebuild_web() {
  stop_web
  rm -rf "$REPO_ROOT/apps/web/.next"
  (cd "$REPO_ROOT/apps/web" && pnpm type-check)
  (cd "$REPO_ROOT/apps/web" && pnpm build)
  start_web_if_needed
  sleep 8
  verify_local_web
}

verify_local_web() {
  web_healthy || die "Web on ${WEB_PORT} is not healthy"
  local status_body
  status_body="$(curl -sS "$WEB_ACTION_STATUS_URL" 2>/dev/null || true)"
  if [[ "$status_body" == *'Cannot find module'* || "$status_body" == *'webpack-runtime'* || "$status_body" == *'MODULE_NOT_FOUND'* || "$status_body" == *'8352.js'* ]]; then
    die "Web action endpoint still shows stale Next.js chunk/runtime errors"
  fi
  if [[ "$status_body" != *'"error":"Unauthorized"'* && "$status_body" != *'"error": "Unauthorized"'* && "$status_body" != *'"status":"ok"'* && "$status_body" != *'"connected"'* ]]; then
    die "Web action endpoint did not return Unauthorized or expected JSON"
  fi
  assert_no_stale_next_errors
}

verify_public() {
  public_openapi_healthy || die "Public /api/openapi is not healthy"
  local status_body
  status_body="$(curl -sS "$PUBLIC_STATUS_URL" 2>/dev/null || true)"
  if [[ "$status_body" == *'502 Bad Gateway'* || "$status_body" == *'Cannot find module'* || "$status_body" == *'webpack-runtime'* || "$status_body" == *'MODULE_NOT_FOUND'* || "$status_body" == *'8352.js'* ]]; then
    die "Public BuildFlow endpoint still unhealthy"
  fi
  if [[ "$status_body" != *'"error":"Unauthorized"'* && "$status_body" != *'"error": "Unauthorized"'* && "$status_body" != *'"status":"ok"'* && "$status_body" != *'"connected"'* ]]; then
    die "Public action status endpoint did not return Unauthorized or expected JSON"
  fi
}

verify_all() {
  agent_healthy || die "Agent on ${AGENT_PORT} is not healthy"
  relay_healthy || die "Relay on ${RELAY_PORT} is not healthy"
  verify_local_web
  public_openapi_healthy || die "Public /api/openapi is not healthy"
  verify_public
}

status_all() {
  log "Agent ${AGENT_PORT}: $(agent_healthy && echo healthy || echo unhealthy)"
  log "Relay ${RELAY_PORT}: $(relay_healthy && echo healthy || echo unhealthy)"
  log "Web ${WEB_PORT}: $(web_healthy && echo healthy || echo unhealthy)"
}

restart_all() {
  stop_web
  rm -rf "$REPO_ROOT/apps/web/.next"
  (cd "$REPO_ROOT/apps/web" && pnpm type-check)
  (cd "$REPO_ROOT/apps/web" && pnpm build)
  wait_for_docker
  start_relay
  start_agent_if_needed
  start_web_if_needed
  sleep 8
  verify_all
}

cmd="${1:-}"
case "$cmd" in
  status)
    status_all
    ;;
  start)
    wait_for_docker
    start_relay
    start_agent_if_needed
    start_web_if_needed
    sleep 8
    verify_all
    ;;
  stop)
    stop_web
    stop_agent
    stop_relay
    ;;
  rebuild-web)
    rebuild_web
    ;;
  verify)
    verify_all
    ;;
  restart)
    restart_all
    ;;
  *)
    cat <<EOF
Usage: $0 {status|start|stop|rebuild-web|verify|restart}

Rules:
- Never run pnpm --dir apps/web build while pnpm --dir apps/web dev is running.
- Stop web first, clear apps/web/.next if needed, build, then restart web.
EOF
    exit 1
    ;;
esac
