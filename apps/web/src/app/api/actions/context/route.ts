import { NextRequest, NextResponse } from 'next/server'
import { checkActionAuth } from '@/lib/actionAuth'
import { dispatchBuildFlowContext, unwrapActionError } from '@/lib/actions/gpt'

export async function GET(request: NextRequest) {
  const authError = checkActionAuth(request)
  if (authError) return authError

  try {
    const data = await dispatchBuildFlowContext({ action: 'get_active' })
    return NextResponse.json(data)
  } catch (err) {
    const { error, status } = unwrapActionError(err, 'context error')
    return NextResponse.json({ error }, { status })
  }
}

export async function POST(request: NextRequest) {
  const authError = checkActionAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const action = body.action
    if (!action) {
      return NextResponse.json({ error: 'Missing action parameter' }, { status: 400 })
    }
    const data = await dispatchBuildFlowContext(body)
    return NextResponse.json(data)
  } catch (err) {
    const { error, status } = unwrapActionError(err, 'context error')
    return NextResponse.json({ error }, { status })
  }
}
