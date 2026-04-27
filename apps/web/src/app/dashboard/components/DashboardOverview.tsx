import {
  getActiveContextLabel,
  getDisabledSourceCount,
  getFailedSourceCount,
  getIndexingSourceCount,
  getReadySourceCount,
  getWriteModeLabel
} from '../helpers'
import type { ActiveSourcesMode, KnowledgeSource, WriteMode } from '@buildflow/shared'

type DashboardOverviewProps = {
  loading: boolean
  sources: KnowledgeSource[]
  activeMode: ActiveSourcesMode
  writeMode: WriteMode
  onManageSources: () => void
  onAddSource: () => void
}

export function DashboardOverview({
  loading,
  sources,
  activeMode,
  writeMode,
  onManageSources,
  onAddSource
}: DashboardOverviewProps) {
  const enabledCount = sources.filter(s => s.enabled).length
  const readyCount = getReadySourceCount(sources)
  const failedCount = getFailedSourceCount(sources)
  const indexingCount = getIndexingSourceCount(sources)

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="bg-white rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-900/70 p-12">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block mb-3">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin dark:border-slate-700 dark:border-t-slate-400" />
              </div>
              <p className="text-sm text-slate-600 font-medium dark:text-slate-300">Loading sources...</p>
              <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">Connecting to agent on port 3052</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Status Row: At-a-glance stack health */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-xs uppercase font-semibold text-slate-500 tracking-wide mb-2 dark:text-slate-400">Stack status</h3>
                <div className="flex items-baseline gap-4">
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-slate-50">{readyCount}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">ready sources</div>
                  </div>
                  {indexingCount > 0 && (
                    <div>
                      <div className="text-lg font-semibold text-blue-600 dark:text-blue-400">{indexingCount}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">indexing</div>
                    </div>
                  )}
                  {failedCount > 0 && (
                    <div>
                      <div className="text-lg font-semibold text-red-600 dark:text-red-400">{failedCount}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">failed</div>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-l border-slate-200 dark:border-slate-800 pl-6 text-right">
                <div className="text-xs uppercase font-semibold text-slate-500 tracking-wide mb-1 dark:text-slate-400">Mode</div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">{getActiveContextLabel(activeMode)}</div>
                <div className="text-xs text-slate-600 mt-1 dark:text-slate-400">{getWriteModeLabel(writeMode)}</div>
              </div>
            </div>
          </div>

          {/* Source Summary: Compact table */}
          <div className="bg-white rounded-lg border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <h3 className="text-xs uppercase font-semibold text-slate-500 tracking-wide mb-3 dark:text-slate-400">Sources</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-600 dark:text-slate-400">Total</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">{sources.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                <span className="text-slate-600 dark:text-slate-400">Enabled</span>
                <span className="font-semibold text-slate-900 dark:text-slate-50">{enabledCount}</span>
              </div>
              {enabledCount === 0 && sources.length > 0 && (
                <div className="mt-3 p-2 rounded bg-amber-50 border border-amber-200 dark:border-amber-900 dark:bg-amber-950/20">
                  <p className="text-xs text-amber-800 dark:text-amber-200">No sources enabled. Enable sources to search.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onManageSources}
              className="flex-1 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 transition-colors dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Manage Sources
            </button>
            <button
              type="button"
              onClick={onAddSource}
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              Add Source
            </button>
          </div>
        </>
      )}
    </div>
  )
}
