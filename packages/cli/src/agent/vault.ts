import fs from 'fs'
import path from 'path'
import { getVaultPath } from './config'
import { validatePath } from './permissions'
import { logToFile } from '../utils/logger'

export async function resolveSafePath(relativePath: string): Promise<string> {
  const vaultPath = getVaultPath()
  const normalized = path.normalize(relativePath)
  const fullPath = path.join(vaultPath, normalized)
  const resolved = path.resolve(fullPath)

  // Ensure resolved path is within vault
  if (!resolved.startsWith(path.resolve(vaultPath))) {
    throw new Error('Access denied. Path outside vault.')
  }

  return resolved
}

export async function readFile(relativePath: string): Promise<{ path: string; content: string }> {
  const validation = validatePath(relativePath)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  try {
    const fullPath = await resolveSafePath(relativePath)
    const content = fs.readFileSync(fullPath, 'utf-8')

    logToFile({
      timestamp: new Date().toISOString(),
      tool: 'read_file',
      path: relativePath,
      status: 'success'
    })

    return { path: relativePath, content }
  } catch (err) {
    logToFile({
      timestamp: new Date().toISOString(),
      tool: 'read_file',
      path: relativePath,
      status: 'error',
      error: String(err)
    })
    throw err
  }
}

export async function createFile(relativePath: string, content: string): Promise<{ path: string; created: boolean }> {
  const validation = validatePath(relativePath)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  try {
    const fullPath = await resolveSafePath(relativePath)

    // Check if file exists
    if (fs.existsSync(fullPath)) {
      throw new Error('File already exists. Use append-note or choose a new path.')
    }

    // Create directory structure
    const dir = path.dirname(fullPath)
    fs.mkdirSync(dir, { recursive: true })

    // Write file
    fs.writeFileSync(fullPath, content, 'utf-8')

    logToFile({
      timestamp: new Date().toISOString(),
      tool: 'create_file',
      path: relativePath,
      status: 'success'
    })

    return { path: relativePath, created: true }
  } catch (err) {
    logToFile({
      timestamp: new Date().toISOString(),
      tool: 'create_file',
      path: relativePath,
      status: 'error',
      error: String(err)
    })
    throw err
  }
}

export async function appendFile(relativePath: string, content: string): Promise<{ path: string; appended: boolean }> {
  const validation = validatePath(relativePath)
  if (!validation.valid) {
    throw new Error(validation.error)
  }

  try {
    const fullPath = await resolveSafePath(relativePath)

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      throw new Error('File not found.')
    }

    // Append to file
    fs.appendFileSync(fullPath, content, 'utf-8')

    logToFile({
      timestamp: new Date().toISOString(),
      tool: 'append_file',
      path: relativePath,
      status: 'success'
    })

    return { path: relativePath, appended: true }
  } catch (err) {
    logToFile({
      timestamp: new Date().toISOString(),
      tool: 'append_file',
      path: relativePath,
      status: 'error',
      error: String(err)
    })
    throw err
  }
}

export async function listFolder(relativePath?: string): Promise<Array<{ path: string; type: 'file' | 'folder' }>> {
  try {
    const vaultPath = getVaultPath()
    const fullPath = relativePath ? await resolveSafePath(relativePath) : vaultPath

    const entries = fs.readdirSync(fullPath, { withFileTypes: true })
    const results = []

    for (const entry of entries) {
      if (entry.name.startsWith('.')) continue

      results.push({
        path: relativePath ? `${relativePath}/${entry.name}` : entry.name,
        type: entry.isDirectory() ? ('folder' as const) : ('file' as const)
      })
    }

    return results
  } catch (err) {
    throw err
  }
}
