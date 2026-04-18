import http from 'http'
import WebSocket from 'ws'
import { logToFile } from './logger'

const PORT = parseInt(process.env.BRIDGE_PORT || '3053', 10)
const HEARTBEAT_INTERVAL = 30000

interface DeviceConnection {
  ws: WebSocket
  deviceId: string
  status: 'online' | 'offline'
  lastSeen: Date
  lastHeartbeat: Date
}

interface PendingRequest {
  resolve: (value: any) => void
  reject: (reason?: any) => void
  timeout: NodeJS.Timeout
}

// Device registry and pending requests
const devices = new Map<string, DeviceConnection>()
const pendingRequests = new Map<string, PendingRequest>()
let requestIdCounter = 0

// Hardcoded device token whitelist for MVP
const ALLOWED_TOKENS = new Set(['dev-token-1', 'dev-token-2', 'local-device'])

// Helper to generate request ID
function generateRequestId(): string {
  return `req-${++requestIdCounter}-${Date.now()}`
}

// HTTP server
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.writeHead(200)
    res.end()
    return
  }

  // Health endpoint
  if (req.method === 'GET' && req.url === '/health') {
    const connectedDevices = Array.from(devices.values()).filter(d => d.ws.readyState === WebSocket.OPEN)

    const status = {
      status: 'ok',
      bridgeRunning: true,
      port: PORT,
      connectedDevices: connectedDevices.length,
      devices: Array.from(connectedDevices).map(d => ({
        id: d.deviceId,
        status: d.status,
        lastSeen: d.lastSeen.toISOString(),
        lastHeartbeat: d.lastHeartbeat.toISOString()
      }))
    }

    res.writeHead(200)
    res.end(JSON.stringify(status, null, 2))
    return
  }

  // Device registration endpoint
  if (req.method === 'POST' && req.url === '/api/register') {
    let body = ''
    req.on('data', chunk => { body += chunk.toString() })
    req.on('end', () => {
      try {
        const payload = JSON.parse(body)
        const { deviceToken } = payload

        if (!ALLOWED_TOKENS.has(deviceToken)) {
          res.writeHead(401)
          res.end(JSON.stringify({ error: 'Invalid device token' }))
          logToFile({
            timestamp: new Date().toISOString(),
            tool: 'relay_register',
            status: 'error',
            reason: 'invalid_token'
          })
          return
        }

        res.writeHead(200)
        res.end(JSON.stringify({
          status: 'ok',
          message: 'Device registered. Connect to WebSocket at ws://127.0.0.1:' + PORT,
          wsUrl: `ws://127.0.0.1:${PORT}`,
          deviceToken
        }))

        logToFile({
          timestamp: new Date().toISOString(),
          tool: 'relay_register',
          status: 'success',
          deviceToken
        })
      } catch (err) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: 'Invalid request' }))
      }
    })
    return
  }

  // Command endpoint: external requester sends command targeting a device
  if (req.method === 'POST' && req.url === '/api/commands') {
    let body = ''
    req.on('data', chunk => { body += chunk.toString() })
    req.on('end', () => {
      try {
        const payload = JSON.parse(body)
        const { deviceId, command, params } = payload

        if (!deviceId || !command) {
          res.writeHead(400)
          res.end(JSON.stringify({ error: 'Missing deviceId or command' }))
          return
        }

        const device = devices.get(deviceId)
        if (!device) {
          res.writeHead(404)
          res.end(JSON.stringify({ error: 'Device not found' }))
          logToFile({
            timestamp: new Date().toISOString(),
            tool: 'relay_command',
            status: 'error',
            deviceId,
            command,
            reason: 'device_not_found'
          })
          return
        }

        if (device.ws.readyState !== WebSocket.OPEN) {
          res.writeHead(503)
          res.end(JSON.stringify({ error: 'Device not connected' }))
          logToFile({
            timestamp: new Date().toISOString(),
            tool: 'relay_command',
            status: 'error',
            deviceId,
            command,
            reason: 'device_offline'
          })
          return
        }

        // Generate request ID for correlation
        const requestId = generateRequestId()
        let timedOut = false

        // Create pending request with timeout
        const timeout = setTimeout(() => {
          timedOut = true
          pendingRequests.delete(requestId)
          res.writeHead(504)
          res.end(JSON.stringify({ error: 'Command timeout' }))
          logToFile({
            timestamp: new Date().toISOString(),
            tool: 'relay_command',
            status: 'error',
            deviceId,
            command,
            reason: 'timeout'
          })
        }, 30000)

        // Register pending request
        pendingRequests.set(requestId, {
          resolve: (result: any) => {
            if (timedOut) return
            clearTimeout(timeout)
            pendingRequests.delete(requestId)
            res.writeHead(200)
            res.end(JSON.stringify({ status: 'ok', result }))
            logToFile({
              timestamp: new Date().toISOString(),
              tool: 'relay_command',
              status: 'success',
              deviceId,
              command,
              requestId
            })
          },
          reject: (error: any) => {
            if (timedOut) return
            clearTimeout(timeout)
            pendingRequests.delete(requestId)
            res.writeHead(500)
            res.end(JSON.stringify({ error: String(error) }))
            logToFile({
              timestamp: new Date().toISOString(),
              tool: 'relay_command',
              status: 'error',
              deviceId,
              command,
              reason: String(error),
              requestId
            })
          },
          timeout
        })

        // Send command to device over WebSocket
        device.ws.send(JSON.stringify({
          type: 'command_request',
          requestId,
          command,
          params: params || {}
        }))

        console.log(`[Bridge] Forwarded ${command} to device ${deviceId} (request ${requestId})`)
      } catch (err) {
        res.writeHead(400)
        res.end(JSON.stringify({ error: 'Invalid request' }))
      }
    })
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ error: 'Not found' }))
})

// WebSocket server: devices connect here
const wss = new WebSocket.Server({ server })

wss.on('connection', (ws: WebSocket) => {
  let deviceId: string | null = null

  ws.on('message', async (data: string) => {
    try {
      const message = JSON.parse(data)

      // Device authentication
      if (message.type === 'auth') {
        const token = message.deviceToken
        if (!ALLOWED_TOKENS.has(token)) {
          ws.send(JSON.stringify({
            type: 'auth_response',
            status: 'error',
            error: 'Invalid device token'
          }))
          ws.close()
          return
        }

        deviceId = token || `device-${Date.now()}`
        const now = new Date()
        devices.set(deviceId, {
          ws,
          deviceId,
          status: 'online',
          lastSeen: now,
          lastHeartbeat: now
        })

        ws.send(JSON.stringify({
          type: 'auth_response',
          status: 'ok',
          deviceId
        }))

        console.log(`[Bridge] Device authenticated: ${deviceId}`)
        logToFile({
          timestamp: new Date().toISOString(),
          tool: 'relay_auth',
          status: 'success',
          deviceId
        })
        return
      }

      // Device heartbeat response (pong)
      if (message.type === 'pong') {
        if (deviceId) {
          const device = devices.get(deviceId)
          if (device) {
            device.lastHeartbeat = new Date()
            device.status = 'online'
          }
        }
        return
      }

      // Device command response: device sends result back to relay
      // This is the return path: device completed a command, sending response
      if (message.type === 'command_response') {
        const { requestId, error, result } = message

        const pending = pendingRequests.get(requestId)
        if (pending) {
          clearTimeout(pending.timeout)
          if (error) {
            pending.reject(new Error(error))
          } else {
            pending.resolve(result)
          }
          pendingRequests.delete(requestId)

          console.log(`[Bridge] Device ${deviceId} responded to request ${requestId}`)
        } else {
          console.warn(`[Bridge] Received response for unknown request ${requestId}`)
        }
        return
      }

      // Update last seen on any message
      if (deviceId) {
        const device = devices.get(deviceId)
        if (device) {
          device.lastSeen = new Date()
        }
      }
    } catch (err) {
      console.error('[Bridge] Parse error:', err)
    }
  })

  ws.on('close', () => {
    if (deviceId) {
      devices.delete(deviceId)
      console.log(`[Bridge] Device disconnected: ${deviceId}`)
      logToFile({
        timestamp: new Date().toISOString(),
        tool: 'relay_disconnect',
        status: 'success',
        deviceId
      })
    }
  })

  ws.on('error', (err) => {
    console.error('[Bridge] WebSocket error:', err)
  })
})

// Heartbeat interval: send ping to all connected devices
setInterval(() => {
  const now = new Date()
  devices.forEach((device, deviceId) => {
    if (device.ws.readyState === WebSocket.OPEN) {
      device.ws.send(JSON.stringify({ type: 'ping' }))

      // Mark as offline if no pong within timeout window
      const timeSinceHeartbeat = now.getTime() - device.lastHeartbeat.getTime()
      if (timeSinceHeartbeat > 60000) {
        device.status = 'offline'
      }
    }
  })
}, HEARTBEAT_INTERVAL)

// Start server
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Bridge] Relay running on http://127.0.0.1:${PORT}`)
  console.log(`[Bridge] WebSocket: ws://127.0.0.1:${PORT}`)
  console.log(`[Bridge] Health: GET http://127.0.0.1:${PORT}/health`)
  console.log(`[Bridge] Register: POST http://127.0.0.1:${PORT}/api/register`)
  console.log(`[Bridge] Commands: POST http://127.0.0.1:${PORT}/api/commands`)
})

export { devices }
