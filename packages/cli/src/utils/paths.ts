import path from 'path'
import os from 'os'

export function expandTilde(filePath: string): string {
  if (filePath.startsWith('~')) {
    return path.join(os.homedir(), filePath.slice(1))
  }
  return filePath
}

export function getConfigDir(): string {
  return expandTilde('~/.brainbridge')
}

export function getConfigPath(): string {
  return path.join(getConfigDir(), 'config.json')
}

export function getAuditLogPath(): string {
  return path.join(getConfigDir(), 'audit.log')
}

export function getIndexPath(): string {
  return path.join(getConfigDir(), 'index.json')
}
