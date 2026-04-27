import { getBackendUrl, getBackendMode } from './config'

export class ActionTransportError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
    this.name = 'ActionTransportError'
  }
}

// Post request with optional token passthrough
// In relay-agent mode: forwards user token unchanged to bridge for multi-user routing
// In direct-agent mode: no auth token needed (validates at route level)
export async function executeAction(
  endpoint: string,
  body: Record<string, unknown>,
  userToken?: string
): Promise<unknown> {
  const backendUrl = getBackendUrl()
  const mode = getBackendMode()
  const url = `${backendUrl}${endpoint}`

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }

    if (mode === 'relay-agent' && userToken) {
      headers['Authorization'] = `Bearer ${userToken}`
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ActionTransportError(
        (errorData as Record<string, unknown>).error as string || `Action failed: ${response.status}`,
        response.status
      )
    }

    return response.json()
  } catch (err) {
    if (err instanceof ActionTransportError) {
      throw err
    }
    throw new ActionTransportError(String(err), 500)
  }
}

export async function executeActionGET(
  endpoint: string,
  userToken?: string
): Promise<{ data: unknown; status: number }> {
  const backendUrl = getBackendUrl()
  const mode = getBackendMode()
  const url = `${backendUrl}${endpoint}`

  try {
    const headers: Record<string, string> = { 'Cache-Control': 'no-store' }

    // In relay-agent mode, forward the user's bearer token to the bridge
    if (mode === 'relay-agent' && userToken) {
      headers['Authorization'] = `Bearer ${userToken}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
      cache: 'no-store'
    })

    const data = await response.json().catch(() => ({}))
    return { data, status: response.status }
  } catch (err) {
    throw new ActionTransportError(String(err), 503)
  }
}
