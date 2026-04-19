export type BackendMode = 'direct-agent' | 'relay-agent'

export function getBackendMode(): BackendMode {
  const mode = process.env.BRAIN_BRIDGE_BACKEND_MODE as BackendMode | undefined
  if (mode && !['direct-agent', 'relay-agent'].includes(mode)) {
    console.warn(`Unknown BRAIN_BRIDGE_BACKEND_MODE: ${mode}. Defaulting to direct-agent.`)
    return 'direct-agent'
  }
  return mode || 'direct-agent'
}

export function getRelayProxyToken(): string | null {
  return process.env.RELAY_PROXY_TOKEN || null
}

export function getBackendUrl(): string {
  const mode = getBackendMode()

  if (mode === 'direct-agent') {
    return process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'
  }

  if (mode === 'relay-agent') {
    return 'http://127.0.0.1:3053/api/actions/proxy'
  }

  throw new Error('Unknown backend mode')
}

export function getBackendDebugInfo(): { mode: BackendMode; url: string } {
  const mode = getBackendMode()
  const url = getBackendUrl()
  return { mode, url }
}
