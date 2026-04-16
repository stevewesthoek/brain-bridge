import { loadConfig, saveConfig } from '../agent/config'
import { log, error } from '../utils/logger'

export async function loginCommand(apiKey: string): Promise<void> {
  const config = loadConfig()

  if (!config) {
    error('Please run: brainbridge init')
    return
  }

  if (!apiKey) {
    error('API key required. Use: brainbridge login <api-key>')
    return
  }

  // In MVP, just store the API key
  // In real app, would validate against SaaS
  config.userId = apiKey.slice(0, 10)

  saveConfig(config)

  log('Logged in successfully!')
  log('Next: brainbridge connect <vault-path>')
}
