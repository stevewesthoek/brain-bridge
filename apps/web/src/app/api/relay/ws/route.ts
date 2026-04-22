import { NextResponse } from 'next/server'

// Relay transport is implemented as a separate standalone server
// See packages/bridge/ directory
// This endpoint just confirms the relay service is accessible

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'WebSocket relay service runs on separate port (3002)'
  })
}
