import {
  getActiveContextLabel,
  getAgentHealthClassName,
  getAgentHealthLabel,
  getFailedSourceCount,
  getIndexingSourceCount,
  getReadySourceCount,
  getWriteModeLabel
} from '../helpers'
import type { ActiveSourcesMode, KnowledgeSource, WriteMode } from '@buildflow/shared'

type DashboardOverviewProps = {
  loading: boolean
  agentConnected: boolean
  sources: KnowledgeSource[]
  activeMode: ActiveSourcesMode
  writeMode: WriteMode
  onManageSources: () => void
  onAddSource: () => void
  onOpenHandoff: () => void
}

export function DashboardOverview({
  loading,
  agentConnected,
  sources,
  activeMode,
  writeMode,
  onManageSources,
  onAddSource,
  onOpenHandoff
}: DashboardOverviewProps) {
  const enabledCount = sources.filter(s => s.enabled).length
  const readyCount = getReadySourceCount(sources)
  const failedCount = getFailedSourceCount(sources)
  const indexingCount = getIndexingSourceCount(sources)
  const sourceCountLabel = sources.length === 1 ? '1 source' : `${sources.length} sources`
  const enabledCountLabel = enabledCount === 1 ? '1 enabled' : `${enabledCount} enabled`
  const activeModeLabel = getActiveContextLabel(activeMode)
  const writeModeLabel = getWriteModeLabel(writeMode)
  const nextAction =
    sources.length === 0
      ? 'Add your first source'
      : readyCount > 0
        ? 'Open Handoff'
        : 'Review readiness'

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
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
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 px-6 py-6 text-white shadow-sm dark:border-slate-800">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-300">
            <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5">BuildFlow Local</span>
            <span className="text-slate-400">Public GitHub beta</span>
          </div>

          <div className="mt-3 space-y-2">
            <h2 className="max-w-3xl text-[1.8rem] font-semibold tracking-tight text-white sm:text-[2rem] leading-[1.08]">
              Turn local notes into a ready-to-run execution packet.
            </h2>
            <p className="max-w-3xl text-sm leading-6 text-slate-300 sm:text-[15px]">
              BuildFlow Local stays on the user&apos;s machine. Connect sources, check readiness, and move directly into plan or handoff when the workspace is ready.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-200">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
              <span className={`h-2 w-2 rounded-full ${getAgentHealthClassName(agentConnected)}`} />
              {getAgentHealthLabel(agentConnected)}
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">{readyCount} ready sources</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">
              {sources.length} total / {enabledCount} enabled
            </span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">{activeModeLabel}</span>
            <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5">{writeModeLabel}</span>
            {(indexingCount > 0 || failedCount > 0) && (
              <span className="rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-amber-100">
                {indexingCount > 0 ? `${indexingCount} indexing` : `${failedCount} failed`}
              </span>
            )}
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-slate-100 font-medium">
                  {sources.length === 0
                    ? 'Add your first source to make the dashboard actionable.'
                    : readyCount > 0
                      ? 'Ready sources are indexed and available to ChatGPT.'
                      : 'Enable and index a source to make it ready.'}
                </p>
                <p className="mt-1 text-slate-300">
                  {sourceCountLabel} · {enabledCountLabel} · {indexingCount > 0 ? `${indexingCount} indexing` : 'No indexing'} · {failedCount > 0 ? `${failedCount} failed` : 'No failures'}
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-200">
                {readyCount} ready
              </span>
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onManageSources}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 transition-colors hover:bg-white"
            >
              Manage Sources
            </button>
            <button
              type="button"
              onClick={onAddSource}
              className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Add Source
            </button>
            <button
              type="button"
              onClick={onOpenHandoff}
              className="flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Open Handoff
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-slate-700/70 bg-slate-950/30 px-4 py-3 text-sm text-slate-200">
            <span className="font-medium text-slate-100">Next:</span> {nextAction}. Keep BuildFlow Local on the machine for the free GitHub beta path.
          </div>

          {(indexingCount > 0 || failedCount > 0) && (
            <div className="mt-3 rounded-xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-50">
              {indexingCount > 0 && <span>{indexingCount} source{indexingCount === 1 ? '' : 's'} indexing. </span>}
              {failedCount > 0 && <span>{failedCount} source{failedCount === 1 ? '' : 's'} failed. </span>}
              Review sources before presenting the dashboard in screenshots or handoffs.
            </div>
          )}
        </section>
      )}
    </div>
  )
}
