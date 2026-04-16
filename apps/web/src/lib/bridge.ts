import { WebSocket } from 'ws'
import { ToolCallMessage, ToolResponseMessage, TOOL_CALL_TIMEOUT } from '@brainbridge/shared'

export class BridgeManager {
  private activeDevices: Map<string, WebSocket> = new Map()

  registerDevice(deviceId: string, ws: WebSocket): void {
    this.activeDevices.set(deviceId, ws)
  }

  unregisterDevice(deviceId: string): void {
    this.activeDevices.delete(deviceId)
  }

  getDevice(deviceId: string): WebSocket | undefined {
    return this.activeDevices.get(deviceId)
  }

  isDeviceOnline(deviceId: string): boolean {
    const ws = this.activeDevices.get(deviceId)
    return ws?.readyState === WebSocket.OPEN
  }

  async callTool(
    deviceId: string,
    tool: string,
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    const ws = this.getDevice(deviceId)

    if (!ws || !this.isDeviceOnline(deviceId)) {
      throw new Error('No active Brain Bridge device is online.')
    }

    return new Promise((resolve, reject) => {
      const callId = Math.random().toString(36)
      let resolved = false

      const timeout = setTimeout(() => {
        resolved = true
        reject(new Error('Tool call timeout'))
      }, TOOL_CALL_TIMEOUT)

      // Listen for response
      const handler = (data: Buffer) => {
        const message = JSON.parse(data.toString()) as ToolResponseMessage

        if (message.id === callId) {
          clearTimeout(timeout)

          if (!resolved) {
            resolved = true
            ws.removeListener('message', handler)

            if (message.status === 'error') {
              reject(new Error(message.error))
            } else {
              resolve(message.result || {})
            }
          }
        }
      }

      ws.on('message', handler)

      // Send call
      const callMessage: ToolCallMessage = {
        id: callId,
        tool,
        input
      }

      ws.send(JSON.stringify(callMessage))
    })
  }
}

export const bridgeManager = new BridgeManager()
