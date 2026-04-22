import { addSource, loadConfig, getSources } from '../agent/config'
import { log, error } from '../utils/logger'
import { Indexer } from '../agent/indexer'

export async function connectCommand(vaultPath: string, sourceId?: string, sourceLabel?: string): Promise<void> {
  const config = loadConfig()

  if (!config) {
    error('Please run: buildflow init')
    return
  }

  if (!vaultPath) {
    error('Vault path required. Use: buildflow connect <path> [source-id] [source-label]')
    return
  }

  try {
    const sources = addSource(vaultPath, sourceLabel, sourceId)
    const newSource = sources[sources.length - 1]

    log(`✓ Connected knowledge source: ${newSource.label} (ID: ${newSource.id})`)
    log(`  Path: ${newSource.path}`)
    log('')

    if (sources.length > 1) {
      log(`Total sources: ${sources.length}`)
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
    log('Next: buildflow serve')
  } catch (err) {
    error(`Failed to connect: ${String(err)}`)
  }
}
