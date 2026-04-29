import type { ReactNode } from 'react'

type DashboardShellProps = {
  leftRail: ReactNode
  mainContent: ReactNode
  rightPanel: ReactNode
}

export function DashboardShell({ leftRail, mainContent, rightPanel }: DashboardShellProps) {
  return (
    <div className="grid flex-1 min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950 xl:grid-cols-[17.5rem_minmax(0,1fr)_20rem] 2xl:grid-cols-[18rem_minmax(0,1fr)_22rem]">
      {leftRail}
      {mainContent}
      {rightPanel}
    </div>
  )
}
