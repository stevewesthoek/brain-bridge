import WebSocket from 'ws'
import { ToolCallMessage, ToolResponseMessage } from '@buildflow/shared'
import { readFile, createFile, appendFile } from './vault'
import { Indexer } from './indexer'
import { VaultSearcher } from './search'
import { createExportPlan } from './export'
import { listWorkspaceTree, grepWorkspace, getWorkspaceInfo, resolveWorkspacePath, validateWorkspacePath } from './workspace'
import { debug, log } from '../utils/logger'
import { logToFile } from '../utils/logger'
import fs from 'fs'

export class BridgeClient {
  private ws: WebSocket | null = null
  private url: string
  private deviceToken: string
  private indexer: Indexer
  private searcher: VaultSearcher

  constructor(apiBaseUrl: string, deviceToken: string) {
    this.url = apiBaseUrl.replace('http://', 'ws://').replace('https://', 'wss://')
    this.deviceToken = deviceToken
    this.indexer = new Indexer()
    this.searcher = new VaultSearcher(this.indexer.getDocs())
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(`${this.url}/api/bridge/ws`)

        this.ws.on('open', () => {
          log('Connected to relay')

          // Authenticate
          this.ws?.send(JSON.stringify({
            type: 'auth',
            deviceToken: this.deviceToken
          }))

          resolve()
        })

        this.ws.on('message', (data: string) => {
          this.handleMessage(data)
        })

        this.ws.on('error', (err) => {
          console.error('WebSocket error:', err)
          reject(err)
        })

        this.ws.on('close', () => {
          log('Disconnected from relay')
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  private async handleMessage(data: string): Promise<void> {
    try {
      const message = JSON.parse(data)

      // Handle command requests from relay transport
      if (message.type === 'command_request') {
        await this.handleCommandRequest(message)
        return
      }

      // Handle auth response
      if (message.type === 'auth_response') {
        if (message.status === 'ok') {
          log(`Device authenticated: ${message.deviceId}`)
        } else {
          console.error(`Auth failed: ${message.error}`)
        }
        return
      }

      // Handle ping (heartbeat)
      if (message.type === 'ping') {
        this.ws?.send(JSON.stringify({ type: 'pong' }))
        return
      }

      // Legacy tool call handling (for backward compatibility)
      const toolMessage = message as ToolCallMessage
      if (toolMessage.tool) {
        debug(`Received tool call: ${toolMessage.tool}`)

        let result: Record<string, unknown> | undefined
        let error: string | undefined

        try {
          switch (toolMessage.tool) {
            case 'search_plan':
              const searchInput = toolMessage.input as { query: string; limit?: number }
              const searchResults = this.searcher.search(searchInput.query, searchInput.limit)
              result = { results: searchResults }
              break

            case 'read_file':
              const readInput = toolMessage.input as { path: string }
              result = await readFile(readInput.path)
              break

            case 'create_note':
              const createInput = toolMessage.input as { path?: string; content: string }
              result = await createFile(createInput.path || '', createInput.content)
              await this.indexer.buildIndex()
              this.searcher = new VaultSearcher(this.indexer.getDocs())
              break

            case 'append_note':
              const appendInput = toolMessage.input as { path: string; content: string }
              result = await appendFile(appendInput.path, appendInput.content)
              break

            case 'export_claude_plan':
              result = await createExportPlan(toolMessage.input)
              await this.indexer.buildIndex()
              this.searcher = new VaultSearcher(this.indexer.getDocs())
              break

            default:
              error = `Unknown tool: ${toolMessage.tool}`
          }
        } catch (err) {
          error = String(err)
        }

        // Send response
        const response: ToolResponseMessage = {
          id: toolMessage.id,
          status: error ? 'error' : 'success',
          result: error ? undefined : result,
          error
        }

        this.ws?.send(JSON.stringify(response))
      }
    } catch (err) {
      console.error('Failed to handle message:', err)
    }
  }

  private async handleCommandRequest(message: any): Promise<void> {
    const { requestId, command, params } = message

    debug(`Received command from relay: ${command} (request ${requestId})`)

    let result: any = undefined
    let error: string | undefined

    try {
      switch (command) {
        case 'health':
          result = {
            status: 'ok',
            deviceConnected: this.ws?.readyState === WebSocket.OPEN
          }
          break

        case 'workspaces': {
          const { getWorkspaces } = await import('./config')
          const workspaces = getWorkspaces()
          result = { workspaces }
          break
        }

        case 'tree': {
          const workspace = params.workspace || 'vault'
          const path = params.path || ''
          const maxDepth = params.maxDepth || 3
          const maxEntries = params.maxEntries || 100

          try {
            // Validate workspace exists
            getWorkspaceInfo(workspace)
            const tree = listWorkspaceTree(workspace, path, maxDepth, 0, maxEntries)
            result = { tree, count: tree.length }
          } catch (err) {
            error = String(err)
          }
          break
        }

        case 'grep': {
          const workspace = params.workspace || 'vault'
          const pattern = params.pattern
          if (!pattern) {
            error = 'Pattern required for grep'
            break
          }
          const maxResults = params.maxResults || 100
          const maxLineLength = params.maxLineLength || 500

          try {
            // Validate workspace exists
            getWorkspaceInfo(workspace)
            const results = grepWorkspace(workspace, pattern, { maxResults, maxLineLength })
            result = { results, count: results.length }
          } catch (err) {
            error = String(err)
          }
          break
        }

        case 'context': {
          const workspace = params.workspace || 'vault'
          const query = params.query || ''
          const maxDepth = params.maxDepth || 2
          const maxResults = params.maxResults || 20

          try {
            const ws = getWorkspaceInfo(workspace)
            const tree = listWorkspaceTree(workspace, '', maxDepth, 0, 50)
            let matches = []
            if (query) {
              matches = grepWorkspace(workspace, query, { maxResults })
            }
            const summary = `Workspace: ${ws.name}\nRoot: ${ws.root}\nMode: ${ws.mode}\nTree items: ${tree.length}`
            const entrypointNames = ['README.md', 'index.md', 'MANIFEST.md', 'package.json', 'tsconfig.json']
            const entrypoints = entrypointNames.filter(
              name => tree.some(n => n.name === name && n.type === 'file')
            )

            // Extract key files: read first 3 entrypoints
            const keyFiles = []
            for (const ep of entrypoints.slice(0, 3)) {
              try {
                const epPath = tree.find(n => n.name === ep && n.type === 'file')?.path
                if (epPath) {
                  const fullPath = resolveWorkspacePath(ws, epPath)
                  const stat = fs.statSync(fullPath)
                  // Skip if > 50KB
                  if (stat.size > 50000) continue
                  const content = fs.readFileSync(fullPath, 'utf-8')
                  keyFiles.push({
                    path: epPath,
                    content: content.slice(0, 2000),
                    size: stat.size
                  })
                }
              } catch (err) {
                // Skip if can't read
              }
            }

            result = { workspace, summary, tree, matches, entrypoints, keyFiles }
          } catch (err) {
            error = String(err)
          }
          break
        }

        case 'read': {
          const path = params.path
          if (!path) {
            error = 'Path required for read'
            break
          }
          const workspace = params.workspace || 'vault'

          try {
            // Validate workspace and path
            const ws = getWorkspaceInfo(workspace)
            const validation = validateWorkspacePath(ws, path)
            if (!validation.valid) {
              error = validation.error || 'Invalid path'
              break
            }

            // Resolve and read with guardrails
            const fullPath = resolveWorkspacePath(ws, path)

            if (!fs.existsSync(fullPath)) {
              error = 'File not found'
              break
            }

            const stat = fs.statSync(fullPath)
            if (!stat.isFile()) {
              error = 'Not a file'
              break
            }

            // Enforce 1MB size limit
            const maxSize = 1024 * 1024
            if (stat.size > maxSize) {
              error = `File too large (${stat.size} bytes, max ${maxSize})`
              break
            }

            // Enforce safe file extensions
            const safeExtensions = ['.md', '.txt', '.json', '.yaml', '.yml', '.ts', '.tsx', '.js', '.jsx', '.sh', '.env.example', '.csv']
            const fileExt = path.toLowerCase().slice(path.lastIndexOf('.'))
            if (!safeExtensions.includes(fileExt)) {
              error = `Unsupported file type: ${fileExt}`
              break
            }

            const content = fs.readFileSync(fullPath, 'utf-8')
            result = { path, content, workspace, size: stat.size }
          } catch (err) {
            error = String(err)
          }
          break
        }

        case 'action_proxy:search': {
          const query = params.query
          const limit = params.limit || 10
          if (!query) {
            error = 'Query required for search'
            break
          }
          try {
            const searchResults = this.searcher.search(query, limit)
            result = { results: searchResults }
          } catch (err) {
            error = String(err)
          }
          break
        }

        case 'action_proxy:read': {
          const path = params.path
          if (!path) {
            error = 'Path required for read'
            break
          }
          const workspace = params.workspace || 'vault'
          try {
            const ws = getWorkspaceInfo(workspace)
            const validation = validateWorkspacePath(ws, path)
            if (!validation.valid) {
              error = validation.error || 'Invalid path'
              break
            }
            const fullPath = resolveWorkspacePath(ws, path)
            if (!fs.existsSync(fullPath)) {
              error = 'File not found'
              break
            }
            const stat = fs.statSync(fullPath)
            if (!stat.isFile()) {
              error = 'Not a file'
              break
            }
            const maxSize = 1024 * 1024
            if (stat.size > maxSize) {
              error = `File too large (${stat.size} bytes, max ${maxSize})`
              break
            }
            const safeExtensions = ['.md', '.txt', '.json', '.yaml', '.yml', '.ts', '.tsx', '.js', '.jsx', '.sh', '.env.example', '.csv']
            const fileExt = path.toLowerCase().slice(path.lastIndexOf('.'))
            if (!safeExtensions.includes(fileExt)) {
              error = `Unsupported file type: ${fileExt}`
              break
            }
            const content = fs.readFileSync(fullPath, 'utf-8')
            result = { path, content }
          } catch (err) {
            error = String(err)
          }
          break
        }

        case 'action_proxy:create': {
          const content = params.content
          if (!content) {
            error = 'Content required for create'
            break
          }
          try {
            const path = params.path || `BuildFlow/Inbox/${new Date().toISOString().split('T')[0]}-note.md`
            const frontmatter = `---\ncreated: ${new Date().toISOString()}\nsource: buildflow\ntype: note\n---\n\n`
            const fullContent = frontmatter + content
            result = await createFile(path, fullContent)
            await this.indexer.buildIndex()
            this.searcher = new VaultSearcher(this.indexer.getDocs())
          } catch (err) {
            error = String(err)
          }
          break
        }

        case 'action_proxy:append': {
          const path = params.path
          const content = params.content
          if (!path || !content) {
            error = 'Path and content required for append'
            break
          }
          try {
            result = await appendFile(path, content)
            await this.indexer.buildIndex()
            this.searcher = new VaultSearcher(this.indexer.getDocs())
          } catch (err) {
            error = String(err)
          }
          break
        }

        default:
          error = `Unknown command: ${command}`
      }
    } catch (err) {
      error = String(err)
    }

    // Send response back to relay
    this.ws?.send(JSON.stringify({
      type: 'command_response',
      requestId,
      error: error || undefined,
      result: error ? undefined : result
    }))

    logToFile({
      timestamp: new Date().toISOString(),
      tool: 'relay_client_command',
      status: error ? 'error' : 'success',
      command,
      requestId,
      error
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}
