import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeImportExportModal, addHost } from '../hostSlice';
import { showStatusModal } from '../../layout/layoutSlice';
import { exportHostsToXml, parseHostsXml } from '../hostImportExport';

export default function ImportExportHostModal() {
  const dispatch = useDispatch();
  const { isImportExportModalOpen, importExportMode, hosts } = useSelector((state) => state.host);
  const [selectedHosts, setSelectedHosts] = useState([]);
  const [importList, setImportList] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState('export_servers');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isImportExportModalOpen) {
      if (importExportMode === 'export') {
        setImportList(hosts);
        setSelectedHosts(hosts.map(h => h.uid));
      } else {
        setImportList([]);
        setSelectedHosts([]);
        // Trigger file selection for import mode automatically or show a placeholder?
        // D-CMS shows a "Browse" button first.
      }
    }
  }, [isImportExportModalOpen, importExportMode, hosts]);

  if (!isImportExportModalOpen) return null;

  const handleToggleHost = (uid) => {
    setSelectedHosts(prev => 
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const handleToggleAll = () => {
    const selectable = importList.filter(h => !h.isDuplicate);
    if (selectedHosts.length === selectable.length) {
      setSelectedHosts([]);
    } else {
      setSelectedHosts(selectable.map(h => h.uid));
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const xmlString = event.target.result;
        const parsed = parseHostsXml(xmlString);
        
        // Map and identify duplicates
        const listWithStatus = parsed.map(h => {
          const isDuplicate = hosts.find(existing => 
            existing.address === h.address && String(existing.port) === String(h.port)
          );
          return {
            ...h,
            uid: h.address + ':' + h.port + ':' + h.id, // Temporary key
            isDuplicate: !!isDuplicate
          };
        });

        setImportList(listWithStatus);
        // Default select only non-duplicates
        setSelectedHosts(listWithStatus.filter(h => !h.isDuplicate).map(h => h.uid));
      } catch (err) {
        dispatch(showStatusModal({ 
          type: 'error', 
          title: 'Import Error', 
          message: err.message || 'An error occurred while parsing the file.' 
        }));
        // Reset input
        e.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleAction = async () => {
    if (selectedHosts.length === 0) return;

    setIsProcessing(true);
    try {
      if (importExportMode === 'export') {
        const hostsToExport = hosts.filter(h => selectedHosts.includes(h.uid));
        const finalFileName = `${fileName || 'export_servers'}.xml`;
        exportHostsToXml(hostsToExport, finalFileName);
        dispatch(closeImportExportModal());
      } else {
        const hostsToImport = importList.filter(h => selectedHosts.includes(h.uid));
        let addedCount = 0;
        let skippedCount = 0;

        for (const hostData of hostsToImport) {
          const isDuplicate = hosts.find(h => h.address === hostData.address && String(h.port) === String(hostData.port));
          if (isDuplicate) {
            skippedCount++;
            continue;
          }
          
          try {
            await dispatch(addHost({ ...hostData, port: Number(hostData.port) })).unwrap();
            addedCount++;
          } catch (err) {
            skippedCount++;
          }
        }

        dispatch(showStatusModal({ 
          type: 'success', 
          title: 'Import Result', 
          message: `Imported ${addedCount} hosts successfully. ${skippedCount} items were skipped.` 
        }));
        dispatch(closeImportExportModal());
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const title = importExportMode === 'export' ? 'Export Hosts' : 'Import Hosts';
  const actionLabel = importExportMode === 'export' ? 'Export' : 'Import';
  const icon = importExportMode === 'export' ? 'file_upload' : 'file_download';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-bk-side w-full max-w-[640px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-2xl">{icon}</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-tight tracking-tight">{title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                {importExportMode === 'export' 
                  ? 'Export hosts to XML file. Note: The passwords are not included.' 
                  : 'Import hosts from XML file.'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => dispatch(closeImportExportModal())}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-white/5 transition-colors text-slate-400 dark:text-slate-500 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {importExportMode === 'import' && importList.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-bk-main/30 flex items-center justify-center mb-4 border border-dashed border-slate-200 dark:border-slate-800">
                <span className="material-symbols-outlined text-slate-300 dark:text-slate-700 text-3xl">upload_file</span>
              </div>
              <h4 className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">No file selected</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">Select an XML file containing host connections exported from CUBRID Admin.</p>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="mt-6 px-6 py-2 bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-bk-side text-[11px] font-bold rounded-lg transition-all"
              >
                Browse Files
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".xml" 
                className="hidden" 
              />
            </div>
          )}

          {(importExportMode === 'export' || importList.length > 0) && (
            <>
              <div className="px-5 py-3 bg-slate-50/50 dark:bg-bk-main/20 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div 
                    onClick={handleToggleAll}
                    style={{ pointerEvents: importList.every(h => h.isDuplicate) ? 'none' : 'auto' }}
                    className={`w-4 h-4 rounded border flex items-center justify-center cursor-pointer hover:border-bk-yellow transition-colors ${importList.every(h => h.isDuplicate) ? 'opacity-30 border-slate-300' : 'border-slate-300 dark:border-slate-600'}`}
                  >
                    {selectedHosts.length > 0 && selectedHosts.length === importList.filter(h => !h.isDuplicate).length && (
                      <div className="w-2.5 h-2.5 bg-bk-yellow rounded-[1px]"></div>
                    )}
                    {selectedHosts.length > 0 && selectedHosts.length < importList.filter(h => !h.isDuplicate).length && (
                      <div className="w-2 h-[2px] bg-bk-yellow rounded-[1px]"></div>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">SELECT ALL</span>
                </div>
                <span className="text-[10px] font-bold text-bk-yellow bg-bk-yellow/10 px-2 py-0.5 rounded-full">
                  {selectedHosts.length} SELECTED
                </span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-white dark:bg-bk-side z-10 shadow-sm">
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="w-12"></th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Name</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap">Address</th>
                      <th className="px-4 py-2.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest whitespace-nowrap pr-8">Port</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importList.map((host) => {
                      const id = host.uid || host.address + host.port + host.id;
                      const isSelected = selectedHosts.includes(id);
                      const isDuplicate = host.isDuplicate;

                      return (
                        <tr 
                          key={id} 
                          onClick={() => !isDuplicate && handleToggleHost(id)}
                          className={`group border-b border-slate-50 dark:border-slate-800/50 transition-colors ${isSelected ? 'bg-bk-yellow/[0.03]' : ''} ${isDuplicate ? 'opacity-[0.85] cursor-not-allowed bg-slate-50/10' : 'cursor-pointer hover:bg-slate-50/80 dark:hover:bg-white/[0.02]'}`}
                        >
                          <td className="w-12 pl-5 py-3">
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isDuplicate ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-slate-800' : isSelected ? 'border-bk-yellow bg-bk-yellow/10' : 'border-slate-300 dark:border-slate-700 group-hover:border-slate-400'}`}>
                              {isSelected && !isDuplicate && <span className="material-symbols-outlined text-[14px] text-bk-yellow font-bold">check</span>}
                              {isDuplicate && <span className="material-symbols-outlined text-[14px] text-slate-400 dark:text-slate-500">lock</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-[12px] font-bold tracking-tight transition-colors ${isDuplicate ? 'text-slate-400 dark:text-slate-500' : isSelected ? 'text-bk-yellow' : 'text-slate-700 dark:text-slate-300'}`}>
                                {host.alias || 'Unnamed'}
                              </span>
                              {isDuplicate && (
                                <span className="text-[9px] font-bold bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                                  <span className="w-1 h-1 rounded-full bg-slate-400"></span>
                                  Already Exists
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium tabular-nums lowercase">
                            {host.address}
                          </td>
                          <td className="px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium tabular-nums">
                            {host.port}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-bk-main/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {importExportMode === 'import' && importList.length > 0 && (
              <button 
                onClick={() => { setImportList([]); setSelectedHosts([]); }}
                className="px-4 py-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">change_circle</span>
                Change File
              </button>
            )}
            {importExportMode === 'export' && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">FILENAME:</span>
                <div className="flex items-center bg-white dark:bg-bk-main/50 border border-slate-200 dark:border-slate-800 rounded focus-within:border-bk-yellow transition-colors overflow-hidden">
                  <input 
                    type="text"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="export_servers"
                    className="bg-transparent px-3 py-1 text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none w-36 font-medium"
                  />
                  <div className="px-2 py-1 bg-slate-100 dark:bg-white/5 border-l border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 dark:text-slate-500">
                    .XML
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => dispatch(closeImportExportModal())}
              className="px-5 py-2 text-[11px] font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-all shadow-sm active:scale-95"
            >
              Cancel
            </button>
            <button 
              disabled={selectedHosts.length === 0 || isProcessing}
              onClick={handleAction}
              className={`px-8 py-2 bg-bk-yellow text-bk-side text-[11px] font-bold rounded-lg transition-all flex items-center gap-2 shadow-sm ${selectedHosts.length === 0 || isProcessing ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98] hover:shadow-md'}`}
            >
              {isProcessing ? (
                <div className="w-3.5 h-3.5 border-2 border-bk-side/20 border-t-bk-side rounded-full animate-spin"></div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">{icon === 'file_upload' ? 'bolt' : icon}</span>
                  <span>{actionLabel}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
