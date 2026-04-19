'use client'

import { useState, useEffect } from 'react'
import type { KnowledgeSource } from '@brainbridge/shared'

export default function Dashboard() {
  const [sources, setSources] = useState<KnowledgeSource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [agentConnected, setAgentConnected] = useState(false)

  useEffect(() => {
    const fetchSources = async () => {
      try {
        const response = await fetch('/api/agent/sources')
        if (!response.ok) {
          throw new Error(`Failed to fetch sources: ${response.status}`)
        }

        const data = await response.json()
        setSources(data.sources || [])
        setAgentConnected(true)
      } catch (err) {
        setError(String(err))
        setAgentConnected(false)
      } finally {
        setLoading(false)
      }
    }

    fetchSources()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Brain Bridge Dashboard</h1>

        {/* Connected Agent Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Connected Agent</h2>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${agentConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-gray-700">
              {agentConnected ? 'Agent connected on port 3052' : 'Agent not connected'}
            </span>
          </div>
        </div>

        {/* Knowledge Sources Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Knowledge Sources</h2>
          <p className="text-gray-600 text-sm mb-6">
            Configured knowledge sources that are searched and read together through ChatGPT.
          </p>

          {loading ? (
            <div className="text-gray-500">Loading sources...</div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded p-4 text-red-800">
              <p className="font-semibold">Unable to load sources</p>
              <p className="text-sm">{error}</p>
            </div>
          ) : sources.length === 0 ? (
            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500">
              No knowledge sources configured. Run: <code className="text-gray-700 font-mono">brainbridge connect &lt;path&gt;</code>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map(source => (
                <div key={source.id} className="border border-gray-200 rounded p-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{source.label}</div>
                    <div className="text-sm text-gray-600 font-mono">{source.path}</div>
                    <div className="text-xs text-gray-500 mt-1">ID: {source.id}</div>
                  </div>
                  <div className={`px-3 py-1 rounded text-xs font-semibold ${source.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {source.enabled ? 'Enabled' : 'Disabled'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Execution Mode Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-bold text-blue-900 mb-2">Execution Modes</h2>
          <p className="text-blue-800 text-sm">
            Brain Bridge supports two execution modes for ChatGPT Actions:
          </p>
          <ul className="text-blue-800 text-sm space-y-1 mt-3 ml-4">
            <li>• <strong>direct-agent (default):</strong> Web app calls local agent directly on port 3052</li>
            <li>• <strong>relay-agent (Phase 5C+):</strong> Web app calls relay on port 3053, which routes to agent via WebSocket. Requires matching RELAY_PROXY_TOKEN on both sides.</li>
          </ul>
          <p className="text-blue-700 text-xs mt-3">
            Set mode via <code className="bg-blue-100 px-1 rounded">BRAIN_BRIDGE_BACKEND_MODE</code> environment variable.
          </p>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Getting Started</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Install and Initialize</h3>
              <code className="bg-gray-100 p-3 rounded block text-sm mb-2">npm install -g brainbridge</code>
              <code className="bg-gray-100 p-3 rounded block text-sm">brainbridge init</code>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Add Knowledge Sources</h3>
              <p className="text-gray-600 text-sm mb-2">Connect local folders to search and read from:</p>
              <code className="bg-gray-100 p-3 rounded block text-sm mb-2">brainbridge connect ~/my-vault</code>
              <p className="text-gray-600 text-xs">Repeat to add multiple sources (Brain, Mind, docs, etc.)</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Start the Agent</h3>
              <code className="bg-gray-100 p-3 rounded block text-sm">brainbridge serve</code>
              <p className="text-gray-600 text-xs mt-2">Agent listens on http://127.0.0.1:3052</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Configure ChatGPT Custom Actions</h3>
              <p className="text-gray-600 text-sm">
                Import the OpenAPI schema and set Bearer token authentication. All configured sources will be searched together.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
