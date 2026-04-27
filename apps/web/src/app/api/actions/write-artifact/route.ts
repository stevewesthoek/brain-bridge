import { NextRequest, NextResponse } from 'next/server'
import { checkActionAuth } from '@/lib/actionAuth'
import { dispatchBuildFlowArtifact, unwrapActionError } from '@/lib/actions/gpt'

export async function POST(request: NextRequest) {
  const auth = checkActionAuth(request)
  if (!auth.valid) return auth.error

  try {
    const body = await request.json()
    const data = await dispatchBuildFlowArtifact(body, auth.bearerToken)
    if ('error' in (data as Record<string, unknown>)) {
      const payload = data as { error: string; status: number }
      return NextResponse.json({ error: payload.error }, { status: payload.status })
    }
    if ((data as { verified?: unknown }).verified !== true) {
      return NextResponse.json({ error: 'Write was not verified' }, { status: 502 })
    }
    return NextResponse.json(data)
  } catch (err) {
    const { error, status } = unwrapActionError(err, 'write-artifact error')
    return NextResponse.json({ error }, { status })
  }
}
