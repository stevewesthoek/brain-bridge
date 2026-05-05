import { NextRequest } from 'next/server'
import { proxyAgentJson } from '@/lib/agentProxy'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  return proxyAgentJson('/api/sources/discovery', { timeoutMs: 60000 })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  return proxyAgentJson('/api/sources/discovery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    timeoutMs: 60000
  })
}
