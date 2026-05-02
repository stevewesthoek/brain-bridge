import type { ReactNode } from 'react'

import { classNames } from './classNames'

type DashboardMetricCardProps = {
  label: string
  value: ReactNode
  detail?: ReactNode
  tone?: 'neutral' | 'good' | 'warn' | 'bad'
  className?: string
}

const TONE_CLASSES: Record<NonNullable<DashboardMetricCardProps['tone']>, string> = {
  neutral: 'text-bf-muted dark:text-slate-400',
  good: 'text-emerald-600 dark:text-emerald-300',
  warn: 'text-amber-600 dark:text-amber-300',
  bad: 'text-red-600 dark:text-red-300'
}

export function DashboardMetricCard({ label, value, detail, tone = 'neutral', className }: DashboardMetricCardProps) {
  return (
    <div className={classNames('rounded-lg border border-bf-border/55 bg-bf-surface/75 px-3 py-2.5 dark:border-slate-800/60 dark:bg-slate-950/34', className)}>
      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-bf-muted/90 dark:text-slate-500">{label}</div>
      <div className="mt-1 text-[18px] font-semibold tabular-nums leading-none text-bf-text dark:text-slate-50">{value}</div>
      {detail ? <div className={classNames('mt-1 truncate text-[11px] leading-4', TONE_CLASSES[tone])}>{detail}</div> : null}
    </div>
  )
}
