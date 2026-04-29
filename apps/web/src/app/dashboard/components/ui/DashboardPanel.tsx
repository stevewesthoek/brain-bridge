import type { ReactNode } from 'react'
import { classNames } from './classNames'

type DashboardPanelProps = {
  className?: string
  children: ReactNode
  variant?: 'default' | 'flat' | 'raised'
}

const VARIANT_CLASSES: Record<NonNullable<DashboardPanelProps['variant']>, string> = {
  default: 'border border-bf-border/70 bg-bf-surface/88 text-bf-text dark:border-slate-800/80 dark:bg-slate-950/28',
  flat: 'bg-bf-surface/55 text-bf-text dark:bg-slate-950/18',
  raised: 'border border-bf-border/70 bg-bf-surface/96 text-bf-text shadow-[0_14px_34px_-28px_rgba(15,23,42,0.22)] dark:border-slate-800/80 dark:bg-slate-900/86 dark:shadow-[0_14px_34px_-28px_rgba(15,23,42,0.48)]'
}

export function DashboardPanel({ className, children, variant = 'default' }: DashboardPanelProps) {
  return (
    <section className={classNames('rounded-lg', VARIANT_CLASSES[variant], className)}>
      {children}
    </section>
  )
}
