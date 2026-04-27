export function ExecutionFlowPreview() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 dark:border-slate-800 dark:bg-slate-900/70">
      <h3 className="text-xs uppercase font-semibold text-slate-500 tracking-wide mb-3 dark:text-slate-400">Execution States</h3>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
        {[
          ['pending', 'bg-slate-400'],
          ['active', 'bg-blue-500'],
          ['done', 'bg-emerald-500'],
          ['blocked', 'bg-amber-500'],
          ['failed', 'bg-red-500'],
          ['verified', 'bg-emerald-600'],
          ['paused', 'bg-slate-500']
        ].map(([label, dotClass]) => (
          <div key={label} className="flex items-center gap-2 px-2 py-1.5 rounded text-xs bg-slate-50 border border-slate-200 dark:border-slate-800 dark:bg-slate-950/50">
            <div className={`w-1.5 h-1.5 rounded-full ${dotClass} flex-shrink-0`} />
            <div className="font-medium text-slate-900 dark:text-slate-50 truncate">{label}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-600 mt-3 dark:text-slate-400">Load a plan to see task progress here.</p>
    </div>
  )
}
