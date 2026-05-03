import { NextResponse } from 'next/server'
import { executeAction, ActionTransportError } from './transport'
import { buildActionErrorEnvelope } from './action-response'

export async function requireExplicitSourceId(body: Record<string, unknown>) {
  if (typeof body.sourceId === 'string' && body.sourceId.length > 0) {
    return null
  }

  const active = await executeAction('/api/get-active-sources', {})
  const activeIds = Array.isArray((active as { activeSourceIds?: unknown }).activeSourceIds)
    ? ((active as { activeSourceIds: string[] }).activeSourceIds || [])
    : []

  if (activeIds.length === 1) {
    return null
  }

  return NextResponse.json(
    { error: 'Target sourceId required when multiple sources are active.' },
    { status: 400 }
  )
}

export function unwrapActionError(err: unknown, fallback: string) {
  if (err instanceof ActionTransportError) {
    return NextResponse.json(
      err.payload && typeof err.payload === 'object' ? err.payload : buildActionErrorEnvelope({
        code: 'ACTION_TRANSPORT_ERROR',
        message: err.message,
        details: `Status ${err.statusCode}`,
        status: err.statusCode === 504 ? 'unavailable' : 'error'
      }),
      { status: err.statusCode }
    )
  }
  return NextResponse.json(buildActionErrorEnvelope({
    code: 'BUILDFLOW_STATUS_ERROR',
    message: fallback,
    details: err instanceof Error ? err.message : String(err)
  }), { status: 500 })
}
