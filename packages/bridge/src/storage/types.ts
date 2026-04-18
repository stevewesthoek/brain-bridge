// Persistent record types for relay storage

export interface PersistedDevice {
  deviceId: string
  tokenHash: string
  createdAt: string
  lastSeenAt: string
  connectedAt?: string
  version: number
}

export interface TokenRecord {
  tokenId: string
  tokenHash: string
  description: string
  deviceId: string
  createdAt: string
  active: boolean
  version: number
}

export interface RequestRecord {
  requestId: string
  deviceId: string
  command: string
  status: 'pending' | 'success' | 'error' | 'timeout'
  createdAt: string
  completedAt?: string
  duration?: number
  error?: string
  version: number
}

export interface SessionRecord {
  sessionId: string
  deviceId: string
  status: 'open' | 'active' | 'closed'
  createdAt: string
  closedAt?: string
  lastActivityAt: string
  commandCount: number
  requestIds: string[]
  metadata: {
    purpose?: string
    createdBy?: string
  }
  version: number
}
