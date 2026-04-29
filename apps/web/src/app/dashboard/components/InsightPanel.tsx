import type { ActiveSourcesMode, WriteMode } from '@buildflow/shared'

import { DashboardCodeText } from './ui/DashboardCodeText'
import { DashboardMetaRow } from './ui/DashboardMetaRow'
import { DashboardPanel } from './ui/DashboardPanel'
import { DashboardSectionHeader } from './ui/DashboardSectionHeader'
import { DashboardStatusDot } from './ui/DashboardStatusDot'

type DashboardSection = 'overview' | 'sources' | 'activity' | 'plan' | 'handoff' | 'settings'

type DashboardActivityEntry = {
  title: string
  detail: string
  tone?: 'neutral' | 'good' | 'warn' | 'bad'
}

type InsightPanelProps = {
  loading: boolean
  error: string | null
  section: DashboardSection
  activeMode: ActiveSourcesMode
  writeMode: WriteMode
  agentConnected: boolean
  activityEntries: DashboardActivityEntry[]
}

const toneClasses: Record<NonNullable<DashboardActivityEntry['tone']>, string> = {
  neutral: 'text-slate-700 dark:text-slate-300',
  good: 'text-emerald-700 dark:text-emerald-300',
  warn: 'text-amber-700 dark:text-amber-300',
  bad: 'text-red-700 dark:text-red-300'
}

const summarizeMode = (mode: ActiveSourcesMode) => {
  switch (mode) {
    case 'single':
      return 'Single source'
    case 'multi':
      return 'Multi-source'
    case 'all':
      return 'All enabled'
  }
}

const summarizeWriteMode = (mode: WriteMode) => {
  switch (mode) {
    case 'readOnly':
      return 'Read only'
    case 'artifactsOnly':
      return 'Artifacts only'
    case 'safeWrites':
      return 'Safe writes'
  }
}

export function InsightPanel({
  loading,
  error,
  section,
  activeMode,
  writeMode,
  agentConnected,
  activityEntries
}: InsightPanelProps) {
  const titleBySection: Record<DashboardSection, string> = {
    overview: 'Inspector',
    sources: 'Sources',
    activity: 'Activity',
    plan: 'Plans',
    handoff: 'Handoff',
    settings: 'Settings'
  }

  const shownActivity = activityEntries.slice(0, 4)
  const primaryActivity = activityEntries[0]

  const contextualBody = (() => {
    switch (section) {
      case 'overview':
        return (
          <div className="space-y-3">
            <DashboardMetaRow label="Next" value="Use Sources or Handoff" className="text-[12px]" />
            <div className="rounded-md border border-bf-border/60 bg-bf-subtle/40 px-3 py-2 dark:border-slate-800/70 dark:bg-slate-950/35">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-bf-muted dark:text-slate-400">Latest</div>
              <div className="mt-1 truncate text-[12px] font-medium text-bf-text dark:text-slate-50">
                {primaryActivity?.title || 'Workspace is ready'}
              </div>
              <div className="mt-0.5 truncate text-[12px] text-bf-muted dark:text-slate-400">
                {primaryActivity?.detail || 'Keep the workspace calm and move straight to the next useful step.'}
              </div>
            </div>
          </div>
        )
      case 'sources':
        return (
          <div className="space-y-3">
            <DashboardMetaRow label="Mode" value={summarizeMode(activeMode)} className="text-[12px]" />
            <DashboardMetaRow label="Write" value={summarizeWriteMode(writeMode)} className="text-[12px]" />
            <div className="rounded-md border border-bf-border/60 bg-bf-subtle/40 px-3 py-2 dark:border-slate-800/70 dark:bg-slate-950/35">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-bf-muted dark:text-slate-400">Source note</div>
              <div className="mt-1 text-[12px] text-bf-muted dark:text-slate-300">
                {loading ? 'Refreshing source state...' : 'Use the list to review and manage individual sources.'}
              </div>
            </div>
          </div>
        )
      case 'activity':
        return (
          <div className="space-y-2">
            {shownActivity.length === 0 ? (
              <div className="rounded-md border border-dashed border-bf-border/70 bg-bf-subtle/40 px-3 py-3 text-[12px] text-bf-muted dark:border-slate-800/70 dark:bg-slate-950/35 dark:text-slate-300">
                BuildFlow activity will appear here.
              </div>
            ) : (
              shownActivity.map((entry, index) => (
                <div key={`${entry.title}-${index}`} className="flex items-start gap-2 rounded-md px-3 py-2 hover:bg-bf-subtle/50 dark:hover:bg-slate-900/40">
                  <DashboardStatusDot tone={entry.tone || 'neutral'} className="mt-1" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[12px] font-medium text-bf-text dark:text-slate-50">{entry.title}</div>
                    <div className={`mt-0.5 truncate text-[12px] ${toneClasses[entry.tone || 'neutral']}`}>{entry.detail}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )
      case 'plan':
        return (
          <div className="space-y-3">
            <DashboardMetaRow label="Plan" value="Not loaded yet" className="text-[12px]" />
            <div className="rounded-md border border-bf-border/60 bg-bf-subtle/40 px-3 py-2 dark:border-slate-800/70 dark:bg-slate-950/35">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-bf-muted dark:text-slate-400">Next</div>
              <div className="mt-1 text-[12px] text-bf-muted dark:text-slate-300">Review sources, then open Handoff for the next execution step.</div>
            </div>
          </div>
        )
      case 'handoff':
        return (
          <div className="space-y-3">
            <DashboardMetaRow label="Codex" value={<DashboardCodeText>Scoped review</DashboardCodeText>} className="text-[12px]" />
            <DashboardMetaRow label="Claude" value={<DashboardCodeText>Long-context orchestration</DashboardCodeText>} className="text-[12px]" />
            <div className="rounded-md border border-bf-border/60 bg-bf-subtle/40 px-3 py-2 dark:border-slate-800/70 dark:bg-slate-950/35">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-bf-muted dark:text-slate-400">Copy tip</div>
              <div className="mt-1 text-[12px] text-bf-muted dark:text-slate-300">Use the compact copy buttons in the main Handoff panel.</div>
            </div>
          </div>
        )
      case 'settings':
        return (
          <div className="space-y-3">
            <DashboardMetaRow label="Agent" value={agentConnected ? 'Connected' : 'Disconnected'} className="text-[12px]" />
            <DashboardMetaRow label="Context" value={summarizeMode(activeMode)} className="text-[12px]" />
            <DashboardMetaRow label="Write" value={summarizeWriteMode(writeMode)} className="text-[12px]" />
          </div>
        )
    }
  })()

  return (
    <aside className="hidden h-full min-h-0 w-full overflow-hidden border-l border-bf-border/70 bg-bf-bg dark:border-slate-800/70 dark:bg-slate-950/90 xl:flex xl:w-[18rem] 2xl:w-[20rem]">
      <div className="flex h-full min-h-0 w-full flex-col">
        <div className="shrink-0 border-b border-bf-border/70 px-4 py-4 dark:border-slate-800/70">
          <DashboardSectionHeader eyebrow={titleBySection[section]} title={section === 'activity' ? 'Recent activity' : 'Current state'} />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4">
          <div className="space-y-3">
            <DashboardPanel variant="flat" className="p-3">
              <div className="space-y-2.5">
                <DashboardMetaRow
                  label="Agent"
                  value={<span className="inline-flex items-center gap-1.5"><DashboardStatusDot tone={agentConnected ? 'good' : 'neutral'} />{agentConnected ? 'Connected' : 'Disconnected'}</span>}
                  className="text-[12px]"
                />
                <DashboardMetaRow label="Context" value={summarizeMode(activeMode)} className="text-[12px]" />
                <DashboardMetaRow label="Write" value={summarizeWriteMode(writeMode)} className="text-[12px]" />
              </div>
            </DashboardPanel>

            {error ? (
              <DashboardPanel variant="flat" className="p-3">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-bf-muted">Source refresh</div>
                <p className="mt-1 min-w-0 break-words text-[13px] leading-5 text-red-700 dark:text-red-200">{error}</p>
              </DashboardPanel>
            ) : null}

            <DashboardPanel variant="flat" className="p-3">
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-bf-muted dark:text-slate-400">
                {section === 'activity' ? 'Timeline' : section === 'sources' ? 'Context' : 'Section'}
              </div>
              <div className="mt-3">{contextualBody}</div>
            </DashboardPanel>
          </div>
        </div>
      </div>
    </aside>
  )
}
