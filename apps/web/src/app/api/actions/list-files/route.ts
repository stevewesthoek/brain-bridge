import { NextRequest, NextResponse } from 'next/server'
import { checkActionAuth } from '@/lib/actionAuth'
import { executeAction, ActionTransportError } from '@/lib/actions/transport'

export async function POST(request: NextRequest) {
  const auth = checkActionAuth(request)
  if (!auth.valid) return auth.error
  try {
    const body = await request.json()
    const data = await executeAction('/api/list-files', body, auth.bearerToken)
    return NextResponse.json(data)
  } catch (err) {
    if (err instanceof ActionTransportError) return NextResponse.json({ error: err.message }, { status: err.statusCode })
    return NextResponse.json({ error: `List files error: ${String(err)}` }, { status: 500 })
  }
}
