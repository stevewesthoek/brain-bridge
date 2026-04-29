import type { KnowledgeSource, ActiveSourcesMode, WriteMode } from '@buildflow/shared'

export type DashboardSection = 'overview' | 'sources' | 'activity' | 'plan' | 'handoff' | 'settings'

export type DashboardActivityTone = 'neutral' | 'good' | 'warn' | 'bad'

export type DashboardActivityEvent = {
  id: string
  type: string
  title: string
  detail: string
  timestamp: string
  tone: DashboardActivityTone
}

export type DashboardSourceSnapshot = {
  sources: KnowledgeSource[]
  activeMode: ActiveSourcesMode
  activeSourceIds: string[]
  writeMode: WriteMode
  savedAt: string
}
