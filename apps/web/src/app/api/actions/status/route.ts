import { NextRequest, NextResponse } from 'next/server'
import { checkActionAuth } from '@/lib/actionAuth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const authError = checkActionAuth(request)
  if (authError) return authError

  const backendUrl = process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'

  try {
    const response = await fetch(`${backendUrl}/api/status`, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-store'
      },
      cache: 'no-store'
    })

    const data = await response.json().catch(() => ({}))
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Cache-Control': 'no-store'
      }
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to reach agent: ${String(err)}` },
      {
        status: 503,
        headers: {
          'Cache-Control': 'no-store'
        }
      }
    )
  }
}
