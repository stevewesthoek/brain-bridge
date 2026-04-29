import { loadConfig, getLocalPort } from '../agent/config'
import { startLocalServer } from '../agent/server'
import { BridgeClient } from '../agent/bridge-client'
import { log, error } from '../utils/logger'

export async function serveCommand(): Promise<void> {
  const config = loadConfig()

  if (!config) {
    error('BuildFlow not initialized. Run: buildflow init')
    return
  }

  if (!config.vaultPath) {
    error('No vault connected. Run: buildflow connect <path-to-vault>')
    return
  }

  try {
    // Start local HTTP server
    log('Starting local agent server...')
    const port = getLocalPort()
    startLocalServer(port)

    // Connect to bridge relay if configured
    const bridgeUrl = process.env.BRIDGE_URL
    const deviceToken = process.env.DEVICE_TOKEN || config.deviceToken

    if (bridgeUrl && deviceToken) {
      log('Connecting to bridge relay...')
      const bridgeClient = new BridgeClient(bridgeUrl, deviceToken)

      try {
        await bridgeClient.connect()
        log('Connected to bridge relay')
      } catch (err) {
        log(`Note: Could not connect to bridge relay (${String(err)})`)
        log('Local agent will still work for local testing.')
      }
    } else if (config.deviceToken) {
      log('Connecting to bridge relay...')
      const bridgeClient = new BridgeClient(config.apiBaseUrl, config.deviceToken)

      try {
        await bridgeClient.connect()
      } catch (err) {
        log(`Note: Could not connect to bridge relay (${String(err)})`)
        log('Local agent will still work for local testing.')
      }
    } else {
      log('No bridge configured. Local agent running in standalone mode.')
    }

    log('')
    log('BuildFlow agent is running!')
    log(`Local server: http://127.0.0.1:${port}`)
    log('Press Ctrl+C to stop.')

    // Keep process alive
    await new Promise(() => {})
  } catch (err) {
    error(`Failed to start server: ${String(err)}`)
  }
}
