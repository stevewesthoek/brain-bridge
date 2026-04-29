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
    <div className="flex h-full min-h-0 flex-col gap-4 p-5 lg:p-6">
      <section className="shrink-0 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Sources</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">Connected local folders, indexes, and source state.</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
            {sources.length} total
          </div>
        </div>

        <form ref={addSourceFormRef} onSubmit={onAddSourceSubmit} className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Path *</span>
              <input
                value={sourcePath}
                onChange={e => onSourcePathChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
                placeholder="~/notes"
                disabled={mutationLoading}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Label</span>
              <input
                value={sourceLabel}
                onChange={e => onSourceLabelChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
                placeholder="My Notes"
                disabled={mutationLoading}
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">ID</span>
              <input
                value={sourceId}
                onChange={e => onSourceIdChange(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-slate-500"
                placeholder="my-notes"
                disabled={mutationLoading}
              />
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={mutationLoading}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              {mutationLoading ? 'Working...' : 'Add source'}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">Source actions stay inline and use the agent directly.</p>
          </div>
          {mutationError ? (
            <p className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
              Error: {mutationError}
            </p>
          ) : null}
          {mutationNotice ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200">
              {mutationNotice}
            </p>
          ) : null}
        </form>
      </section>

      <section className="min-h-0 flex-1 rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">Source list</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Toggle active sources, enable, reindex, or remove from the overflow menu.</p>
          </div>
          <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-950/50 dark:text-slate-300">
            {sources.filter(source => source.enabled).length} enabled
          </div>
        </div>

        <div className="min-h-0 overflow-y-auto p-4">
          {loading ? (
            <div className="flex items-center justify-center py-14">
              <div className="text-center">
                <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-500 dark:border-slate-700 dark:border-t-slate-400" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">Loading sources...</p>
              </div>
            </div>
          ) : sources.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-950/30">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">No knowledge sources connected yet</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Connect a local folder to start indexing content for ChatGPT.</p>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left font-mono text-xs text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-300">
                buildflow connect &lt;path&gt;
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {sources.map(source => {
                const isActive = activeSourceIds.includes(source.id)
                const actions = [
                  {
                    label: isActive ? 'Deactivate' : 'Activate',
                    disabled: mutationLoading || !source.enabled && !isActive,
                    onClick: () => onToggleActiveSource(source.id)
                  },
                  {
                    label: source.enabled ? 'Disable' : 'Enable',
                    disabled: mutationLoading,
                    onClick: () => onToggleEnabled(source.id, !source.enabled)
                  },
                  {
                    label: source.indexStatus === 'indexing' ? 'Indexing...' : 'Reindex',
                    disabled: mutationLoading || !source.enabled || source.indexStatus === 'indexing',
                    onClick: () => onReindexSource(source)
                  },
                  {
                    label: 'Remove',
                    disabled: mutationLoading,
                    onClick: () => onRemoveSource(source)
                  }
                ]

                return (
                  <article key={source.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/30 dark:hover:border-slate-700 dark:hover:bg-slate-900/60">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{source.label}</h4>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getSourceActiveClassName(isActive)}`}>
                            {isActive ? 'active' : 'inactive'}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{source.path}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                          <span className={`rounded-full px-2 py-1 font-medium ${getSourceEnabledClassName(source.enabled)}`}>{source.enabled ? 'enabled' : 'disabled'}</span>
                          <span className={`rounded-full px-2 py-1 font-medium ${getSourceIndexStatusClassName(source.indexStatus)}`}>{getSourceIndexStatusLabel(source)}</span>
                          <span className="rounded-full border border-slate-200 px-2 py-1 font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400">{source.id}</span>
                        </div>
                      </div>

                      <details className="relative shrink-0">
                        <summary className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800">
                          <span aria-hidden="true" className="text-base leading-none">⋯</span>
                        </summary>
                        <div className="absolute right-0 top-11 z-10 w-44 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
                          {actions.map(action => (
                            <button
                              key={action.label}
                              type="button"
                              disabled={action.disabled}
                              onClick={action.onClick}
                              className="block w-full rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </details>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
