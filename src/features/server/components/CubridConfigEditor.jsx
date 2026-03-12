import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hostApi } from '../../host/hostApi';
import { showStatusModal } from '../../layout/layoutSlice';

export default function CubridConfigEditor({ hostUid, confname }) {
  const dispatch = useDispatch();
  const { hosts } = useSelector((state) => state.host);
  const currentHost = hosts.find(h => h.uid === hostUid);
  const hostDisplayName = currentHost ? (currentHost.alias || currentHost.id) : 'unknown host';
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const textareaRef = useRef(null);
  const preRef = useRef(null);

  const fetchConfig = useCallback(async () => {
    if (!hostUid || !confname) return;
    setLoading(true);
    try {
      const response = await hostApi.getHostConfig(hostUid, confname);
      const lines = response?.conflist?.[0]?.confdata || [];
      setContent(lines.join('\n'));
      setOriginalContent(lines.join('\n'));
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to fetch config:', err);
      dispatch(showStatusModal({ 
        type: 'error', 
        title: 'Fetch failed', 
        message: 'Could not retrieve configuration file contents.' 
      }));
    } finally {
      setLoading(false);
    }
  }, [hostUid, confname, dispatch]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  const syncScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const handleUndo = () => {
    setContent(originalContent);
    setHasChanges(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        confname: confname,
        confdata: content.split('\n')
      };
      await hostApi.setHostConfig(hostUid, payload);
      setOriginalContent(content);
      setHasChanges(false);
      dispatch(showStatusModal({ 
        type: 'success', 
        title: 'Config saved', 
        message: 'The configuration file has been updated successfully.' 
      }));
    } catch (err) {
      console.error('Failed to save config:', err);
      dispatch(showStatusModal({ 
        type: 'error', 
        title: 'Save failed', 
        message: err.response?.data?.message || err.response?.data?.error || 'An error occurred while saving the configuration.' 
      }));
    } finally {
      setSaving(false);
    }
  };

  const renderHighlightedContent = () => {
    return content.split('\n').map((line, i) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('#')) {
        return <span key={i} className="text-slate-400 dark:text-slate-500 italic opacity-80">{line}{'\n'}</span>;
      }
      if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
        return <span key={i} className="text-bk-yellow font-medium">{line}{'\n'}</span>;
      }
      return <span key={i}>{line}{'\n'}</span>;
    });
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 dark:bg-bk-main overflow-hidden font-sans">
      {/* ToolBar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-bk-side">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
            <span className="material-symbols-outlined text-bk-yellow text-xl">settings_applications</span>
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-900 dark:text-white leading-none">Editing {confname}</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{hostDisplayName}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-[11px] font-medium text-amber-500 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              Unsaved changes
            </span>
          )}

          <div className="flex items-center gap-2">
            <button 
              onClick={handleUndo}
              disabled={!hasChanges || loading || saving}
              className="px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-md text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[11px] font-bold" 
            >
              <span className="material-symbols-outlined text-[16px]">undo</span>
              <span>Undo</span>
            </button>
            <button 
              onClick={fetchConfig}
              disabled={loading || saving}
              className="px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-md text-slate-600 dark:text-slate-300 transition-all text-[11px] font-bold"
            >
              <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
              <span>Refresh</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-slate-800"></div>

          <button 
            onClick={handleSave}
            disabled={!hasChanges || saving || loading}
            className="px-4 py-1.5 bg-bk-yellow hover:bg-[#ffd700] disabled:opacity-50 disabled:grayscale text-bk-side text-[11px] font-medium tracking-wide rounded-md transition-all flex items-center gap-2 shadow-sm"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-[18px]">save</span>
            )}
            <span>Save Config</span>
          </button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 relative overflow-hidden bg-slate-900/5 dark:bg-black/20 p-4">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50/50 dark:bg-bk-main/50 backdrop-blur-sm z-10 transition-all">
             <div className="w-10 h-10 border-4 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div>
             <span className="text-xs font-medium text-slate-600 dark:text-bk-yellow">Loading configuration...</span>
          </div>
        ) : (
          <div className="h-full w-full bg-white dark:bg-[#1a1c1e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
            <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800/50">
               <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-mono tracking-tight uppercase">{confname}.conf</span>
            </div>
            
            <div className="flex-1 relative overflow-hidden">
              {/* Syntax Highlighting Layer */}
              <pre 
                ref={preRef}
                className="absolute inset-0 p-5 font-mono text-[13px] leading-relaxed text-slate-800 dark:text-slate-300 pointer-events-none whitespace-pre-wrap break-all overflow-hidden"
                aria-hidden="true"
              >
                {renderHighlightedContent()}
              </pre>

              {/* Editing Layer */}
              <textarea 
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onScroll={syncScroll}
                spellCheck="false"
                className="absolute inset-0 w-full h-full bg-transparent p-5 font-mono text-[13px] leading-relaxed text-transparent caret-slate-800 dark:caret-bk-yellow outline-none resize-none custom-scrollbar whitespace-pre-wrap break-all overflow-auto"
                placeholder="# Enter configuration variables here..."
              />
            </div>

            <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
               <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">UTF-8 | LF</span>
               <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Lines: {content.split('\n').length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
