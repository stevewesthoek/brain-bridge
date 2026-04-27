import type { FormEvent, RefObject } from 'react'
import type { KnowledgeSource } from '@buildflow/shared'
import {
  getSourceActiveClassName,
  getSourceEnabledClassName,
  getSourceIndexStatusClassName,
  getSourceIndexStatusLabel
} from '../helpers'

type KnowledgeSourcesPanelProps = {
  sources: KnowledgeSource[]
  loading: boolean
  mutationLoading: boolean
  mutationError: string | null
  mutationNotice: string | null
  sourcePath: string
  sourceLabel: string
  sourceId: string
  activeSourceIds: string[]
  onAddSourceSubmit: (event: FormEvent<HTMLFormElement>) => void
  onSourcePathChange: (value: string) => void
  onSourceLabelChange: (value: string) => void
  onSourceIdChange: (value: string) => void
  onToggleActiveSource: (sourceId: string) => void
  onToggleEnabled: (sourceId: string, nextEnabled: boolean) => void
  onReindexSource: (source: KnowledgeSource) => void
  onRemoveSource: (source: KnowledgeSource) => void
  addSourceFormRef: RefObject<HTMLFormElement>
}

export function KnowledgeSourcesPanel({
  sources,
  loading,
  mutationLoading,
  mutationError,
  mutationNotice,
  sourcePath,
  sourceLabel,
  sourceId,
  activeSourceIds,
  onAddSourceSubmit,
  onSourcePathChange,
  onSourceLabelChange,
  onSourceIdChange,
  onToggleActiveSource,
  onToggleEnabled,
  onReindexSource,
  onRemoveSource,
  addSourceFormRef
}: KnowledgeSourcesPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900 mb-1">Knowledge Sources</h2>
      <p className="text-slate-600 text-sm mb-6">Configured knowledge sources that are searched and read together through ChatGPT.</p>

      <form
        ref={addSourceFormRef}
        onSubmit={onAddSourceSubmit}
        className="border border-slate-200 rounded-lg p-4 mb-6 space-y-4 bg-slate-50"
      >
        <div>
          <h3 className="font-semibold text-slate-900 mb-3 text-sm">Add Knowledge Source</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-2">Path *</span>
              <input
                value={sourcePath}
                onChange={e => onSourcePathChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                placeholder="~/notes"
                disabled={mutationLoading}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-2">Label</span>
              <input
                value={sourceLabel}
                onChange={e => onSourceLabelChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                placeholder="My Notes"
                disabled={mutationLoading}
              />
            </label>
            <label className="block">
              <span className="block text-xs font-medium text-slate-700 mb-2">ID</span>
              <input
                value={sourceId}
                onChange={e => onSourceIdChange(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                placeholder="my-notes"
                disabled={mutationLoading}
              />
            </label>
          </div>
        </div>
        <button
          type="submit"
          disabled={mutationLoading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-slate-800 transition-colors"
        >
          {mutationLoading ? 'Working...' : 'Add source'}
        </button>
        {mutationError ? (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-xs text-red-700 font-medium">Error: {mutationError}</p>
          </div>
        ) : null}
        {mutationNotice ? (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <p className="text-xs text-emerald-700 font-medium">{mutationNotice}</p>
          </div>
        ) : null}
      </form>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block mb-3">
              <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-400 rounded-full animate-spin" />
            </div>
            <p className="text-sm text-slate-600 font-medium">Loading sources...</p>
          </div>
        </div>
      ) : sources.length === 0 ? (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-900">No knowledge sources connected yet</p>
            <p className="text-sm text-slate-600 mt-2">Connect a local folder to get started with BuildFlow.</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 my-4 border border-slate-200">
            <p className="text-xs text-slate-700 font-mono">buildflow connect &lt;path&gt;</p>
            <p className="text-xs text-slate-600 mt-2">
              Example: <code className="bg-slate-100 px-1 rounded">buildflow connect ~/my-vault</code>
            </p>
          </div>
          <p className="text-xs text-slate-600">After connecting, sources will appear here and can be searched through ChatGPT.</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {sources.map(source => (
            <div key={source.id} className="border border-slate-200 rounded-lg p-4 flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors bg-white">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 text-sm">{source.label}</div>
                <div className="text-xs text-slate-600 font-mono truncate mt-1">{source.path}</div>
                <div className="text-xs text-slate-500 mt-2">ID: {source.id}</div>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getSourceEnabledClassName(source.enabled)}`}>
                  {source.enabled ? 'Enabled' : 'Disabled'}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getSourceIndexStatusClassName(source.indexStatus)}`}>
                  {getSourceIndexStatusLabel(source)}
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${getSourceActiveClassName(activeSourceIds.includes(source.id))}`}>
                  {activeSourceIds.includes(source.id) ? 'Active' : 'Inactive'}
                </div>
                <div className="flex gap-1 flex-wrap justify-end mt-1">
                  <button
                    type="button"
                    disabled={mutationLoading || !source.enabled}
                    onClick={() => onToggleActiveSource(source.id)}
                    className={`rounded border px-2 py-1 text-xs font-medium transition-colors ${
                      mutationLoading || !source.enabled
                        ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Toggle Active
                  </button>
                  <button
                    type="button"
                    disabled={mutationLoading}
                    onClick={() => onToggleEnabled(source.id, !source.enabled)}
                    className={`rounded border px-2 py-1 text-xs font-medium transition-colors ${
                      mutationLoading ? 'border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {source.enabled ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    disabled={mutationLoading || !source.enabled || source.indexStatus === 'indexing'}
                    onClick={() => onReindexSource(source)}
                    className={`rounded border px-2 py-1 text-xs font-medium transition-colors ${
                      mutationLoading || !source.enabled || source.indexStatus === 'indexing'
                        ? 'border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {source.indexStatus === 'indexing' ? 'Indexing...' : 'Reindex'}
                  </button>
                  <button
                    type="button"
                    disabled={mutationLoading}
                    onClick={() => onRemoveSource(source)}
                    className={`rounded border px-2 py-1 text-xs font-medium transition-colors ${
                      mutationLoading ? 'border-slate-200 text-slate-400 cursor-not-allowed' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
