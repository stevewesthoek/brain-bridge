import type { ReactNode } from 'react'

type DashboardShellProps = {
  leftRail: ReactNode
  mainContent: ReactNode
  rightPanel: ReactNode
}

export function DashboardShell({ leftRail, mainContent, rightPanel }: DashboardShellProps) {
  return (
    <div className="grid flex-1 min-h-0 overflow-hidden bg-slate-50 dark:bg-slate-950 xl:grid-cols-[16rem_minmax(0,1fr)_18rem] 2xl:grid-cols-[17rem_minmax(0,1fr)_20rem]">
      {leftRail}
      {mainContent}
      {rightPanel}
    </div>
  )
}
