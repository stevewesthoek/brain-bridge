export type BackendMode = 'direct-agent' | 'relay-agent'

export function getBackendMode(): BackendMode {
  const mode = process.env.BRAIN_BRIDGE_BACKEND_MODE as BackendMode | undefined
  if (mode && !['direct-agent', 'relay-agent'].includes(mode)) {
    console.warn(`Unknown BRAIN_BRIDGE_BACKEND_MODE: ${mode}. Defaulting to direct-agent.`)
    return 'direct-agent'
  }
  return mode || 'direct-agent'
}

export function getBackendUrl(): string {
  const mode = getBackendMode()

  if (mode === 'direct-agent') {
    return process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'
  }

  throw new Error(
    'BRAIN_BRIDGE_BACKEND_MODE=relay-agent is reserved for future implementation. ' +
    'Currently unsupported. Set BRAIN_BRIDGE_BACKEND_MODE=direct-agent or leave unset.'
  )
}

export function getBackendDebugInfo(): { mode: BackendMode; url: string } {
  const mode = getBackendMode()
  const url = mode === 'relay-agent' ? '(relay-agent: unsupported)' : getBackendUrl()
  return { mode, url }
}
