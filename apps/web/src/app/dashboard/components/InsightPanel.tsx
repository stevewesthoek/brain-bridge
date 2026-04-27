import { getAgentHealthClassName, getAgentHealthLabel } from '../helpers'

import type { ActiveSourcesMode, KnowledgeSource, WriteMode } from '@buildflow/shared'

type InsightPanelProps = {
  agentConnected: boolean
  sources: KnowledgeSource[]
  activeMode: ActiveSourcesMode
  writeMode: WriteMode
}

export function InsightPanel({ agentConnected, sources, activeMode, writeMode }: InsightPanelProps) {
  return (
    <div className="w-96 border-l border-slate-200 bg-slate-50 overflow-y-auto">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Dashboard Status</h2>
          <div className="space-y-3">
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Agent Status</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getAgentHealthClassName(agentConnected)}`} />
                  <span className="text-xs font-semibold text-slate-900">{getAgentHealthLabel(agentConnected)}</span>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Total Sources</span>
                <span className="text-base font-semibold text-slate-900">{sources.length}</span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-medium">Enabled</span>
                <span className="text-base font-semibold text-slate-900">{sources.filter(s => s.enabled).length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Context Mode</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-slate-900 capitalize">{activeMode}</div>
          </div>
        </div>

        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Write Access</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-3">
            <div className="text-xs font-semibold text-slate-900">{writeMode}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

