import { loadConfig, saveConfig } from '../agent/config'
import { log, error } from '../utils/logger'

export async function loginCommand(apiKey: string): Promise<void> {
  const config = loadConfig()

  if (!config) {
    error('Please run: buildflow init')
    return
  }

  if (!apiKey) {
    error('API key required. Use: buildflow login <api-key>')
    return
  }

  // In MVP, just store the API key
  // In a future hosted flow, this would validate against the remote service
  config.userId = apiKey.slice(0, 10)

  saveConfig(config)

  log('Logged in successfully!')
  log('Next: buildflow connect <vault-path>')
}
