import type { KnowledgeSource, WriteMode } from '@buildflow/shared'
import { CheckCircle2 } from 'lucide-react'

import {
  getFailedSourceCount,
  getIndexingSourceCount,
  getReadySourceCount,
} from '../helpers'
import type { DashboardLocalPlan } from '../types'
import { DashboardButton } from './ui/DashboardButton'
import { DashboardMetricCard } from './ui/DashboardMetricCard'
import { DashboardPanel } from './ui/DashboardPanel'
import { DashboardSectionHeader } from './ui/DashboardSectionHeader'
import { DashboardStatusDot } from './ui/DashboardStatusDot'

type DashboardOverviewProps = {
  loading: boolean
  agentConnected: boolean
  sources: KnowledgeSource[]
  writeMode: WriteMode
  localPlan: DashboardLocalPlan | null
  onManageSources: () => void
  onOpenHandoff: () => void
  onOpenPlan: () => void
}

const formatCount = (value: number) => value.toLocaleString()

export function DashboardOverview({
  loading,
  agentConnected,
  sources,
  writeMode,
  localPlan,
  onManageSources,
  onOpenHandoff,
  onOpenPlan
}: DashboardOverviewProps) {
  const readyCount = getReadySourceCount(sources)
  const indexingCount = getIndexingSourceCount(sources)
  const failedCount = getFailedSourceCount(sources)
  const enabledCount = sources.filter(source => source.enabled).length
  const indexedFiles = sources.reduce((total, source) => total + (typeof source.indexedFileCount === 'number' ? source.indexedFileCount : 0), 0)
  const doneCount = localPlan?.tasks.filter(task => task.status === 'done').length ?? 0
  const activeTasks = localPlan?.tasks.filter(task => task.status === 'active').length ?? 0
  const totalTasks = localPlan?.tasks.length ?? 0
  const nextTask = localPlan?.tasks.find(task => task.status === 'active') || localPlan?.tasks.find(task => task.status === 'pending') || localPlan?.tasks[0] || null
  const topSources = [...sources]
    .sort((a, b) => (b.indexedFileCount ?? 0) - (a.indexedFileCount ?? 0))
    .slice(0, 4)
  const planProgress = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0
  const sourceHealth = sources.length > 0 ? Math.round((readyCount / sources.length) * 100) : 0

  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3">
      <DashboardPanel variant="raised" className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <DashboardSectionHeader
              eyebrow="Overview"
              title="Good morning, Steve"
              detail="BuildFlow Local is your compact AI workbench for sources, plans, and safe execution."
            />
            <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] text-bf-muted dark:text-slate-300">
              <span className="inline-flex items-center gap-1.5"><DashboardStatusDot tone={agentConnected ? 'good' : 'neutral'} />{agentConnected ? 'Agent connected' : 'Agent offline'}</span>
              <span>·</span>
              <span>{enabledCount} enabled sources</span>
              <span>·</span>
              <span>{writeMode}</span>
              {loading ? <><span>·</span><span>refreshing</span></> : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <DashboardButton type="button" onClick={onManageSources} variant="secondary">
              Manage sources
            </DashboardButton>
            <DashboardButton type="button" onClick={onOpenPlan} variant={localPlan ? 'secondary' : 'primary'}>
              {localPlan ? 'Open plan' : 'New plan'}
            </DashboardButton>
            <DashboardButton type="button" onClick={onOpenHandoff} variant="primary">
              Handoff
            </DashboardButton>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardMetricCard label="Sources" value={formatCount(sources.length)} detail={`${readyCount} ready · ${enabledCount} enabled`} tone={readyCount > 0 ? 'good' : 'neutral'} />
          <DashboardMetricCard label="Files indexed" value={formatCount(indexedFiles)} detail="Across all local sources" tone="neutral" />
          <DashboardMetricCard label="Plans" value={localPlan ? '1' : '0'} detail={localPlan ? `${planProgress}% complete` : 'Create a local plan'} tone={localPlan ? 'good' : 'neutral'} />
          <DashboardMetricCard label="Tasks" value={formatCount(totalTasks)} detail={totalTasks ? `${doneCount} done · ${activeTasks} active` : 'No local tasks yet'} tone={activeTasks > 0 ? 'warn' : doneCount > 0 ? 'good' : 'neutral'} />
        </div>
      </DashboardPanel>

      <div className="grid min-h-0 gap-3 xl:grid-cols-[minmax(0,1.35fr)_minmax(19rem,0.8fr)]">
        <div className="grid min-h-0 gap-3 lg:grid-cols-2">
          <DashboardPanel variant="flat" className="min-h-0 overflow-hidden p-4">
            <DashboardSectionHeader eyebrow="Activity overview" title="Workspace trend" detail="Recent local source and plan activity." />
            <div className="mt-4 flex h-32 items-end gap-2 border-b border-bf-border/60 pb-2 dark:border-slate-800/60">
              {[36, 28, 48, 42, 57, 70, 64, 82].map((height, index) => (
                <div key={index} className="flex flex-1 items-end">
                  <div className="w-full rounded-t-sm bg-blue-500/80 dark:bg-blue-400/70" style={{ height: `${height}%` }} />
                </div>
              ))}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-bf-muted dark:text-slate-400">
              <span><strong className="text-bf-text dark:text-slate-100">{readyCount}</strong> ready</span>
              <span><strong className="text-bf-text dark:text-slate-100">{indexingCount}</strong> indexing</span>
              <span><strong className="text-bf-text dark:text-slate-100">{failedCount}</strong> failed</span>
            </div>
          </DashboardPanel>

          <DashboardPanel variant="flat" className="p-4">
            <DashboardSectionHeader eyebrow="Source health" title={`${sourceHealth}% healthy`} detail="Ready sources divided by connected sources." />
            <div className="mt-5 flex items-center justify-center">
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/10 dark:bg-emerald-500/10">
                <div className="text-center">
                  <div className="text-2xl font-semibold text-bf-text dark:text-slate-50">{sourceHealth}%</div>
                  <div className="text-[10px] uppercase tracking-[0.08em] text-bf-muted dark:text-slate-400">Ready</div>
                </div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-[12px] text-bf-muted dark:text-slate-300">
              <div className="flex justify-between"><span>All sources connected</span><span>{sources.length > 0 ? 'yes' : 'no'}</span></div>
              <div className="flex justify-between"><span>Index up to date</span><span>{indexingCount === 0 ? 'yes' : 'running'}</span></div>
              <div className="flex justify-between"><span>Failures</span><span>{failedCount}</span></div>
            </div>
          </DashboardPanel>

          <DashboardPanel variant="flat" className="min-h-0 overflow-hidden p-4">
            <DashboardSectionHeader eyebrow="Top sources" title="Most indexed sources" detail="Largest connected local contexts." />
            <div className="mt-3 space-y-2">
              {topSources.length === 0 ? (
                <p className="text-[12px] text-bf-muted dark:text-slate-400">No sources connected yet.</p>
              ) : topSources.map(source => {
                const count = source.indexedFileCount ?? 0
                const percent = indexedFiles > 0 ? Math.max(8, Math.round((count / indexedFiles) * 100)) : 8
                return (
                  <div key={source.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-3 text-[12px]">
                      <span className="truncate font-medium text-bf-text dark:text-slate-100">{source.label}</span>
                      <span className="font-mono-ui text-[11px] text-bf-muted dark:text-slate-400">{formatCount(count)}</span>
                    </div>
                    <div className="h-1 overflow-hidden rounded-full bg-bf-subtle dark:bg-slate-900">
                      <div className="h-full rounded-full bg-blue-500/80" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </DashboardPanel>

          <DashboardPanel variant="flat" className="p-4">
            <DashboardSectionHeader eyebrow="Workflow" title="Your local flow" detail="Connect, plan, execute, verify." />
            <div className="mt-3 space-y-2 text-[12px]">
              {[
                ['Connect sources', readyCount > 0],
                ['Plan in ChatGPT', Boolean(localPlan)],
                ['Prepare handoff', readyCount > 0],
                ['Verify safe changes', writeMode === 'safeWrites']
              ].map(([label, done]) => (
                <div key={String(label)} className="flex items-center gap-2 text-bf-muted dark:text-slate-300">
                  {done ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.8} /> : <DashboardStatusDot tone="neutral" />}
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </DashboardPanel>
        </div>

        <div className="grid min-h-0 gap-3">
          <DashboardPanel variant="flat" className="p-4">
            <DashboardSectionHeader eyebrow="Recent plan" title={localPlan ? localPlan.title : 'No active plan'} detail={nextTask ? nextTask.title : 'Create a plan to track scoped work.'} />
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-bf-subtle dark:bg-slate-900">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${planProgress}%` }} />
            </div>
            <div className="mt-3 flex items-center justify-between text-[12px] text-bf-muted dark:text-slate-400">
              <span>{doneCount}/{totalTasks || 0} tasks done</span>
              <span>{planProgress}%</span>
            </div>
          </DashboardPanel>

          <DashboardPanel variant="flat" className="p-4">
            <DashboardSectionHeader eyebrow="Next action" title={nextTask ? nextTask.title : readyCount > 0 ? 'Create a local plan' : 'Add a source'} detail={nextTask ? nextTask.detail : readyCount > 0 ? 'Turn ready source context into a scoped plan.' : 'Connect a local source before planning.'} />
            <div className="mt-4 flex flex-wrap gap-2">
              <DashboardButton type="button" variant="primary" onClick={nextTask ? onOpenHandoff : onOpenPlan}>
                {nextTask ? 'Open handoff' : 'Create plan'}
              </DashboardButton>
              <DashboardButton type="button" variant="secondary" onClick={onManageSources}>
                Sources
              </DashboardButton>
            </div>
          </DashboardPanel>
        </div>
      </div>
    </div>
  )
}
