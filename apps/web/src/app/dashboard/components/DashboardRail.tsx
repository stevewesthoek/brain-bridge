import type { KnowledgeSource } from '@buildflow/shared'
import { getSourceIndexStatusLabel } from '../helpers'

const IconOverview = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
    <path d="M2.5 3.5h4.25v4.25H2.5zM9.25 3.5h4.25v2.5H9.25zM9.25 7.75h4.25V12H9.25zM2.5 9.25h4.25V12H2.5z" fill="currentColor" />
  </svg>
)

const IconSources = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
    <path d="M2.5 4.25A1.75 1.75 0 0 1 4.25 2.5h7.5A1.75 1.75 0 0 1 13.5 4.25v7.5a1.75 1.75 0 0 1-1.75 1.75h-7.5A1.75 1.75 0 0 1 2.5 11.75z" fill="currentColor" opacity="0.18" />
    <path d="M4.5 5.5h7M4.5 8h4.5M4.5 10.5h5.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
  </svg>
)

const IconActivity = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
    <path d="M2.5 8h2l1.2-3.2 2 6 1.6-3.8H13.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
  </svg>
)

const IconPlan = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
    <path d="M3 3.5h10v9H3z" fill="currentColor" opacity="0.18" />
    <path d="M5 6h6M5 8.5h6M5 11h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.2" />
  </svg>
)

const IconHandoff = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
    <path d="M3 4.25h10M3 8h6M3 11.75h10" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
    <path d="M10.5 6.25 13 8l-2.5 1.75" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
  </svg>
)

const IconSettings = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
    <path d="M8 5.4A2.6 2.6 0 1 0 8 10.6 2.6 2.6 0 0 0 8 5.4Zm4.6 2.6-.82.47.03.77.79.46-.86 1.48-.89-.31-.54.54.27.9-1.48.86-.46-.79-.77-.03-.47.82h-1.7l-.47-.82-.77.03-.46.79-1.48-.86.27-.9-.54-.54-.89.31-.86-1.48.79-.46.03-.77L3.4 8l.47-.82-.03-.77-.79-.46.86-1.48.89.31.54-.54-.27-.9 1.48-.86.46.79.77.03.47-.82h1.7l.47.82.77-.03.46-.79 1.48.86-.27.9.54.54.89-.31.86 1.48-.79.46-.03.77.82.47v1.7Z" fill="currentColor" />
  </svg>
)

type DashboardSection = 'overview' | 'sources' | 'activity' | 'plan' | 'handoff' | 'settings'

type DashboardRailProps = {
  activeSection: DashboardSection
  sources: KnowledgeSource[]
  onSelectSection: (section: DashboardSection) => void
}

const NAV_ITEMS: { id: DashboardSection; label: string; icon: () => JSX.Element }[] = [
  { id: 'overview', label: 'Overview', icon: IconOverview },
  { id: 'sources', label: 'Sources', icon: IconSources },
  { id: 'activity', label: 'Activity', icon: IconActivity },
  { id: 'plan', label: 'Plans', icon: IconPlan },
  { id: 'handoff', label: 'Handoff', icon: IconHandoff },
  { id: 'settings', label: 'Settings', icon: IconSettings }
]

export function DashboardRail({
  activeSection,
  sources,
  onSelectSection
}: DashboardRailProps) {
  const shownSources = sources.slice(0, 5)

  return (
    <aside className="flex h-full min-h-0 flex-col border-r border-slate-200 bg-slate-50/95 dark:border-slate-800 dark:bg-slate-950/80">
      <div className="shrink-0 border-b border-slate-200 px-3 py-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-[11px] font-semibold text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
            BF
          </div>
          <div className="min-w-0">
            <div className="text-sm font-medium text-slate-900 dark:text-slate-50">BuildFlow Local</div>
          </div>
        </div>
      </div>

      <nav className="shrink-0 px-2.5 py-2.5">
        <div className="space-y-1">
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left transition-colors ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-50'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900/70'
                }`}
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-500'}`}>
                  <item.icon />
                </span>
                <span className="min-w-0 truncate text-sm font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="min-h-0 flex-1 px-2.5 pb-2.5">
        <div className="flex h-full min-h-0 flex-col">
          <div className="shrink-0 px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">Sources</div>
          <div className="min-h-0 flex-1 overflow-y-auto px-0.5">
            {shownSources.length === 0 ? (
              <div className="rounded-md border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
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
                    <span className="shrink-0 text-[10px] font-medium text-slate-500 dark:text-slate-400">{getSourceIndexStatusLabel(source)}</span>
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
