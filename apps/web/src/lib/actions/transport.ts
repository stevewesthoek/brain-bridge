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
  const localAgentUrl = process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'
  const url = `${localAgentUrl}${endpoint}`

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
