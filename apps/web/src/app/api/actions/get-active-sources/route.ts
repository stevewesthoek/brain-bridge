import { NextRequest, NextResponse } from 'next/server'
import { checkActionAuth } from '@/lib/actionAuth'
import { executeAction, ActionTransportError } from '@/lib/actions/transport'
import { buildActionErrorEnvelope } from '@/lib/actions/action-response'

export async function POST(request: NextRequest) {
  const auth = checkActionAuth(request)
  if (!auth.valid) return auth.error
  try {
    const body = await request.json()
    const data = await executeAction('/api/get-active-sources', body, auth.bearerToken)
    return NextResponse.json(data)
  } catch (err) {
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
      message: 'get-active-sources error',
      details: err instanceof Error ? err.message : String(err)
    }), { status: 500 })
  }
}
