type ExecutionHandoffPanelProps = {
  codexPrompt: string
  claudeCodePrompt: string
  handoffCopyStatus: 'idle' | 'codex-copied' | 'claude-copied' | 'error'
  onCopyCodex: () => void
  onCopyClaude: () => void
}

export function ExecutionHandoffPanel({
  codexPrompt,
  claudeCodePrompt,
  handoffCopyStatus,
  onCopyCodex,
  onCopyClaude
}: ExecutionHandoffPanelProps) {
  return (
    <div className="flex flex-col h-full gap-4 min-h-0">
      <div className="bg-white rounded-lg border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900/70 flex flex-col min-h-0 flex-1">
        <h3 className="text-xs uppercase font-semibold text-slate-500 tracking-wide mb-3 dark:text-slate-400 shrink-0">Codex CLI</h3>
        <div className="bg-slate-50 border border-slate-200 rounded p-2 mb-3 overflow-y-auto min-h-0 flex-1 dark:border-slate-800 dark:bg-slate-950/50">
          <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap dark:text-slate-300">{codexPrompt}</p>
        </div>
        <button
          type="button"
          onClick={onCopyCodex}
          className="w-full rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shrink-0"
        >
          {handoffCopyStatus === 'codex-copied' ? 'Copied!' : 'Copy prompt'}
        </button>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900/70 flex flex-col min-h-0 flex-1">
        <h3 className="text-xs uppercase font-semibold text-slate-500 tracking-wide mb-3 dark:text-slate-400 shrink-0">Claude Code</h3>
        <div className="bg-slate-50 border border-slate-200 rounded p-2 mb-3 overflow-y-auto min-h-0 flex-1 dark:border-slate-800 dark:bg-slate-950/50">
          <p className="text-xs text-slate-700 font-mono whitespace-pre-wrap dark:text-slate-300">{claudeCodePrompt}</p>
        </div>
        <button
          type="button"
          onClick={onCopyClaude}
          className="w-full rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white shrink-0"
        >
          {handoffCopyStatus === 'claude-copied' ? 'Copied!' : 'Copy prompt'}
        </button>
      </div>

      {handoffCopyStatus !== 'idle' && (
        <div aria-live="polite" className="p-3 rounded text-xs bg-emerald-50 border border-emerald-200 dark:border-emerald-900 dark:bg-emerald-950/20">
          {handoffCopyStatus === 'codex-copied' && (
            <p className="font-medium text-emerald-800 dark:text-emerald-200">Codex prompt copied!</p>
          )}
          {handoffCopyStatus === 'claude-copied' && (
            <p className="font-medium text-emerald-800 dark:text-emerald-200">Claude Code prompt copied!</p>
          )}
          {handoffCopyStatus === 'error' && (
            <p className="font-medium text-amber-800 dark:text-amber-200">Unable to copy. Select manually.</p>
          )}
        </div>
      )}
    </div>
  )
}
