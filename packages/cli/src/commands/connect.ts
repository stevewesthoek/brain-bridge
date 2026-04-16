import fs from 'fs'
import path from 'path'
import { loadConfig, saveConfig, getVaultPath } from '../agent/config'
import { log, error } from '../utils/logger'
import { expandTilde } from '../utils/paths'
import { Indexer } from '../agent/indexer'

export async function connectCommand(vaultPath: string): Promise<void> {
  const config = loadConfig()

  if (!config) {
    error('Please run: brainbridge init')
    return
  }

  if (!vaultPath) {
    error('Vault path required. Use: brainbridge connect <path>')
    return
  }

  const expanded = expandTilde(vaultPath)

  if (!fs.existsSync(expanded)) {
    error(`Vault folder not found: ${expanded}`)
    return
  }

  if (!fs.statSync(expanded).isDirectory()) {
    error(`Not a directory: ${expanded}`)
    return
  }

  config.vaultPath = vaultPath

  try {
    saveConfig(config)

    log(`Connected to vault: ${expanded}`)
    log('Building initial index...')

    // Build index
    const indexer = new Indexer()
    await indexer.buildIndex()

    const docs = indexer.getDocs()
    log(`Indexed ${docs.length} files.`)
    log('')
    log('Next: brainbridge serve')
  } catch (err) {
    error(`Failed to connect: ${String(err)}`)
  }
}
