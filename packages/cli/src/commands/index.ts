import { Indexer } from '../agent/indexer'
import { log, error } from '../utils/logger'
import { loadConfig } from '../agent/config'

export async function indexCommand(): Promise<void> {
  const config = loadConfig()

  if (!config?.vaultPath) {
    error('No vault connected. Run: buildflow connect <path>')
    return
  }

  try {
    log('Rebuilding index...')
    const indexer = new Indexer()
    await indexer.buildIndex()

    const docs = indexer.getDocs()
    log(`Indexed ${docs.length} files.`)
  } catch (err) {
    error(`Failed to index: ${String(err)}`)
  }
}
