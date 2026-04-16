import { NextResponse } from 'next/server'

const LOCAL_AGENT_URL = process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'

interface RelayHealthStatus {
  status: 'ok' | 'error'
  webAppRunning: boolean
  localAgentUrl: string
  localAgentReachable: boolean
  localAgentHealth?: Record<string, unknown>
  timestamp: string
}

export async function GET() {
  let localAgentHealth: Record<string, unknown> | undefined
  let localAgentReachable = false

  try {
    const response = await fetch(`${LOCAL_AGENT_URL}/health`)
    if (response.ok) {
      localAgentHealth = await response.json()
      localAgentReachable = true
    }
  } catch (err) {
    // Local agent not reachable
  }

  const status: RelayHealthStatus = {
    status: localAgentReachable ? 'ok' : 'error',
    webAppRunning: true,
    localAgentUrl: LOCAL_AGENT_URL,
    localAgentReachable,
    localAgentHealth,
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(status)
}
