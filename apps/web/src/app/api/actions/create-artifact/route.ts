import { NextRequest, NextResponse } from 'next/server'
import { checkActionAuth } from '@/lib/actionAuth'
import { executeAction, ActionTransportError } from '@/lib/actions/transport'
import { requireExplicitSourceId, unwrapActionError } from '@/lib/actions/source-guard'

export async function POST(request: NextRequest) {
  const authError = checkActionAuth(request)
  if (authError) return authError
  try {
    const body = await request.json()
    const sourceError = await requireExplicitSourceId(body)
    if (sourceError) return sourceError
    const data = await executeAction('/api/create-artifact', body)
    if ((data as { verified?: unknown }).verified !== true) {
      return NextResponse.json({ error: 'Write was not verified' }, { status: 502 })
    }
    return NextResponse.json(data)
  } catch (err) {
    return unwrapActionError(err, 'create-artifact error')
  }
}
