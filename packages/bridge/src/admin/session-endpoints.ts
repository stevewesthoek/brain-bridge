import { IncomingMessage, ServerResponse } from 'http'
import * as sessionStore from '../storage/session-store'

export function handleCreateSession(req: IncomingMessage, res: ServerResponse): void {
  res.setHeader('Content-Type', 'application/json')

  let body = ''
  req.on('data', chunk => {
    body += chunk.toString()
  })

  req.on('end', () => {
    try {
      const payload = JSON.parse(body)
      const { deviceId, purpose } = payload

      if (!deviceId) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: 'Missing deviceId' }))
        return
      }

      const session = sessionStore.createSession(deviceId, purpose)

      res.writeHead(201)
      res.end(JSON.stringify({
        status: 'ok',
        sessionId: session.sessionId,
        deviceId: session.deviceId,
        status_: session.status,
        createdAt: session.createdAt
      }))
    } catch (err) {
      res.writeHead(400)
      res.end(JSON.stringify({ error: `Invalid request: ${String(err)}` }))
    }
  })
}

export function handleGetSession(
  req: IncomingMessage,
  res: ServerResponse,
  sessionId: string
): void {
  res.setHeader('Content-Type', 'application/json')

  const session = sessionStore.getSession(sessionId)

  if (!session) {
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Session not found' }))
    return
  }

  res.writeHead(200)
  res.end(JSON.stringify({
    sessionId: session.sessionId,
    deviceId: session.deviceId,
    status: session.status,
    createdAt: session.createdAt,
    closedAt: session.closedAt,
    lastActivityAt: session.lastActivityAt,
    commandCount: session.commandCount,
    requestIds: session.requestIds,
    metadata: session.metadata
  }))
}

export function handleListSessions(req: IncomingMessage, res: ServerResponse): void {
  res.setHeader('Content-Type', 'application/json')

  const sessions = sessionStore.listSessions()

  res.writeHead(200)
  res.end(JSON.stringify({
    total: sessions.length,
    sessions: sessions.map(s => ({
      sessionId: s.sessionId,
      deviceId: s.deviceId,
      status: s.status,
      createdAt: s.createdAt,
      commandCount: s.commandCount,
      lastActivityAt: s.lastActivityAt
    }))
  }))
}

export function handleCloseSession(
  req: IncomingMessage,
  res: ServerResponse,
  sessionId: string
): void {
  res.setHeader('Content-Type', 'application/json')

  const session = sessionStore.closeSession(sessionId)

  if (!session) {
    res.writeHead(404)
    res.end(JSON.stringify({ error: 'Session not found' }))
    return
  }

  res.writeHead(200)
  res.end(JSON.stringify({
    status: 'ok',
    sessionId: session.sessionId,
    status_: session.status,
    closedAt: session.closedAt,
    commandCount: session.commandCount
  }))
}
