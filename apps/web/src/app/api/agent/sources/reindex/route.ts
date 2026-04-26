import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backendUrl = process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'

    let response
    try {
      response = await fetch(`${backendUrl}/api/sources/reindex`, {
        cache: 'no-store',
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

    const contentType = response.headers.get('content-type') || ''
    const payload = contentType.includes('application/json')
      ? await response.json().catch(() => ({}))
      : { error: await response.text() }

    return NextResponse.json(payload, { status: response.status })
  } catch (err) {
    return NextResponse.json({ error: `Failed to reindex knowledge source: ${String(err)}` }, { status: 500 })
  }
}
