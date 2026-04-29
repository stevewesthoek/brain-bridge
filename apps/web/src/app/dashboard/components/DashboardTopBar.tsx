import type { ReactNode } from 'react'

import { getAgentHealthClassName, getAgentHealthLabel } from '../helpers'

const IconRefresh = () => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
    <path d="M13 4.5V1.75m0 0h-2.75M13 1.75 10.7 4.05" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
    <path d="M3.15 7.25a5 5 0 0 1 8.35-2.25M3 11.5v2.75m0 0h2.75M3 14.25l2.3-2.3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
    <path d="M12.85 8.75a5 5 0 0 1-8.35 2.25" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.25" />
  </svg>
)

const IconTheme = ({ theme }: { theme: 'light' | 'dark' }) => (
  <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5">
    {theme === 'dark' ? (
      <path d="M10.8 1.9a5.4 5.4 0 1 0 3.3 9.5A6 6 0 0 1 10.8 1.9Z" fill="currentColor" />
    ) : (
      <>
        <circle cx="8" cy="8" r="2.6" fill="currentColor" />
        <path d="M8 1.5v1.8M8 12.7v1.8M3.05 3.05l1.27 1.27M11.68 11.68l1.27 1.27M1.5 8h1.8M12.7 8h1.8M3.05 12.95l1.27-1.27M11.68 4.32l1.27-1.27" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
      </>
    )}
  </svg>
)

type DashboardTopBarProps = {
  currentSectionLabel: string
  agentConnected: boolean
  statusText?: string | null
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onRefresh: () => void
  children?: ReactNode
}

export function DashboardTopBar({
  currentSectionLabel,
  agentConnected,
  statusText,
  theme,
  onToggleTheme,
  onRefresh,
  children
}: DashboardTopBarProps) {
  return (
    <div className="shrink-0 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-slate-800 dark:bg-slate-950/88">
      <div className="flex h-12 items-center justify-between gap-3 px-4 lg:px-5">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className="text-slate-700 dark:text-slate-200">BuildFlow</span>
            <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span>{currentSectionLabel}</span>
          </div>
        </div>

        <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 xl:flex">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-[11px] font-medium ${
              agentConnected
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-200'
                : 'border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${getAgentHealthClassName(agentConnected)}`} />
            {getAgentHealthLabel(agentConnected)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {children}
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Refresh dashboard"
          >
            <IconRefresh />
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label={`Switch dashboard theme to ${theme === 'dark' ? 'light' : 'dark'}`}
          >
            <IconTheme theme={theme} />
          </button>
        </div>
      </div>

      {statusText && (
        <div className="border-t border-slate-200 px-5 py-2 text-[11px] lg:px-6 dark:border-slate-800">
          <div className="flex min-h-5 items-center gap-2 text-slate-600 dark:text-slate-300">
            <span className={`h-1.5 w-1.5 rounded-full ${/error|unable|fail|disconnect/i.test(statusText) ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            <span className="truncate">
              {statusText}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
