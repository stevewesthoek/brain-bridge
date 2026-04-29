type DashboardActivityEntry = {
  title: string
  detail: string
  tone?: 'neutral' | 'good' | 'warn' | 'bad'
}

type DashboardActivityFeedProps = {
  entries: DashboardActivityEntry[]
  emptyMessage: string
}

const TONE_CLASSES: Record<NonNullable<DashboardActivityEntry['tone']>, string> = {
  neutral: 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300',
  good: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-200',
  warn: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200',
  bad: 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-200'
}

export function DashboardActivityFeed({ entries, emptyMessage }: DashboardActivityFeedProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-800">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Activity</div>
        <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-50">Recent BuildFlow events</h3>
      </div>
      <div className="max-h-[calc(100vh-16rem)] overflow-y-auto px-4 py-4">
        {entries.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div key={`${entry.title}-${index}`} className={`rounded-2xl border px-4 py-3 ${TONE_CLASSES[entry.tone || 'neutral']}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{entry.title}</div>
                    <div className="mt-1 text-xs leading-5 opacity-90">{entry.detail}</div>
                  </div>
                  <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-current opacity-70" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
