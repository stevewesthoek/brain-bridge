import type { KnowledgeSource } from '@buildflow/shared'

type PlanPlaceholderPanelProps = {
  sources: KnowledgeSource[]
  agentConnected: boolean
  variant?: 'full' | 'compact'
}

export function PlanPlaceholderPanel({ sources, agentConnected, variant = 'full' }: PlanPlaceholderPanelProps) {
  if (variant === 'compact') {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900/70">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-xs uppercase font-semibold text-slate-500 tracking-wide mb-2 dark:text-slate-400">Plan</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">No plan loaded yet</p>
          </div>
          <div>
            <h3 className="text-xs uppercase font-semibold text-slate-500 tracking-wide mb-2 dark:text-slate-400">Next</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {sources.length === 0
                ? 'Add a source'
                : !agentConnected
                  ? 'Start agent'
                  : 'Create plan'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900/70">
        <h3 className="text-xs uppercase font-semibold text-slate-500 tracking-wide mb-3 dark:text-slate-400">Current Plan</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">No plan loaded yet</p>
        <p className="text-xs text-slate-500 mt-2 dark:text-slate-400">Create a plan in ChatGPT to begin tracking it here.</p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900/70">
        <h3 className="text-xs uppercase font-semibold text-slate-500 tracking-wide mb-3 dark:text-slate-400">Next Action</h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {sources.length === 0
            ? 'Add a knowledge source'
            : !agentConnected
              ? 'Start the local agent'
              : 'Create or load a plan'}
        </p>
      </div>
    </div>
  )
}
