import { NextRequest } from 'next/server'
import { WebSocketUpgrade } from 'next/experimental/web'

export async function GET(request: NextRequest) {
  if (request.headers.get('upgrade') === 'websocket') {
    try {
      const { socket, response } = new WebSocketUpgrade(request)

      socket.accept()

      socket.on('message', (data: Buffer) => {
        const message = JSON.parse(data.toString())

        if (message.type === 'auth') {
          // TODO: Authenticate with device token
          socket.send(JSON.stringify({ type: 'auth_ok' }))
        }
      })

      socket.on('close', () => {
        // Device disconnected
      })

      return response
    } catch (err) {
      return new Response('WebSocket upgrade failed', { status: 400 })
    }
  }

  return new Response('Not a WebSocket request', { status: 400 })
}
