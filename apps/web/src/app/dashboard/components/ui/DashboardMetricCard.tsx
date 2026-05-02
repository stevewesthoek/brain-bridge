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
    <div className={classNames('relative overflow-hidden rounded-[14px] bg-bf-surface/55 px-3 py-2.5 ring-1 ring-inset ring-bf-border/40 backdrop-blur-[1px] dark:bg-slate-950/20 dark:ring-slate-800/50', className)}>
      <div className={classNames('absolute inset-y-0 left-0 w-0.5 opacity-70', tone === 'good' ? 'bg-emerald-500' : tone === 'warn' ? 'bg-amber-500' : tone === 'bad' ? 'bg-red-500' : 'bg-slate-400 dark:bg-slate-500')} />
      <div className="pl-1">
        <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-bf-muted/90 dark:text-slate-500">{label}</div>
        <div className="mt-1 text-[18px] font-semibold tabular-nums leading-none text-bf-text dark:text-slate-50">{value}</div>
        {detail ? <div className={classNames('mt-1 line-clamp-2 text-[11px] leading-4', TONE_CLASSES[tone])}>{detail}</div> : null}
      </div>
    </div>
  )
}
