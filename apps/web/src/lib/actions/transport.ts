import { getBackendUrl, getBackendMode } from './config'
import { buildActionErrorEnvelope } from './action-response'

export class ActionTransportError extends Error {
  constructor(message: string, public statusCode: number, public payload?: unknown) {
    super(message)
    this.name = 'ActionTransportError'
  }
}

type FetchResult = {
  response: Response
  text: string
  data: unknown
}

const REQUEST_TIMEOUT_MS = 15000

function isTimeoutError(err: unknown) {
  return err instanceof DOMException && err.name === 'AbortError'
}

function isConnectionError(err: unknown) {
  if (!(err instanceof Error)) return false
  return /ECONNREFUSED|ECONNRESET|ENOTFOUND|EAI_AGAIN|fetch failed|Failed to fetch|socket hang up|network error/i.test(err.message)
}

async function readJsonResponse(response: Response, endpoint: string): Promise<FetchResult> {
  const text = await response.text()
  if (!text.trim()) {
    throw new ActionTransportError(
      `Empty response from ${endpoint}`,
      response.status >= 400 ? response.status : 502,
      buildActionErrorEnvelope({
        code: 'EMPTY_RELAY_RESPONSE',
        message: 'BuildFlow returned an empty response.',
        details: `The upstream response for ${endpoint} had no body.`,
        status: 'error'
      })
    )
  }

  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new ActionTransportError(
      `Invalid JSON from ${endpoint}`,
      response.status >= 400 ? response.status : 502,
      buildActionErrorEnvelope({
        code: 'INVALID_RELAY_RESPONSE',
        message: 'BuildFlow returned invalid JSON.',
        details: `The upstream response for ${endpoint} could not be parsed as JSON.`,
        status: 'error'
      })
    )
  }

  return { response, text, data }
}

function normalizeTransportFailure(err: unknown, endpoint: string, timeoutMs = REQUEST_TIMEOUT_MS) {
  if (err instanceof ActionTransportError) {
    return err
  }

  if (isTimeoutError(err)) {
    return new ActionTransportError(
      `Timed out waiting for ${endpoint}`,
      504,
      buildActionErrorEnvelope({
        code: 'LOCAL_STACK_TIMEOUT',
        message: 'BuildFlow local stack timed out.',
        details: `The request to ${endpoint} exceeded ${timeoutMs}ms.`,
        recovery: ['Open OrbStack', 'Run pnpm local:restart', 'Run scripts/buildflow-local-stack.sh status'],
        status: 'unavailable'
      })
    )
  }

  if (isConnectionError(err)) {
    return new ActionTransportError(
      `Local stack unavailable for ${endpoint}`,
      503,
      buildActionErrorEnvelope({
        code: 'LOCAL_STACK_UNAVAILABLE',
        message: 'BuildFlow local stack is unavailable.',
        details: 'Docker/OrbStack may be stopped or the relay is not running.',
        recovery: ['Open OrbStack', 'Run pnpm local:restart', 'Run scripts/buildflow-local-stack.sh status'],
        status: 'unavailable'
      })
    )
  }

  return new ActionTransportError(
    'Backend request failed',
    503,
    buildActionErrorEnvelope({
      code: 'ACTION_TRANSPORT_ERROR',
      message: 'Backend request failed.',
      details: err instanceof Error ? err.message : String(err),
      status: 'error'
    })
  )
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timer)
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

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      let errorData: unknown = {}
      if (errorText.trim()) {
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }
      }
      const message = typeof (errorData as Record<string, unknown>).error === 'string'
        ? (errorData as Record<string, unknown>).error as string
        : `Action failed: ${response.status}`
      throw new ActionTransportError(message, response.status, errorData)
    }

    const { data } = await readJsonResponse(response, endpoint)
    return data
  } catch (err) {
    throw normalizeTransportFailure(err, endpoint)
  }
}

export async function executeActionGET(
  endpoint: string,
  userToken?: string
): Promise<{ data: unknown; status: number }> {
  const mode = getBackendMode()
  const backendUrl = getBackendUrl()

  // In relay-agent mode: convert to POST through proxy endpoint (cleaner than bridge GET support)
  if (mode === 'relay-agent') {
    // Convert /api/status -> /api/actions/proxy/api/status
    const proxyEndpoint = `/api/actions/proxy${endpoint}`
    const url = `${backendUrl}${proxyEndpoint}`

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }

      if (userToken) {
        headers['Authorization'] = `Bearer ${userToken}`
      }

      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({})
      })

      const { data } = await readJsonResponse(response, endpoint)
      return { data, status: response.status }
    } catch (err) {
      throw normalizeTransportFailure(err, endpoint)
    }
  }

  // In direct-agent mode: use GET as normal
  const url = `${backendUrl}${endpoint}`

  try {
    const headers: Record<string, string> = { 'Cache-Control': 'no-store' }

    const response = await fetchWithTimeout(url, {
      method: 'GET',
      headers,
      cache: 'no-store'
    })

    const { data } = await readJsonResponse(response, endpoint)
    return { data, status: response.status }
  } catch (err) {
    throw normalizeTransportFailure(err, endpoint)
  }
}
