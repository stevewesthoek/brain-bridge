import {
  getActiveContextLabel,
  getAgentHealthClassName,
  getAgentHealthLabel,
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
  agentConnected: boolean
  activeMode: ActiveSourcesMode
  writeMode: WriteMode
  onManageSources: () => void
  onAddSource: () => void
}

export function DashboardOverview({
  loading,
  sources,
  agentConnected,
  activeMode,
  writeMode,
  onManageSources,
  onAddSource
}: DashboardOverviewProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900 mb-6">Dashboard Overview</h2>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block mb-3">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Loading sources...</p>
            <p className="text-xs text-slate-500 mt-1">Connecting to agent on port 3052</p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-600 mb-2">Agent Status</div>
              <div className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${getAgentHealthClassName(agentConnected)}`} />
                <div className="text-sm font-semibold text-slate-900">{getAgentHealthLabel(agentConnected)}</div>
              </div>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-600 mb-2">Total Sources</div>
              <div className="text-2xl font-bold text-slate-900">{sources.length}</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-600 mb-2">Enabled</div>
              <div className="text-2xl font-bold text-slate-900">{sources.filter(s => s.enabled).length}</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-600 mb-2">Disabled</div>
              <div className="text-2xl font-bold text-slate-900">{getDisabledSourceCount(sources)}</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-600 mb-2">Ready</div>
              <div className="text-2xl font-bold text-emerald-600">{getReadySourceCount(sources)}</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-600 mb-2">Indexing</div>
              <div className="text-2xl font-bold text-blue-600">{getIndexingSourceCount(sources)}</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-600 mb-2">Failed</div>
              <div className="text-2xl font-bold text-red-600">{getFailedSourceCount(sources)}</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-600 mb-2">Context Mode</div>
              <div className="text-sm font-semibold text-slate-900">{getActiveContextLabel(activeMode)}</div>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <div className="text-xs font-medium text-slate-600 mb-2">Write Access</div>
              <div className="text-sm font-semibold text-slate-900">{getWriteModeLabel(writeMode)}</div>
            </div>
          </div>

          <div className="mt-6 flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onManageSources}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Manage Sources
            </button>
            <button
              type="button"
              onClick={onAddSource}
              className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 transition-colors"
            >
              Add Source
            </button>
          </div>
        </>
      )}
    </div>
  )
}

