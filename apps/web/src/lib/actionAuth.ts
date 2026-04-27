import { NextRequest, NextResponse } from 'next/server'
import { getBackendMode } from './actions/config'

export interface AuthResult {
  valid: boolean
  error?: NextResponse
  bearerToken?: string
}

// Token authentication with mode-aware behavior:
// - relay-agent mode: pass-through user tokens (forward to bridge unchanged)
// - direct-agent mode: validate against global BUILDFLOW_ACTION_TOKEN
export function checkActionAuth(request: NextRequest): AuthResult {
  const mode = getBackendMode()
  const authHeader = request.headers.get('authorization')

  // Relay-agent mode: accept any valid Authorization header and forward it
  if (mode === 'relay-agent') {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        valid: false,
        error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }
    const token = authHeader.slice(7)
    return { valid: true, bearerToken: token }
  }

  // Direct-agent mode: validate against global BUILDFLOW_ACTION_TOKEN
  const token = process.env.BUILDFLOW_ACTION_TOKEN

  if (!token) {
    return {
      valid: false,
      error: NextResponse.json(
        { error: 'Server configuration error: BUILDFLOW_ACTION_TOKEN not set' },
        { status: 500 }
      )
    }
  }

  const expectedBearer = `Bearer ${token}`
  if (!authHeader || authHeader !== expectedBearer) {
    return {
      valid: false,
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return { valid: true }
}
