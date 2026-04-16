import { TOOL_CALL_TIMEOUT } from '@brainbridge/shared'

// Bridge manager for Next.js API routes
// Relays tool calls to the bridge server on port 3002
// Bridge server maintains WebSocket connections to local agents

const BRIDGE_URL = process.env.BRIDGE_URL || 'http://127.0.0.1:3002'

interface PendingCall {
  resolve: (value: Record<string, unknown>) => void
  reject: (err: Error) => void
  timeout: NodeJS.Timeout
}

export class BridgeManager {
  private pendingCalls: Map<string, PendingCall> = new Map()
  private messageIdCounter = 0

  async callTool(
    deviceId: string,
    tool: string,
    input: Record<string, unknown>
  ): Promise<Record<string, unknown>> {
    // Relay the tool call to the bridge server
    // For Phase 2.0, we just forward to local agent directly
    const localAgentUrl = process.env.LOCAL_AGENT_URL || 'http://127.0.0.1:3052'

    try {
      const response = await fetch(`${localAgentUrl}/api/${this.toolToEndpoint(tool)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(input)
      })

      if (!response.ok) {
        throw new Error(`Local agent error: ${response.statusText}`)
      }

      return await response.json() as Record<string, unknown>
    } catch (err) {
      throw new Error(
        `Failed to call tool ${tool} on device ${deviceId}: ${String(err)}`
      )
    }
  }

  private toolToEndpoint(tool: string): string {
    switch (tool) {
      case 'search_brain':
        return 'search'
      case 'read_file':
        return 'read'
      case 'create_note':
        return 'create'
      case 'append_note':
        return 'append'
      case 'export_claude_plan':
        return 'export-plan'
      default:
        throw new Error(`Unknown tool: ${tool}`)
    }
  }
}

export const bridgeManager = new BridgeManager()
