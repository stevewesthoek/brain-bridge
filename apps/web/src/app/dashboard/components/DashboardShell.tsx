import type { ReactNode } from 'react'

type DashboardShellProps = {
  leftRail: ReactNode
  mainContent: ReactNode
  rightPanel: ReactNode
}

export function DashboardShell({ leftRail, mainContent, rightPanel }: DashboardShellProps) {
  return (
    <div className="grid flex-1 min-h-0 overflow-hidden bg-bf-bg xl:grid-cols-[15.75rem_minmax(0,1fr)_17.5rem] 2xl:grid-cols-[16.5rem_minmax(0,1fr)_18.5rem]">
      {leftRail}
      {mainContent}
      {rightPanel}
    </div>
  )
}
