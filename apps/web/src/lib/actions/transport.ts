import { getBackendUrl, getBackendMode, getRelayProxyToken } from './config'

export class ActionTransportError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message)
    this.name = 'ActionTransportError'
  }
}

export async function executeAction(
  endpoint: string,
  body: Record<string, unknown>
): Promise<unknown> {
  const backendUrl = getBackendUrl()
  const mode = getBackendMode()
  const url = `${backendUrl}${endpoint}`

  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }

    // Add proxy token for relay-agent mode
    if (mode === 'relay-agent') {
      const proxyToken = getRelayProxyToken()
      if (proxyToken) {
        headers['Authorization'] = `Bearer ${proxyToken}`
      }
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
