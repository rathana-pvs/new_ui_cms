import { useState, useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { hostApi } from '../../host/hostApi';
import { showStatusModal } from '../../layout/layoutSlice';

export default function BrokerConfigEditor({ hostUid }) {
  const dispatch = useDispatch();
  const { hosts } = useSelector((state) => state.host);
  const currentHost = hosts.find(h => h.uid === hostUid);
  const hostDisplayName = currentHost ? (currentHost.alias || currentHost.id) : 'unknown host';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'source'
  
  // Table View State
  const [sections, setSections] = useState([]); 
  const [allPropertyKeys, setAllPropertyKeys] = useState([]); 
  const [originalSections, setOriginalSections] = useState([]);
  const [originalPropertyKeys, setOriginalPropertyKeys] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ row: null, col: null });

  // Source View State
  const [rawContent, setRawContent] = useState('');
  const [originalRawContent, setOriginalRawContent] = useState('');
  const textareaRef = useRef(null);
  const preRef = useRef(null);

  const [hasChanges, setHasChanges] = useState(false);

  const parseConfig = (lines) => {
    const parsedSections = [];
    let currentSection = null;

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        currentSection = { name: trimmed, properties: {} };
        parsedSections.push(currentSection);
      } else if (currentSection && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        currentSection.properties[key.trim()] = value;
      }
    });

    // Extract section name as BROKER_NAME
    parsedSections.forEach(sec => {
      sec.properties['BROKER_NAME'] = sec.name;
    });

    const keys = new Set();
    keys.add('BROKER_NAME');
    parsedSections.forEach(sec => {
      Object.keys(sec.properties).forEach(k => {
        if (k !== 'BROKER_NAME') keys.add(k);
      });
    });

    setSections(parsedSections);
    setAllPropertyKeys(Array.from(keys));
    setOriginalSections(JSON.parse(JSON.stringify(parsedSections)));
    setOriginalPropertyKeys(Array.from(keys));
  };

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await hostApi.getHostConfig(hostUid, 'cubrid_broker.conf');
      const lines = response?.conflist?.[0]?.confdata || [];
      
      const content = lines.join('\n');
      setRawContent(content);
      setOriginalRawContent(content);
      
      parseConfig(lines);
      setHasChanges(false);
    } catch (err) {
      console.error('Failed to fetch broker config:', err);
      dispatch(showStatusModal({ 
        type: 'error', 
        title: 'Fetch failed', 
        message: 'Could not retrieve broker configuration.' 
      }));
    } finally {
      setLoading(false);
    }
  }, [hostUid, dispatch]);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleValueChange = (sectionIndex, key, newValue) => {
    const newSections = JSON.parse(JSON.stringify(sections));
    newSections[sectionIndex].properties[key] = newValue;
    
    if (key === 'BROKER_NAME') {
      newSections[sectionIndex].name = newValue;
    }
    
    setSections(newSections);
    setHasChanges(true);
  };

  const handleKeyChange = (oldKey, newKey) => {
    if (oldKey === newKey) return;
    
    // Update allPropertyKeys
    const newKeys = allPropertyKeys.map(k => k === oldKey ? newKey : k);
    setAllPropertyKeys(newKeys);

    // Update keys in sections
    const newSections = sections.map(sec => {
      const val = sec.properties[oldKey];
      const newProps = { ...sec.properties };
      delete newProps[oldKey];
      if (newKey !== "") newProps[newKey] = val;
      return { ...sec, properties: newProps };
    });
    setSections(newSections);
    setHasChanges(true);
  };

  const handleAddProperty = () => {
    const newKey = `new_property_${allPropertyKeys.length}`;
    setAllPropertyKeys([...allPropertyKeys, newKey]);
    setHasChanges(true);
    
    // Focus the new property name input
    setTimeout(() => {
      const input = document.getElementById(`property-name-${newKey}`);
      if (input) {
        input.focus();
        input.select();
      }
    }, 50);
  };

  const handleSourceChange = (e) => {
    setRawContent(e.target.value);
    setHasChanges(true);
  };

  const syncScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const handleUndo = () => {
    if (viewMode === 'table') {
      setSections(JSON.parse(JSON.stringify(originalSections)));
      setAllPropertyKeys([...originalPropertyKeys]);
    } else {
      setRawContent(originalRawContent);
    }
    setHasChanges(false);
    setSelectedCell({ row: null, col: null });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let confdata = [];
      if (viewMode === 'table') {
        sections.forEach((sec, idx) => {
          if (idx > 0) confdata.push("");
          confdata.push(sec.name);
          Object.entries(sec.properties).forEach(([key, value]) => {
            if (key === 'BROKER_NAME') return; 
            confdata.push(`${key}=${value}`);
          });
        });
      } else {
        confdata = rawContent.split('\n');
      }

      const payload = {
        confname: 'cubrid_broker.conf',
        confdata: confdata
      };

      await hostApi.setHostConfig(hostUid, payload);
      
      // Update originals after successful save
      if (viewMode === 'table') {
        setOriginalSections(JSON.parse(JSON.stringify(sections)));
        setOriginalPropertyKeys([...allPropertyKeys]);
        setOriginalRawContent(confdata.join('\n'));
        setRawContent(confdata.join('\n'));
      } else {
        setOriginalRawContent(rawContent);
        setOriginalSections(JSON.parse(JSON.stringify(sections))); // Note: this might be out of sync if saved from source
        setOriginalPropertyKeys([...allPropertyKeys]);
        // Re-parse to sync table if we were in source
        parseConfig(confdata);
      }

      setHasChanges(false);
      dispatch(showStatusModal({ 
        type: 'success', 
        title: 'Config saved', 
        message: 'Broker configuration updated successfully.' 
      }));
    } catch (err) {
      dispatch(showStatusModal({ 
        type: 'error', 
        title: 'Save failed', 
        message: 'An error occurred while saving broker configuration.' 
      }));
    } finally {
      setSaving(false);
    }
  };

  const renderHighlightedContent = () => {
    return rawContent.split('\n').map((line, i) => {
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
      <div className="flex items-center justify-between px-6 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-bk-side shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleUndo}
              disabled={!hasChanges || loading || saving}
              className="px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-md text-slate-600 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-[11px] font-bold" 
            >
              <span className="material-symbols-outlined text-[16px]">undo</span>
              <span>Undo</span>
            </button>
            {viewMode === 'table' && (
              <button 
                onClick={handleAddProperty}
                className="px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-md text-slate-600 dark:text-slate-300 transition-all text-[11px] font-bold"
              >
                <span className="material-symbols-outlined text-[16px]">add_box</span>
                <span>Add Property</span>
              </button>
            )}
            <button 
              onClick={fetchConfig}
              disabled={loading || saving}
              className="px-3 py-1.5 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-md text-slate-600 dark:text-slate-300 transition-all text-[11px] font-bold"
            >
              <span className={`material-symbols-outlined text-[16px] ${loading ? 'animate-spin' : ''}`}>refresh</span>
              <span>Refresh</span>
            </button>
          </div>
          
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>

          <div>
            <h2 className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight">Broker Configuration</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{hostDisplayName} / cubrid_broker.conf</p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
          <button 
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
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
            className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold rounded-md transition-all ${
              viewMode === 'source' 
                ? 'bg-white dark:bg-white/10 text-bk-yellow shadow-sm' 
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">code</span>
            Source View
          </button>
        </div>

        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Unsaved
            </span>
          )}
          

          <button 
            onClick={handleSave}
            disabled={!hasChanges || saving || loading}
            className="flex items-center gap-2 px-4 py-1.5 bg-bk-yellow hover:bg-[#ffd700] disabled:opacity-50 disabled:grayscale text-bk-side text-[11px] font-bold tracking-wide rounded-md transition-all shadow-md shadow-bk-yellow/10"
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

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col relative bg-slate-100 dark:bg-black/20">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div>
            <span className="text-xs font-bold text-slate-600 dark:text-bk-yellow uppercase tracking-widest">Loading...</span>
          </div>
        ) : (
          viewMode === 'table' ? (
            <div className="flex-1 overflow-auto p-4">
              <div className="inline-block min-w-full align-middle font-sans">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-[#1a1c1e] shadow-xl overflow-hidden">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-white/5 text-[11px] text-slate-500 dark:text-slate-400">
                        <th className="px-4 py-2 text-left border border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider w-64 bg-slate-100/50 dark:bg-black/40">
                          Property name
                        </th>
                        {sections.map((sec, idx) => (
                          <th key={idx} className="px-4 py-2 text-left border border-slate-200 dark:border-slate-800 font-bold uppercase tracking-wider min-w-[200px] bg-slate-100/50 dark:bg-black/40">
                            Broker#{idx}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-[#1a1c1e]">
                      {allPropertyKeys.map((key, rowIdx) => (
                        <tr 
                          key={rowIdx} 
                          className={`text-[12px] group transition-colors ${
                            (selectedCell.row === rowIdx) ? 'bg-emerald-500/5' : 'odd:bg-white dark:odd:bg-[#1a1c1e] even:bg-slate-50/30 dark:even:bg-white/[0.02]'
                          }`}
                        >
                          <td className={`p-0 border border-slate-200 dark:border-slate-800 font-bold ${
                            key === 'BROKER_NAME' ? 'bg-slate-50/50 dark:bg-black/20' : ''
                          }`}>
                            {key === 'BROKER_NAME' ? (
                              <div className="px-4 py-1.5 text-blue-600 dark:text-blue-400 flex items-center gap-2">
                                 <span className="material-symbols-outlined text-[14px]">label_important</span>
                                 {key}
                              </div>
                            ) : (
                              <input 
                                id={`property-name-${key}`}
                                type="text"
                                value={key}
                                onChange={(e) => handleKeyChange(key, e.target.value)}
                                className="w-full px-4 py-1.5 bg-transparent outline-none text-slate-700 dark:text-slate-300 font-bold transition-all"
                                placeholder="Property Name"
                              />
                            )}
                          </td>
                          {sections.map((sec, colIdx) => {
                            const isSelected = selectedCell.row === rowIdx && selectedCell.col === colIdx;
                            const currentValue = sec.properties[key] || '';
                            const isBoolean = ['ON', 'OFF'].includes(currentValue.toUpperCase());
                            
                            return (
                              <td 
                                key={colIdx} 
                                onClick={() => setSelectedCell({ row: rowIdx, col: colIdx })}
                                className={`p-0 border border-slate-200 dark:border-slate-800 relative ${
                                    isSelected ? 'bg-emerald-500/10' : ''
                                }`}
                              >
                                {isBoolean ? (
                                  <select 
                                    value={currentValue.toUpperCase()}
                                    onChange={(e) => handleValueChange(colIdx, key, e.target.value)}
                                    className={`w-full px-4 py-1.5 bg-transparent outline-none transition-all appearance-none cursor-pointer font-bold ${
                                        isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-400'
                                    }`}
                                  >
                                    <option value="ON" className="bg-white dark:bg-bk-side text-emerald-600">ON</option>
                                    <option value="OFF" className="bg-white dark:bg-bk-side text-rose-600">OFF</option>
                                  </select>
                                ) : (
                                  <input 
                                    type="text"
                                    value={currentValue}
                                    onChange={(e) => handleValueChange(colIdx, key, e.target.value)}
                                    className={`w-full px-4 py-1.5 bg-transparent outline-none transition-all ${
                                        isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-400'
                                    } ${key === 'BROKER_NAME' ? 'text-blue-600 dark:text-blue-400 font-bold italic' : ''}`}
                                  />
                                )}
                                {isSelected && (
                                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-emerald-500"></div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 relative p-4 bg-slate-100 dark:bg-black/20">
              <div className="h-full w-full bg-white dark:bg-[#1a1c1e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
                <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-slate-800/50">
                   <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 font-mono tracking-tight uppercase">cubrid_broker.conf</span>
                </div>
                
                <div className="flex-1 relative overflow-hidden">
                  <pre 
                    ref={preRef}
                    className="absolute inset-0 p-5 font-mono text-[13px] leading-relaxed text-slate-800 dark:text-slate-300 pointer-events-none whitespace-pre-wrap break-all overflow-hidden"
                    aria-hidden="true"
                  >
                    {renderHighlightedContent()}
                  </pre>

                  <textarea 
                    ref={textareaRef}
                    value={rawContent}
                    onChange={handleSourceChange}
                    onScroll={syncScroll}
                    spellCheck="false"
                    className="absolute inset-0 w-full h-full bg-transparent p-5 font-mono text-[13px] leading-relaxed text-transparent caret-slate-800 dark:caret-bk-yellow outline-none resize-none custom-scrollbar whitespace-pre-wrap break-all overflow-auto"
                    placeholder="# Enter broker configuration here..."
                  />
                </div>

                <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between">
                   <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Comments are preserved in Source View</span>
                   <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono text-right">Lines: {rawContent.split('\n').length}</span>
                </div>
              </div>
            </div>
          )
        )}
      </div>
      
      {/* Bottom hint bar */}
      <div className="px-4 py-1.5 bg-white dark:bg-bk-side border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-500 font-medium">
         <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Section Identifier</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active Cell</span>
         </div>
         <div>Displaying {sections.length} brokers found in configuration</div>
      </div>
    </div>
  );
}
