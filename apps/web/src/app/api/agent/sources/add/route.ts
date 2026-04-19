import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backendUrl = process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'

    const response = await fetch(`${backendUrl}/api/sources/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorBody = await response.text()
      return NextResponse.json(
        { error: `Agent add source failed: ${response.status}`, details: errorBody },
        { status: response.status }
      )
    }

    return NextResponse.json(await response.json())
  } catch (err) {
    return NextResponse.json({ error: `Failed to add knowledge source: ${String(err)}` }, { status: 500 })
  }
}
