import { NextRequest, NextResponse } from 'next/server'

const LOCAL_AGENT_URL = process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query, limit = 10 } = body

    // Forward to local agent
    const response = await fetch(`${LOCAL_AGENT_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query, limit })
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Local agent error' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: `Relay error: ${String(err)}` },
      { status: 500 }
    )
  }
}
