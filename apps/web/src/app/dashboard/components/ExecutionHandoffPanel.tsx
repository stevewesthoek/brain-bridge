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
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 overflow-hidden flex flex-col max-h-full">
      <h2 className="text-base font-semibold text-slate-900 mb-2 dark:text-slate-50 shrink-0">Execution Handoff</h2>
      <p className="text-slate-600 text-sm mb-4 dark:text-slate-300 shrink-0">
        Copy-ready prompts for Codex CLI or Claude Code.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3 shrink-0">
        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50 flex flex-col min-h-0">
          <h3 className="text-sm font-semibold text-slate-900 mb-2 dark:text-slate-50 shrink-0">Codex CLI</h3>
          <div className="bg-white border border-slate-200 rounded p-2 mb-2 overflow-y-auto flex-1 min-h-0 dark:border-slate-800 dark:bg-slate-950">
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

        <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/50 flex flex-col min-h-0">
          <h3 className="text-sm font-semibold text-slate-900 mb-2 dark:text-slate-50 shrink-0">Claude Code</h3>
          <div className="bg-white border border-slate-200 rounded p-2 mb-2 overflow-y-auto flex-1 min-h-0 dark:border-slate-800 dark:bg-slate-950">
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
      </div>

      {handoffCopyStatus !== 'idle' && (
        <div aria-live="polite" className="mb-3 p-2 rounded text-xs bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950/50 shrink-0">
          {handoffCopyStatus === 'codex-copied' && (
            <p className="font-medium text-emerald-700 dark:text-emerald-300">Codex prompt copied!</p>
          )}
          {handoffCopyStatus === 'claude-copied' && (
            <p className="font-medium text-emerald-700 dark:text-emerald-300">Claude Code prompt copied!</p>
          )}
          {handoffCopyStatus === 'error' && (
            <p className="font-medium text-amber-700 dark:text-amber-300">Unable to copy. Select manually.</p>
          )}
        </div>
      )}

      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <p className="text-xs text-slate-600 dark:text-slate-400">
          Copy the prompt and run: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono dark:bg-slate-800 dark:text-slate-200">codex [prompt]</code>
        </p>
      </div>
    </div>
  )
}
