export default function ConfigEditorToolbar({ 
  hostDisplayName, 
  viewMode, 
  setViewMode, 
  hasChanges, 
  loading, 
  saving, 
  handleUndo, 
  fetchConfig, 
  handleSave, 
  handleAddProperty 
}) {
  return (
    <div className="flex items-center justify-between px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-bk-side shadow-sm z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[6px] bg-bk-yellow/10 flex items-center justify-center text-bk-yellow border border-bk-yellow/20">
          <span className="material-symbols-outlined text-[20px]">hub</span>
        </div>
        <div>
          <h2 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">Broker Configuration</h2>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{hostDisplayName} / cubrid_broker.conf</p>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-[6px] border border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setViewMode('table')}
          className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-[6px] transition-all ${
            viewMode === 'table' 
              ? 'bg-white dark:bg-white/10 text-bk-yellow shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">table_chart</span>
          Table Editor
        </button>
        <button 
          onClick={() => setViewMode('source')}
          className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-[6px] transition-all ${
            viewMode === 'source' 
              ? 'bg-white dark:bg-white/10 text-bk-yellow shadow-sm' 
              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">code</span>
          Source View
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <button
            onClick={handleUndo}
            disabled={!hasChanges || loading || saving}
            className="px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-[6px] text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[11px] font-bold"
          >
            <span className="material-symbols-outlined text-[16px]">undo</span>
            <span>Undo</span>
          </button>
          <button
            onClick={fetchConfig}
            disabled={loading || saving}
            className="px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-[6px] text-slate-600 dark:text-slate-300 transition-all text-[11px] font-bold"
          >
            <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
            <span>Refresh</span>
          </button>
          {viewMode === 'table' && (
            <button
              onClick={handleAddProperty}
              className="px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-[6px] text-slate-600 dark:text-slate-300 transition-all text-[11px] font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">add_box</span>
              <span>Add Property</span>
            </button>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

        {hasChanges && (
          <div className="flex items-center gap-1.5 mr-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">Modified</span>
          </div>
        )}
        
        <button 
          onClick={handleSave}
          disabled={!hasChanges || saving || loading}
          className="flex items-center gap-2 px-4 py-1.5 bg-bk-yellow hover:bg-[#ffd700] disabled:opacity-50 disabled:grayscale text-bk-side text-[11px] font-bold tracking-wide rounded-[6px] transition-all shadow-md shadow-bk-yellow/10"
        >
          {saving ? (
            <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
          ) : (
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
          )}
          Save Configuration
        </button>
      </div>
    </div>
  );
}
