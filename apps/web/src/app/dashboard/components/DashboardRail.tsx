import type { KnowledgeSource } from '@buildflow/shared'
import { getSourceIndexStatusLabel } from '../helpers'

type DashboardSection = 'overview' | 'sources' | 'activity' | 'plan' | 'handoff' | 'settings'

type DashboardRailProps = {
  activeSection: DashboardSection
  sources: KnowledgeSource[]
  onSelectSection: (section: DashboardSection) => void
}

const NAV_ITEMS: { id: DashboardSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'sources', label: 'Sources' },
  { id: 'activity', label: 'Activity' },
  { id: 'plan', label: 'Plans' },
  { id: 'handoff', label: 'Handoff' },
  { id: 'settings', label: 'Settings' }
]

export function DashboardRail({
  activeSection,
  sources,
  onSelectSection
}: DashboardRailProps) {
  const indexingCount = sources.filter(source => source.enabled && source.indexStatus === 'indexing').length
  const failedCount = sources.filter(source => source.enabled && source.indexStatus === 'failed').length
  const shownSources = sources.slice(0, 5)

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="shrink-0 border-b border-slate-200 px-4 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
            BF
          </div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">BuildFlow Local</div>
          </div>
        </div>
      </div>

      <nav className="shrink-0 px-3 py-3">
        <div className="space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                aria-current={isActive ? 'page' : undefined}
              className={`group flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                  isActive
                    ? 'bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-50'
                    : 'text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-900/70'
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isActive ? 'bg-slate-900 dark:bg-slate-100' : 'bg-transparent'}`} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{item.label}</div>
                </div>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="min-h-0 flex-1 px-3 pb-3">
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Sources</div>
          <div className="min-h-0 flex-1 overflow-y-auto px-1">
            {shownSources.length === 0 ? (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
                No sources yet. Add a local folder in Sources.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {shownSources.map(source => (
                  <div key={source.id} className="flex items-center gap-2 py-2">
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${source.enabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-slate-900 dark:text-slate-50">{source.label}</div>
                    </div>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {getSourceIndexStatusLabel(source)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
