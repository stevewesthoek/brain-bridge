import { NextResponse } from 'next/server'

export async function GET() {
  const bridgeUrl = process.env.BRIDGE_URL || 'http://127.0.0.1:3053'

  try {
    const response = await fetch(`${bridgeUrl}/health`)
    if (!response.ok) {
      return NextResponse.json(
        { error: 'Bridge health check failed', status: response.status },
        { status: 502 }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to reach bridge: ${String(err)}` },
      { status: 503 }
    )
  }
}
