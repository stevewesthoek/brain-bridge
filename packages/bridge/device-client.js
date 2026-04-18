const WebSocket = require('ws')

const RELAY_URL = process.env.RELAY_URL || 'ws://127.0.0.1:3053'
const DEVICE_TOKEN = process.env.DEVICE_TOKEN || 'local-device'

let authenticated = false
let commandCount = 0

const ws = new WebSocket(RELAY_URL)

ws.on('open', () => {
  console.log('[Device] Connecting to relay...')
  ws.send(JSON.stringify({
    type: 'auth',
    deviceToken: DEVICE_TOKEN
  }))
})

ws.on('message', (data) => {
  try {
    const msg = JSON.parse(data)

    if (msg.type === 'auth_response') {
      if (msg.status === 'ok') {
        authenticated = true
        console.log(`[Device] ✓ Authenticated as ${msg.deviceId}`)
      } else {
        console.error(`[Device] ✗ Auth failed: ${msg.error}`)
        process.exit(1)
      }
    }

    if (msg.type === 'ping') {
      ws.send(JSON.stringify({ type: 'pong' }))
    }

    if (msg.type === 'command_request') {
      commandCount++
      const { requestId, command, params } = msg
      console.log(`[Device] Received command #${commandCount}: ${command} (request ${requestId})`)

      let result = undefined
      let error = undefined

      try {
        if (command === 'health') {
          result = { status: 'ok', device: 'connected', timestamp: new Date().toISOString() }
        } else if (command === 'echo') {
          result = { echo: params.message || 'hello', received_at: new Date().toISOString() }
        } else {
          error = `Unsupported command: ${command}`
        }
      } catch (err) {
        error = String(err)
      }

      // Send response back to relay
      ws.send(JSON.stringify({
        type: 'command_response',
        requestId,
        error,
        result
      }))

      console.log(`[Device] Sent response for request ${requestId}`)
    }
  } catch (err) {
    console.error('[Device] Parse error:', err)
  }
})

ws.on('close', () => {
  console.log(`[Device] Disconnected after ${commandCount} commands`)
  process.exit(0)
})

ws.on('error', (err) => {
  console.error('[Device] Error:', err.message)
  process.exit(1)
})

// Check auth after 5s
setTimeout(() => {
  if (!authenticated) {
    console.error('[Device] Not authenticated after 5s, exiting')
    process.exit(1)
  }
  // Stay connected for tests (will be killed by parent)
}, 5000)
