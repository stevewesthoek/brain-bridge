type DashboardSection = 'overview' | 'sources' | 'plan' | 'handoff' | 'settings'

type InsightPanelProps = {
  loading: boolean
  error: string | null
  sourceCount: number
  section: DashboardSection
}

export function InsightPanel({ loading, error, sourceCount, section }: InsightPanelProps) {
  let title = ''
  let content = ''

  if (section === 'overview') {
    title = 'Readiness'
    content = error
      ? 'Resolve the connection issue before continuing. The dashboard keeps the current state visible so you can recover without losing context.'
      : loading
        ? 'Waiting for BuildFlow to finish loading source state and agent status.'
        : sourceCount === 0
          ? 'Connect a knowledge source first, then use Sources to add one.'
          : 'Stack is healthy and ready to continue. Review the current plan or move to Handoff to copy prompts.'
  } else if (section === 'sources') {
    title = 'Source Health'
    content = 'Index status shows if a source is ready for searching. "Indexing" means BuildFlow is processing the files. If indexing stalls, try Reindex.'
  } else if (section === 'plan') {
    title = 'Plan Lifecycle'
    content = 'Plans organize your build into phases and tasks. Each task can be verified before moving to the next. Use the Handoff panel to copy the execution prompt.'
  } else if (section === 'handoff') {
    title = 'Where to Paste'
    content = 'Paste the Codex prompt into your terminal with the codex command. Paste the Claude Code prompt into Claude Code or the web interface.'
  } else if (section === 'settings') {
    title = 'Local Stack'
    content = 'Verify the local services: curl http://127.0.0.1:3052/health for the agent, http://127.0.0.1:3053/health for the relay, and http://127.0.0.1:3054/api/openapi for the web.'
  }

  return (
    <div className="w-96 border-l border-slate-200 bg-slate-50 overflow-y-auto dark:border-slate-800 dark:bg-slate-950">
      <div className="p-6 space-y-6">
        <div>
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4 dark:text-slate-400">{title}</h2>
          <div className="bg-white border border-slate-200 rounded-lg p-4 dark:border-slate-800 dark:bg-slate-900/70">
            <p className="text-sm text-slate-700 leading-6 dark:text-slate-300">{content}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
