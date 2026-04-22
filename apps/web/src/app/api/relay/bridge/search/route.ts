import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = body

    if (!query) {
      return NextResponse.json(
        { error: 'Missing query parameter' },
        { status: 400 }
      )
    }

    const relayUrl = process.env.BRIDGE_URL || 'http://127.0.0.1:3053'
    const localAgentUrl = process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'

    // Forward to the local agent through the relay path.
    const response = await fetch(`${localAgentUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Agent request failed: ${response.status}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to search: ${String(err)}` },
      { status: 500 }
    )
  }
}
