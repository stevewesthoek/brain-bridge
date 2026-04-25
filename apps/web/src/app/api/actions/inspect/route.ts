import { NextRequest, NextResponse } from 'next/server'
import { checkActionAuth } from '@/lib/actionAuth'
import { dispatchBuildFlowInspect, unwrapActionError } from '@/lib/actions/gpt'

export async function POST(request: NextRequest) {
  const authError = checkActionAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const data = await dispatchBuildFlowInspect(body)
    return NextResponse.json(data)
  } catch (err) {
    const { error, status } = unwrapActionError(err, 'inspect error')
    return NextResponse.json({ error }, { status })
  }
}
