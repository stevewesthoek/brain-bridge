import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backendUrl = process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'

    let response
    try {
      response = await fetch(`${backendUrl}/api/sources/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
    } catch (err) {
      return NextResponse.json(
        { error: 'BuildFlow agent is unavailable', detail: String(err) },
        { status: 503 }
      )
    }

    if (!response.ok) {
      const errorBody = await response.text()
      return NextResponse.json(
        { error: `Agent toggle source failed: ${response.status}`, details: errorBody },
        { status: response.status }
      )
    }

    return NextResponse.json(await response.json())
  } catch (err) {
    return NextResponse.json({ error: `Failed to toggle knowledge source: ${String(err)}` }, { status: 500 })
  }
}
