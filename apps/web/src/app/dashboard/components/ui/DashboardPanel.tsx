import type { ReactNode } from 'react'
import { classNames } from './classNames'

type DashboardPanelProps = {
  className?: string
  children: ReactNode
  variant?: 'default' | 'flat' | 'raised'
}

const VARIANT_CLASSES: Record<NonNullable<DashboardPanelProps['variant']>, string> = {
  default: 'border border-bf-border/45 bg-bf-surface/88 text-bf-text dark:border-slate-800/45 dark:bg-slate-950/28',
  flat: 'bg-bf-surface/64 text-bf-text dark:bg-slate-950/18',
  raised: 'border border-bf-border/45 bg-bf-surface/96 text-bf-text shadow-[0_10px_24px_-22px_rgba(15,23,42,0.16)] dark:border-slate-800/50 dark:bg-slate-900/84 dark:shadow-[0_10px_24px_-22px_rgba(15,23,42,0.32)]'
}

export function DashboardPanel({ className, children, variant = 'default' }: DashboardPanelProps) {
  return (
    <section className={classNames('rounded-lg', VARIANT_CLASSES[variant], className)}>
      {children}
    </section>
  )
}
