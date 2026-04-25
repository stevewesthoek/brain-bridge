import { NextRequest, NextResponse } from 'next/server'
import { checkActionAuth } from '@/lib/actionAuth'
import { dispatchBuildFlowRead, unwrapActionError } from '@/lib/actions/gpt'

export async function POST(request: NextRequest) {
  const authError = checkActionAuth(request)
  if (authError) return authError

  try {
    const body = await request.json()
    const data = await dispatchBuildFlowRead(body)
    return NextResponse.json(data)
  } catch (err) {
    const { error, status } = unwrapActionError(err, 'read-context error')
    return NextResponse.json({ error }, { status })
  }
}
