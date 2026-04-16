import { loadConfig, getVaultPath } from '../agent/config'
import { Indexer } from '../agent/indexer'
import { log, error } from '../utils/logger'
import fs from 'fs'

export async function statusCommand(): Promise<void> {
  const config = loadConfig()

  if (!config) {
    error('Brain Bridge not initialized. Run: brainbridge init')
    return
  }

  log('Brain Bridge Status')
  log('==================')
  log('')

  if (config.vaultPath) {
    try {
      const vaultPath = getVaultPath()
      log(`Vault: ${vaultPath}`)

      const indexer = new Indexer()
      const docs = indexer.getDocs()
      log(`Indexed files: ${docs.length}`)
    } catch (err) {
      log(`Vault: Not connected`)
    }
  } else {
    log('Vault: Not connected')
  }

  log(`API Base: ${config.apiBaseUrl}`)
  log(`Device Token: ${config.deviceToken ? 'Configured' : 'Not configured'}`)
  log('')
  log('Next steps:')
  if (!config.vaultPath) {
    log('- Run: brainbridge connect <path>')
  }
  if (!config.deviceToken) {
    log('- Run: brainbridge login <api-key>')
  }
  log('- Run: brainbridge serve')
}
