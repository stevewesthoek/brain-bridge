import { NextRequest, NextResponse } from 'next/server'
import { checkActionAuth } from '@/lib/actionAuth'
import { dispatchBuildFlowFileChange, unwrapActionError } from '@/lib/actions/gpt'

export async function POST(request: NextRequest) {
  const authError = checkActionAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const data = await dispatchBuildFlowFileChange(body)
    if ('error' in (data as Record<string, unknown>)) {
      const payload = data as { error: string; status: number }
      return NextResponse.json({ error: payload.error }, { status: payload.status })
    }
    return NextResponse.json(data)
  } catch (err) {
    const { error, status } = unwrapActionError(err, 'apply-file-change error')
    return NextResponse.json({ error }, { status })
  }
}
