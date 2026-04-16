'use client'

import { useState } from 'react'

export default function Dashboard() {
  const [apiKey, setApiKey] = useState('')
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey || 'Your API key will appear here')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* API Key Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">API Key</h2>
            <p className="text-gray-600 text-sm mb-4">Use this key to authenticate the Brain Bridge CLI.</p>

            <div className="bg-gray-100 p-4 rounded mb-4 break-all font-mono text-sm">
              {apiKey || 'api_key_will_be_generated_here'}
            </div>

            <button
              onClick={handleCopy}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition"
            >
              {copied ? 'Copied!' : 'Copy Key'}
            </button>
          </div>

          {/* Connected Devices */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Connected Devices</h2>
            <p className="text-gray-600 text-sm mb-4">Your local Brain Bridge agents appear here when connected.</p>

            <div className="border-2 border-dashed border-gray-300 rounded p-4 text-center text-gray-500">
              No devices connected yet
            </div>
          </div>
        </div>

        {/* Setup Instructions */}
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Setup Instructions</h2>

          <ol className="space-y-4 text-gray-700">
            <li>
              <strong>1. Install Brain Bridge CLI:</strong>
              <code className="bg-gray-100 p-2 rounded block mt-2 text-sm">npm install -g brainbridge</code>
            </li>
            <li>
              <strong>2. Initialize:</strong>
              <code className="bg-gray-100 p-2 rounded block mt-2 text-sm">brainbridge init</code>
            </li>
            <li>
              <strong>3. Login with your API key:</strong>
              <code className="bg-gray-100 p-2 rounded block mt-2 text-sm">brainbridge login YOUR_API_KEY</code>
            </li>
            <li>
              <strong>4. Connect your vault:</strong>
              <code className="bg-gray-100 p-2 rounded block mt-2 text-sm">
                brainbridge connect ~/Obsidian/MyVault
              </code>
            </li>
            <li>
              <strong>5. Start the agent:</strong>
              <code className="bg-gray-100 p-2 rounded block mt-2 text-sm">brainbridge serve</code>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
