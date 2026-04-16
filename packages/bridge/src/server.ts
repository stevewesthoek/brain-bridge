import http from 'http'
import WebSocket from 'ws'

const PORT = parseInt(process.env.BRIDGE_PORT || '3053', 10)
const LOCAL_AGENT_URL = process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'

interface DeviceConnection {
  ws: WebSocket
  deviceId: string
  status: 'online' | 'offline'
  lastSeen: Date
}

interface PendingCall {
  resolve: (value: any) => void
  reject: (reason?: any) => void
  timeout: NodeJS.Timeout
}

// Device registry
const devices = new Map<string, DeviceConnection>()
const pendingCalls = new Map<string, PendingCall>()
let messageIdCounter = 0

// HTTP server
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json')

  // Health endpoint
  if (req.method === 'GET' && req.url === '/health') {
    const connectedDevices = Array.from(devices.values()).filter(d => d.ws.readyState === WebSocket.OPEN)
    const agentConnected = connectedDevices.length > 0

    // Try to reach local agent
    let agentHealth = null
    try {
      const response = await fetch(`${LOCAL_AGENT_URL}/health`)
      if (response.ok) {
        agentHealth = await response.json()
      }
    } catch (err) {
      // Local agent not reachable
    }

    const status = {
      status: 'ok',
      bridgeRunning: true,
      port: PORT,
      localAgentUrl: LOCAL_AGENT_URL,
      agentHealthy: agentHealth !== null,
      connectedDevices: connectedDevices.length,
      agentHealth: agentHealth
    }

    res.writeHead(200)
    res.end(JSON.stringify(status, null, 2))
    return
  }

  res.writeHead(404)
  res.end(JSON.stringify({ error: 'Not found' }))
})

// WebSocket server
const wss = new WebSocket.Server({ server })

wss.on('connection', (ws: WebSocket) => {
  let deviceId: string | null = null

  ws.on('message', async (data: string) => {
    try {
      const message = JSON.parse(data)

      // Auth message
      if (message.type === 'auth') {
        deviceId = message.deviceToken || `device-${Date.now()}`
        devices.set(deviceId, {
          ws,
          deviceId,
          status: 'online',
          lastSeen: new Date()
        })
        console.log(`[Bridge] Device connected: ${deviceId}`)
        return
      }

      // Tool response message
      if (message.id && message.result !== undefined) {
        const pending = pendingCalls.get(message.id)
        if (pending) {
          clearTimeout(pending.timeout)
          if (message.error) {
            pending.reject(new Error(message.error))
          } else {
            pending.resolve(message.result)
          }
          pendingCalls.delete(message.id)
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
    }
  })

  ws.on('error', (err) => {
    console.error('[Bridge] Error:', err)
  })
})

// Call tool on connected device
export async function callToolOnDevice(tool: string, input: any): Promise<any> {
  const connectedDevices = Array.from(devices.values()).filter(d => d.ws.readyState === WebSocket.OPEN)

  if (connectedDevices.length === 0) {
    throw new Error('No devices connected to bridge')
  }

  const device = connectedDevices[0]
  const messageId = `msg-${++messageIdCounter}`

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingCalls.delete(messageId)
      reject(new Error(`Tool call timeout: ${tool}`))
    }, 20000)

    pendingCalls.set(messageId, { resolve, reject, timeout })

    device.ws.send(JSON.stringify({
      id: messageId,
      tool,
      input
    }))
  })
}

// Start server
server.listen(PORT, '127.0.0.1', () => {
  console.log(`[Bridge] Server running on http://127.0.0.1:${PORT}`)
  console.log(`[Bridge] WebSocket: ws://127.0.0.1:${PORT}/`)
  console.log(`[Bridge] Health: GET http://127.0.0.1:${PORT}/health`)
  console.log(`[Bridge] Local agent: ${LOCAL_AGENT_URL}`)
})

export { devices }
