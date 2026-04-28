type DashboardSection = 'overview' | 'sources' | 'plan' | 'handoff' | 'settings'

type InsightPanelProps = {
  loading: boolean
  error: string | null
  sourceCount: number
  section: DashboardSection
}

export function InsightPanel({ loading, error, sourceCount, section }: InsightPanelProps) {
  let title = ''
  let items: { label: string; value: string; color?: string }[] = []

  if (section === 'overview') {
    title = 'Local beta path'
    items = error
      ? [
          { label: '1. Sources', value: 'Reconnect the agent', color: 'text-red-600 dark:text-red-400' },
          { label: '2. Plan', value: 'Retry after sources are available' },
          { label: '3. Handoff', value: 'Keep the free GitHub path local-first' }
        ]
      : loading
        ? [
            { label: '1. Sources', value: 'Loading workspace...', color: 'text-blue-600 dark:text-blue-400' },
            { label: '2. Plan', value: 'Open when the agent connects' },
            { label: '3. Handoff', value: 'Copy the prompt when ready' }
        ]
        : sourceCount === 0
          ? [
              { label: '1. Sources', value: 'Add your first source', color: 'text-amber-600 dark:text-amber-400' },
              { label: '2. Plan', value: 'Review readiness after indexing' },
              { label: '3. Handoff', value: 'BuildFlow Local stays on your machine' }
            ]
          : [
              { label: '1. Sources', value: 'Manage sources' },
              { label: '2. Plan', value: 'Review plan or open Handoff' },
              { label: '3. Handoff', value: 'Local-first and free for GitHub users' }
            ]
  } else if (section === 'sources') {
    title = 'Status Meanings'
    items = [
      { label: 'Ready', value: 'Searchable', color: 'text-emerald-600 dark:text-emerald-400' },
      { label: 'Indexing', value: 'Processing', color: 'text-blue-600 dark:text-blue-400' },
      { label: 'Failed', value: 'Reindex needed', color: 'text-red-600 dark:text-red-400' }
    ]
  } else if (section === 'plan') {
    title = 'How It Works'
    items = [
      { label: '1. Create', value: 'In ChatGPT' },
      { label: '2. Track', value: 'Dashboard loads it' },
      { label: '3. Handoff', value: 'Copy & execute' }
    ]
  } else if (section === 'handoff') {
    title = 'Two Paths'
    items = [
      { label: 'Codex CLI', value: 'codex [prompt]', color: 'text-slate-900 dark:text-slate-50' },
      { label: 'Claude Code', value: 'Paste in web/app', color: 'text-slate-900 dark:text-slate-50' }
    ]
  } else if (section === 'settings') {
    title = 'Local Services'
    items = [
      { label: 'Agent', value: ':3052', color: 'text-slate-900 dark:text-slate-50' },
      { label: 'Relay', value: ':3053', color: 'text-slate-900 dark:text-slate-50' },
      { label: 'Web', value: ':3054', color: 'text-slate-900 dark:text-slate-50' }
    ]
  }

  return (
    <div className="w-96 border-l border-slate-200 bg-slate-50 overflow-y-auto dark:border-slate-800 dark:bg-slate-950">
      <div className="p-5 space-y-3">
        <h2 className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.22em] dark:text-slate-400">{title}</h2>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900/70">
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{item.label}</div>
                <div className={`mt-1 text-sm font-medium leading-6 ${item.color || 'text-slate-900 dark:text-slate-50'}`}>
                  {item.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
