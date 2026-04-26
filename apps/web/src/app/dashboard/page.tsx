'use client'

import { useState, useEffect, useRef } from 'react'
import type { FormEvent } from 'react'
import type { KnowledgeSource, WriteMode, ActiveSourcesMode } from '@buildflow/shared'
import {
  getAgentHealthLabel,
  getAgentHealthClassName,
  getSourceEnabledClassName,
  getSourceIndexStatusClassName,
  getSourceIndexStatusLabel,
  getSourceActiveClassName,
  getDisabledSourceCount,
  getReadySourceCount,
  getIndexingSourceCount,
  getFailedSourceCount,
  getActiveContextLabel,
  getWriteModeLabel
} from './helpers'

const TERMINAL_INDEX_STATUSES = new Set(['ready', 'failed', 'disabled'])

export default function Dashboard() {
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agentConnected, setAgentConnected] = useState(false)
  const [sourcePath, setSourcePath] = useState('')
  const [sourceLabel, setSourceLabel] = useState('')
  const [sourceId, setSourceId] = useState('')
  const [mutationLoading, setMutationLoading] = useState(false)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [mutationNotice, setMutationNotice] = useState<string | null>(null)
  const [loadErrorDetail, setLoadErrorDetail] = useState<string | null>(null)
  const [activeMode, setActiveMode] = useState<ActiveSourcesMode>('all')
  const [activeSourceIds, setActiveSourceIds] = useState<string[]>([])
  const [writeMode, setWriteMode] = useState<WriteMode>('safeWrites')

  const knowledgeSourcesRef = useRef<HTMLDivElement>(null)
  const addSourceFormRef = useRef<HTMLFormElement>(null)

  const fetchSources = async () => {
    let fetchedSources: KnowledgeSource[] = sources
    let fetchedActiveMode: ActiveSourcesMode = activeMode
    let fetchedActiveIds: string[] = activeSourceIds
    let fetchedWriteMode: WriteMode = writeMode
    try {
      setError(null)
      setLoadErrorDetail(null)
      const response = await fetch('/api/agent/sources', { cache: 'no-store' })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const detail = data?.details ? ` ${data.details}` : data?.detail ? ` ${data.detail}` : ''
        throw new Error(`${data?.error || `Failed to fetch sources: ${response.status}`}${detail}`.trim())
      }

      fetchedSources = data.sources || []
      setSources(fetchedSources)
      setAgentConnected(true)
      const activeResponse = await fetch('/api/agent/active-sources', { cache: 'no-store' })
      const activeData = await activeResponse.json().catch(() => ({}))
      if (!activeResponse.ok) {
        const detail = activeData?.details ? ` ${activeData.details}` : activeData?.detail ? ` ${activeData.detail}` : ''
        setLoadErrorDetail(`${activeData?.error || `Failed to fetch active sources: ${activeResponse.status}`}${detail}`.trim())
        setActiveMode('all')
        setActiveSourceIds([])
      } else {
        fetchedActiveMode = activeData.mode || 'all'
        fetchedActiveIds = activeData.activeSourceIds || []
        setActiveMode(fetchedActiveMode)
        setActiveSourceIds(fetchedActiveIds)
      }
      const writeResponse = await fetch('/api/agent/write-mode', { cache: 'no-store' })
      const writeData = await writeResponse.json().catch(() => ({}))
      if (!writeResponse.ok) {
        const detail = writeData?.details ? ` ${writeData.details}` : writeData?.detail ? ` ${writeData.detail}` : ''
        setLoadErrorDetail(`${writeData?.error || `Failed to fetch write mode: ${writeResponse.status}`}${detail}`.trim())
        fetchedWriteMode = 'safeWrites'
        setWriteMode(fetchedWriteMode)
      } else {
        fetchedWriteMode = writeData.writeMode || 'safeWrites'
        setWriteMode(fetchedWriteMode)
      }
      setAgentConnected(true)
    } catch (err) {
      setLoadErrorDetail(String(err))
      setError('Unable to load sources')
      if (fetchedSources.length > 0) {
        setSources(fetchedSources)
      }
      setActiveMode(fetchedActiveMode)
      setActiveSourceIds(fetchedActiveIds)
      setWriteMode(fetchedWriteMode)
      setAgentConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const toggleActiveSource = async (sourceId: string) => {
    const next = activeSourceIds.includes(sourceId)
      ? activeSourceIds.filter(id => id !== sourceId)
      : [...activeSourceIds, sourceId]
    await mutateSources('/api/agent/active-sources', { mode: next.length > 1 ? 'multi' : 'single', activeSourceIds: next })
  }

  useEffect(() => {
    fetchSources()
  }, [])

  const mutateSources = async (url: string, payload: Record<string, unknown>) => {
    setMutationLoading(true)
    setMutationError(null)
    setMutationNotice(null)

    try {
      const response = await fetch(url, {
        cache: 'no-store',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        const details = data?.details ? ` ${data.details}` : ''
        throw new Error(`${data?.error || `Request failed: ${response.status}`}${details}`.trim())
      }

      await fetchSources()
      return true
    } catch (err) {
      setMutationError(String(err))
      if (url === '/api/agent/sources/toggle' || url === '/api/agent/sources/reindex' || url === '/api/agent/sources/add' || url === '/api/agent/sources/remove' || url === '/api/agent/active-sources' || url === '/api/agent/write-mode') {
        await fetchSources().catch(() => {})
      }
      return false
    } finally {
      setMutationLoading(false)
    }
  }

  const waitForTerminalIndexStatus = async (sourceId: string, timeoutMs = 60000) => {
    const startedAt = Date.now()

    while (Date.now() - startedAt < timeoutMs) {
      const response = await fetch('/api/agent/sources', { cache: 'no-store' })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(`${data?.error || `Failed to refresh sources: ${response.status}`}`)
      }

      const nextSources: KnowledgeSource[] = data.sources || []
      setSources(nextSources)

      const current = nextSources.find(source => source.id === sourceId)
      if (!current) {
        throw new Error(`Source not found after reindex: ${sourceId}`)
      }

      if (TERMINAL_INDEX_STATUSES.has(current.indexStatus || 'unknown')) {
        if (typeof data.activeMode === 'string') {
          setActiveMode(data.activeMode as ActiveSourcesMode)
        }
        if (Array.isArray(data.activeSourceIds)) {
          setActiveSourceIds(data.activeSourceIds)
        }
        return current
      }

      setMutationNotice(`Reindexing ${current.label || sourceId}... (${current.indexStatus || 'unknown'})`)
      await new Promise(resolve => window.setTimeout(resolve, 1500))
    }

    throw new Error(`Reindex timed out after ${Math.round(timeoutMs / 1000)}s for source ${sourceId}`)
  }

  const handleReindexSource = async (source: KnowledgeSource) => {
    setMutationError(null)
    setMutationNotice(null)

    const success = await mutateSources('/api/agent/sources/reindex', { sourceId: source.id })
    if (!success) return

    try {
      await waitForTerminalIndexStatus(source.id)
      setMutationNotice(`Reindex complete for ${source.label}`)
    } catch (err) {
      setMutationError(null)
      setMutationNotice(String(err))
    }
  }

  const handleAddSource = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!sourcePath.trim()) {
      setMutationError('Knowledge source path is required')
      return
    }

    const success = await mutateSources('/api/agent/sources/add', {
      path: sourcePath.trim(),
      label: sourceLabel.trim() || undefined,
      id: sourceId.trim() || undefined
    })

    if (success) {
      setSourcePath('')
      setSourceLabel('')
      setSourceId('')
    }
  }

  const handleSetMode = async (mode: ActiveSourcesMode) => {
    const enabledCount = sources.filter(source => source.enabled).length
    if ((mode === 'single' || mode === 'multi') && enabledCount === 0) {
      setMutationError(`Cannot set ${mode} mode while no sources are enabled`)
      return
    }
    const nextIds = mode === 'all' ? [] : activeSourceIds.slice(0, mode === 'single' ? 1 : Math.max(activeSourceIds.length, 1))
    await mutateSources('/api/agent/active-sources', { mode, activeSourceIds: nextIds })
  }

  const handleWriteMode = async (nextMode: WriteMode) => {
    await mutateSources('/api/agent/write-mode', { writeMode: nextMode })
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-slate-50">
      {/* Top Bar */}
      <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8">
        <h1 className="text-base font-semibold text-slate-900">BuildFlow Dashboard</h1>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getAgentHealthClassName(agentConnected)}`} />
          <span className="text-xs font-medium text-slate-600">
            {getAgentHealthLabel(agentConnected)}
          </span>
        </div>
      </div>

      {/* Main layout: sidebar + content + right panel */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-80 border-r border-slate-200 bg-slate-50 overflow-y-auto">
          <div className="p-6 space-y-8">
            {/* Sidebar: Navigation placeholders */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Navigation</h2>
              <div className="space-y-1">
                <div className="px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer transition-colors">Overview</div>
                <div className="px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-200 bg-slate-100 cursor-pointer transition-colors font-medium">Sources</div>
                <div className="px-3 py-2 text-sm text-slate-700 rounded-md hover:bg-slate-100 cursor-pointer transition-colors">Settings</div>
              </div>
            </div>

            {/* Sidebar: Source summary */}
            {!loading && sources.length > 0 && (
              <div className="pt-4 border-t border-slate-200">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Source Status</h2>
                <div className="space-y-3">
                  <div className="px-3 py-2 rounded-md bg-white border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Connected</div>
                    <div className="text-lg font-semibold text-slate-900 mt-1">{sources.length}</div>
                  </div>
                  <div className="px-3 py-2 rounded-md bg-white border border-slate-200">
                    <div className="text-xs text-slate-500 font-medium">Enabled</div>
                    <div className="text-lg font-semibold text-slate-900 mt-1">{sources.filter(s => s.enabled).length}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 space-y-8 max-w-none">
            {/* Agent & Source Health Overview */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-6">Dashboard Overview</h2>

              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {/* Agent Status Card */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-slate-600 mb-2">Agent Status</div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${getAgentHealthClassName(agentConnected)}`} />
                    <div className="text-sm font-semibold text-slate-900">
                      {getAgentHealthLabel(agentConnected)}
                    </div>
                  </div>
                </div>

                {/* Total Sources Card */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-slate-600 mb-2">Total Sources</div>
                  <div className="text-2xl font-bold text-slate-900">{sources.length}</div>
                </div>

                {/* Enabled Sources Card */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-slate-600 mb-2">Enabled</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {sources.filter(s => s.enabled).length}
                  </div>
                </div>

                {/* Disabled Sources Card */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-slate-600 mb-2">Disabled</div>
                  <div className="text-2xl font-bold text-slate-900">
                    {getDisabledSourceCount(sources)}
                  </div>
                </div>

                {/* Ready Sources Card */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-slate-600 mb-2">Ready</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {getReadySourceCount(sources)}
                  </div>
                </div>

                {/* Indexing Sources Card */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-slate-600 mb-2">Indexing</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {getIndexingSourceCount(sources)}
                  </div>
                </div>

                {/* Failed Sources Card */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-slate-600 mb-2">Failed</div>
                  <div className="text-2xl font-bold text-red-600">
                    {getFailedSourceCount(sources)}
                  </div>
                </div>

                {/* Active Context Card */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-slate-600 mb-2">Context Mode</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {getActiveContextLabel(activeMode)}
                  </div>
                </div>

                {/* Write Mode Card */}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs font-medium text-slate-600 mb-2">Write Access</div>
                  <div className="text-sm font-semibold text-slate-900">
                    {getWriteModeLabel(writeMode)}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => knowledgeSourcesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                >
                  Manage Sources
                </button>
                <button
                  type="button"
                  onClick={() => addSourceFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-300 transition-colors"
                >
                  Add Source
                </button>
              </div>
            </div>

            {/* Current Plan & Next Action Panel */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="grid grid-cols-2 gap-8">
                {/* Current Plan */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Current Plan</h3>
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <p className="text-sm text-slate-600">No plan loaded yet.</p>
                    <p className="text-xs text-slate-500 mt-3">
                      Create a plan in the Custom GPT, then use BuildFlow to track and continue it here.
                    </p>
                  </div>
                </div>

                {/* Next Action */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Next Action</h3>
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                    <p className="text-sm text-slate-600">
                      {sources.length === 0
                        ? 'Connect a source to get started.'
                        : !agentConnected
                          ? 'Start the local agent to continue.'
                          : 'Create or load a plan from ChatGPT.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-slate-200">
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Plan Structure (future)</h3>
                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-200">
                    <div className="w-4 h-4 rounded border border-slate-300 bg-white" />
                    <span>Plan title</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-200">
                    <div className="w-4 h-4 rounded border border-slate-300 bg-white" />
                    <span>Plan status</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-200">
                    <div className="w-4 h-4 rounded border border-slate-300 bg-white" />
                    <span>Task checklist</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-slate-50 border border-slate-200">
                    <div className="w-4 h-4 rounded border border-slate-300 bg-white" />
                    <span>Resume / continue action</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Knowledge Sources Section */}
            <div ref={knowledgeSourcesRef} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-1">Knowledge Sources</h2>
              <p className="text-slate-600 text-sm mb-6">
                Configured knowledge sources that are searched and read together through ChatGPT.
              </p>
              {error ? (
                <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 text-red-900">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">Unable to load sources</p>
                      <p className="text-xs mt-1">{error}</p>
                      {loadErrorDetail ? <p className="text-xs mt-1 opacity-75">{loadErrorDetail}</p> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchSources()}
                      className="rounded-lg bg-red-600 px-3 py-2 text-xs font-medium text-white disabled:opacity-50 shrink-0 hover:bg-red-700 transition-colors"
                      disabled={mutationLoading}
                    >
                      Retry
                    </button>
                  </div>
                </div>
              ) : null}

              <form ref={addSourceFormRef} onSubmit={handleAddSource} className="border border-slate-200 rounded-lg p-4 mb-6 space-y-4 bg-slate-50">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3 text-sm">Add Knowledge Source</h3>
                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="block">
                      <span className="block text-xs font-medium text-slate-700 mb-2">Path *</span>
                      <input
                        value={sourcePath}
                        onChange={e => setSourcePath(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                        placeholder="~/notes"
                        disabled={mutationLoading}
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-medium text-slate-700 mb-2">Label</span>
                      <input
                        value={sourceLabel}
                        onChange={e => setSourceLabel(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400"
                        placeholder="My Notes"
                        disabled={mutationLoading}
                      />
                    </label>
                    <label className="block">
                      <span className="block text-xs font-medium text-slate-700 mb-2">ID</span>
                      <input
                        value={sourceId}
                        onChange={e => setSourceId(e.target.value)}
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
                {mutationError ? <p className="text-xs text-red-700 font-medium">{mutationError}</p> : null}
                {mutationNotice ? <p className="text-xs text-emerald-700 font-medium">{mutationNotice}</p> : null}
              </form>

              {loading ? (
                <div className="text-sm text-slate-500">Loading sources...</div>
              ) : sources.length === 0 ? (
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500">
                  <p className="text-sm">No knowledge sources configured.</p>
                  <code className="text-slate-600 font-mono text-xs block mt-2">buildflow connect &lt;path&gt;</code>
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
                            onClick={() => toggleActiveSource(source.id)}
                            className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                          >
                            Toggle Active
                          </button>
                          <button
                            type="button"
                            disabled={mutationLoading}
                            onClick={() => mutateSources('/api/agent/sources/toggle', { sourceId: source.id, enabled: !source.enabled })}
                            className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                          >
                            {source.enabled ? 'Disable' : 'Enable'}
                          </button>
                          <button
                            type="button"
                            disabled={mutationLoading || !source.enabled || source.indexStatus === 'indexing'}
                            onClick={() => handleReindexSource(source)}
                            className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-100 transition-colors"
                          >
                            {source.indexStatus === 'indexing' ? 'Indexing...' : 'Reindex'}
                          </button>
                          <button
                            type="button"
                            disabled={mutationLoading}
                            onClick={() => {
                              if (window.confirm(`Remove knowledge source "${source.label}"?`)) {
                                mutateSources('/api/agent/sources/remove', { sourceId: source.id })
                              }
                            }}
                            className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 disabled:opacity-50 hover:bg-slate-100 transition-colors"
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

            {/* Active Context Section */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Active Context</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeMode === 'single' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => handleSetMode('single')} type="button">single</button>
                <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeMode === 'multi' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => handleSetMode('multi')} type="button">multi</button>
                <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeMode === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => handleSetMode('all')} type="button">all</button>
              </div>
              <div className="text-xs text-slate-600 mb-2">
                Enabled sources show their index status. Use Reindex after enabling a source before expecting search results.
              </div>
              <div className="text-xs text-slate-500 mb-4">Active source ids: {activeSourceIds.length > 0 ? activeSourceIds.join(', ') : 'all enabled sources'}</div>
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wide">Write Mode</h3>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${writeMode === 'readOnly' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => handleWriteMode('readOnly')}>readOnly</button>
                  <button type="button" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${writeMode === 'artifactsOnly' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => handleWriteMode('artifactsOnly')}>artifactsOnly</button>
                  <button type="button" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${writeMode === 'safeWrites' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => handleWriteMode('safeWrites')}>safeWrites</button>
                </div>
              </div>
            </div>

            {/* Execution Mode Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-base font-semibold text-blue-900 mb-2">Execution Modes</h2>
              <p className="text-blue-800 text-sm">
                BuildFlow supports two execution modes for ChatGPT Actions:
              </p>
              <ul className="text-blue-800 text-xs space-y-1 mt-3 ml-4">
                <li>• <strong>direct-agent (default):</strong> Web app calls local agent directly on port 3052</li>
                <li>• <strong>relay-agent (Phase 5C+):</strong> Web app calls relay on port 3053, which routes to agent via WebSocket. Requires matching RELAY_PROXY_TOKEN on both sides.</li>
              </ul>
              <p className="text-blue-700 text-xs mt-3">
                Set mode via <code className="bg-blue-100 px-1 rounded">BUILDFLOW_BACKEND_MODE</code> environment variable.
              </p>
            </div>

            {/* Getting Started */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-900 mb-4">Getting Started</h2>

              <div className="space-y-5">
                <div>
                  <h3 className="font-medium text-slate-900 mb-2 text-sm">1. Install and Initialize</h3>
                  <code className="bg-slate-100 p-2.5 rounded-lg block text-xs mb-2 text-slate-800">npm install -g buildflow</code>
                  <code className="bg-slate-100 p-2.5 rounded-lg block text-xs text-slate-800">buildflow init</code>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-2 text-sm">2. Add Knowledge Sources</h3>
                  <p className="text-slate-600 text-xs mb-2">Connect local folders to search and read from:</p>
                  <code className="bg-slate-100 p-2.5 rounded-lg block text-xs mb-2 text-slate-800">buildflow connect ~/my-vault</code>
                  <p className="text-slate-600 text-xs">Repeat to add multiple sources (Brain, Mind, docs, etc.)</p>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-2 text-sm">3. Start the Agent</h3>
                  <code className="bg-slate-100 p-2.5 rounded-lg block text-xs text-slate-800">buildflow serve</code>
                  <p className="text-slate-600 text-xs mt-2">Agent listens on http://127.0.0.1:3052</p>
                </div>

                <div>
                  <h3 className="font-medium text-slate-900 mb-2 text-sm">4. Configure ChatGPT Custom Actions</h3>
                  <p className="text-slate-600 text-xs">
                    Import the OpenAPI schema and set Bearer token authentication. All configured sources will be searched together.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Insight Panel */}
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
      </div>
    </div>
  )
}
