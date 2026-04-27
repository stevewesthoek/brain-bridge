import type { ReactNode } from 'react'

import { getAgentHealthClassName, getAgentHealthLabel } from '../helpers'

type DashboardTopBarProps = {
  agentConnected: boolean
  mutationError: string | null
  mutationNotice: string | null
  error: string | null
  children?: ReactNode
}

export function DashboardTopBar({
  agentConnected,
  mutationError,
  mutationNotice,
  error,
  children
}: DashboardTopBarProps) {
  return (
    <div className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8">
      <h1 className="text-base font-semibold text-slate-900">BuildFlow Dashboard</h1>
      <div className="flex items-center gap-3">
        {children}
        {mutationError && (
          <div className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-lg border border-red-200">
            Error: {mutationError.split(':')[0]}
          </div>
        )}
        {mutationNotice && !error && (
          <div className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
            {mutationNotice}
          </div>
        )}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-lg border ${
            agentConnected ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-100 border-slate-300'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${getAgentHealthClassName(agentConnected)}`} />
          <span className={`text-xs font-medium ${agentConnected ? 'text-emerald-700' : 'text-slate-600'}`}>
            {getAgentHealthLabel(agentConnected)}
          </span>
        </div>
      </div>
    </div>
  )
}

