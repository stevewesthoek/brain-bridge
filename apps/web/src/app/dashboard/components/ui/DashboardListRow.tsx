import type { ReactNode } from 'react'
import { classNames } from './classNames'

type DashboardListRowProps = {
  children: ReactNode
  className?: string
  selected?: boolean
  onClick?: () => void
}

export function DashboardListRow({ children, className, selected, onClick }: DashboardListRowProps) {
  const interactive = typeof onClick === 'function'
  return (
    <div
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onKeyDown={interactive
        ? (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              onClick?.()
            }
          }
        : undefined}
      className={classNames(
        'flex min-h-7 items-center gap-2 rounded-md px-3 py-1.5 text-left text-[12px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-slate-500/40 dark:focus-visible:ring-offset-slate-950',
        interactive ? 'cursor-pointer hover:bg-bf-subtle/70 dark:hover:bg-slate-900/45' : '',
        selected ? 'bg-bf-subtle/80 text-bf-text dark:bg-slate-900/65' : '',
        className
      )}
    >
      {children}
    </div>
  )
}
