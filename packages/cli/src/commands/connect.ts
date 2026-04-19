import fs from 'fs'
import path from 'path'
import { loadConfig, saveConfig, getVaultPath } from '../agent/config'
import { log, error } from '../utils/logger'
import { expandTilde } from '../utils/paths'
import { Indexer } from '../agent/indexer'
import type { KnowledgeSource } from '@brainbridge/shared'

export async function connectCommand(vaultPath: string, sourceId?: string, sourceLabel?: string): Promise<void> {
  const config = loadConfig()

  if (!config) {
    error('Please run: brainbridge init')
    return
  }

  if (!vaultPath) {
    error('Vault path required. Use: brainbridge connect <path> [source-id] [source-label]')
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

  // Generate source ID from path if not provided
  const id = sourceId || path.basename(expanded).toLowerCase().replace(/[^a-z0-9-]/g, '-')
  const label = sourceLabel || path.basename(expanded)

  // Initialize sources array if not already using multi-source format
  if (!config.sources) {
    // Migrate old single-vault config to multi-source if vaultPath exists
    if (config.vaultPath) {
      const oldSourceId = 'vault'
      const oldLabel = 'Vault'
      config.sources = [
        {
          id: oldSourceId,
          label: oldLabel,
          path: config.vaultPath,
          enabled: true
        }
      ]
      log(`Migrated existing vault to multi-source format (ID: ${oldSourceId})`)
    } else {
      config.sources = []
    }
    // Keep vaultPath for backward compatibility
  }

  // Check if source ID already exists
  const existingSource = config.sources.find((s: KnowledgeSource) => s.id === id)
  if (existingSource) {
    error(`Source with ID "${id}" already exists. Use a different path or specify a unique source-id.`)
    return
  }

  // Add new source
  const newSource: KnowledgeSource = {
    id,
    label,
    path: vaultPath,
    enabled: true
  }

  config.sources.push(newSource)
  config.vaultPath = expanded // Keep for backward compat

  try {
    saveConfig(config)

    log(`✓ Connected knowledge source: ${label} (ID: ${id})`)
    log(`  Path: ${expanded}`)
    log('')

    // If this is not the first source, just confirm
    if (config.sources.length > 1) {
      log(`Total sources: ${config.sources.length}`)
      log('Building index...')
    } else {
      log('Building initial index...')
    }

    // Build index
    const indexer = new Indexer()
    await indexer.buildIndex()

    const docs = indexer.getDocs()
    log(`✓ Indexed ${docs.length} files from all sources.`)
    log('')
    log('Next: brainbridge serve')
  } catch (err) {
    error(`Failed to connect: ${String(err)}`)
  }
}
