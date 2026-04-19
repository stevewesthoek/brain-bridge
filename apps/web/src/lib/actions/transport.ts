import { getBackendUrl } from './config'

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
  const url = `${backendUrl}${endpoint}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
