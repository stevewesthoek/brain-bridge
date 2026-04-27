import type { ActiveSourcesMode, WriteMode } from '@buildflow/shared'

type ActiveContextPanelProps = {
  activeMode: ActiveSourcesMode
  writeMode: WriteMode
  activeSourceIds: string[]
  onSetMode: (mode: ActiveSourcesMode) => void
  onSetWriteMode: (mode: WriteMode) => void
}

export function ActiveContextPanel({
  activeMode,
  writeMode,
  activeSourceIds,
  onSetMode,
  onSetWriteMode
}: ActiveContextPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900 mb-4">Active Context</h2>
      <div className="flex flex-wrap gap-2 mb-4">
        <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeMode === 'single' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => onSetMode('single')} type="button">single</button>
        <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeMode === 'multi' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => onSetMode('multi')} type="button">multi</button>
        <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${activeMode === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => onSetMode('all')} type="button">all</button>
      </div>
      <div className="text-xs text-slate-600 mb-2">
        Enabled sources show their index status. Use Reindex after enabling a source before expecting search results.
      </div>
      <div className="text-xs text-slate-500 mb-4">Active source ids: {activeSourceIds.length > 0 ? activeSourceIds.join(', ') : 'all enabled sources'}</div>
      <div className="border-t border-slate-200 pt-4">
        <h3 className="text-xs font-semibold text-slate-900 mb-3 uppercase tracking-wide">Write Mode</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${writeMode === 'readOnly' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => onSetWriteMode('readOnly')}>readOnly</button>
          <button type="button" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${writeMode === 'artifactsOnly' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => onSetWriteMode('artifactsOnly')}>artifactsOnly</button>
          <button type="button" className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${writeMode === 'safeWrites' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`} onClick={() => onSetWriteMode('safeWrites')}>safeWrites</button>
        </div>
      </div>
    </div>
  )
}

