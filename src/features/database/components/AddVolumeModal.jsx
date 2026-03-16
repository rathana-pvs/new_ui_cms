import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeAddVolumeModal, addVolume } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import { showStatusModal } from '../../layout/layoutSlice';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

const PurposeSelect = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const options = [
    { value: 'data', label: 'Data', icon: 'database', desc: 'Storage for user tables' },
    { value: 'index', label: 'Index', icon: 'list_alt', desc: 'B-tree index storage' },
    { value: 'generic', label: 'Generic', icon: 'full_stacked_bar_chart', desc: 'Balanced storage type' },
    { value: 'temp', label: 'Temporary', icon: 'timer', desc: 'Sort/query workspace' },
  ];

  const selected = options.find(opt => opt.value === value) || options[2];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-9 px-3 flex items-center justify-between bg-white dark:bg-bk-main/40 border border-slate-200 dark:border-slate-800/50 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none hover:border-bk-yellow/50 transition-all group"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-bk-yellow/80">{selected.icon}</span>
          <span>{selected.label}</span>
        </div>
        <span className={`material-symbols-outlined text-[16px] text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>expand_more</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                className={`w-full px-3 py-2.5 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group ${value === opt.value ? 'bg-bk-yellow/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded flex items-center justify-center border ${value === opt.value ? 'bg-bk-yellow/10 border-bk-yellow/20' : 'bg-slate-50 dark:bg-bk-main/50 border-slate-100 dark:border-slate-800'}`}>
                    <span className={`material-symbols-outlined text-[16px] ${value === opt.value ? 'text-bk-yellow' : 'text-slate-400'}`}>{opt.icon}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-[11px] font-medium ${value === opt.value ? 'text-bk-yellow' : 'text-slate-700 dark:text-slate-300'}`}>{opt.label}</span>
                    <span className="text-[9px] text-slate-400 leading-tight">{opt.desc}</span>
                  </div>
                </div>
                {value === opt.value && (
                  <span className="material-symbols-outlined text-[14px] text-bk-yellow">check</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function AddVolumeModal() {
  const dispatch = useDispatch();
  const { isAddVolumeModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);

  const [volStatus, setVolStatus] = useState({ freespace: '', volpath: '' });
  const [volName, setVolName] = useState('');
  const [purpose, setPurpose] = useState('generic');
  const [path, setPath] = useState('');
  const [numberOfPages, setNumberOfPages] = useState('32768'); // Default 512MB
  const [sizeMB, setSizeMB] = useState('512.000');
  
  const [loading, setLoading] = useState(false);
  const [fetchingStatus, setFetchingStatus] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAddVolumeModalOpen && selectedHostUid && selectedDatabase) {
      const fetchStatus = async () => {
        setFetchingStatus(true);
        setError(null);
        try {
          const response = await databaseApi.getAddVolStatus(selectedHostUid, selectedDatabase);
          setVolStatus(response);
          setPath(response.volpath || '');
        } catch (err) {
          console.error('Failed to fetch add volume status:', err);
        } finally {
          setFetchingStatus(false);
        }
      };
      fetchStatus();
      
      // Reset form
      setVolName('');
      setPurpose('generic');
      setNumberOfPages('32768');
      setSizeMB('512.000');
    }
  }, [isAddVolumeModalOpen, selectedHostUid, selectedDatabase]);


  if (!isAddVolumeModalOpen) return null;

  const handleAdd = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    
    setLoading(true);
    setError(null);
    try {
      const payload = {
        volname: volName,
        purpose,
        path,
        numberofpages: numberOfPages,
        size_need_mb: `${sizeMB}(MB)`
      };
      
      await dispatch(addVolume({ 
        hostUid: selectedHostUid, 
        dbname: selectedDatabase, 
        payload 
      })).unwrap();
      
      dispatch(showStatusModal({
        type: 'success',
        title: 'Volume added',
        message: `Successfully added "${purpose}" volume to ${selectedDatabase}.`
      }));
    } catch (err) {
      setError(err || 'Failed to add volume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[460px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        <LoadingOverlay 
            isVisible={loading} 
            title="Adding volume" 
            subtitle="Allocating disk space and attaching to database..." 
        />
        <ErrorOverlay 
          isVisible={!!error} 
          error={error} 
          onRetry={handleAdd}
          onClose={() => setError(null)}
        />

        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">add_to_drive</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">Add database volume</h3>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={() => dispatch(closeAddVolumeModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 flex-1 overflow-y-auto max-h-[70vh]">
          {/* Section: current Status */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Storage status</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Free disk space</label>
                <div className="h-9 px-3 flex items-center bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {fetchingStatus ? 'Calculating...' : (volStatus.freespace || 'Unknown')}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Database</label>
                <div className="h-9 px-3 flex items-center bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[11px] font-medium text-slate-600 dark:text-slate-300">
                  {selectedDatabase}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Configuration */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Allocation parameters</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="space-y-3">
               <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Volume purpose</label>
                    <PurposeSelect value={purpose} onChange={setPurpose} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Volume name (optional)</label>
                    <input 
                      type="text"
                      value={volName}
                      onChange={(e) => setVolName(e.target.value)}
                      placeholder="e.g. data_vol_1"
                      className="w-full h-9 px-3 bg-white dark:bg-bk-main/40 border border-slate-200 dark:border-slate-800/50 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-bk-yellow/50 transition-colors"
                    />
                  </div>
               </div>

               <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Storage path</label>
                <input 
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="/path/to/volume/storage"
                  className="w-full h-9 px-3 bg-white dark:bg-bk-main/40 border border-slate-200 dark:border-slate-800/50 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-bk-yellow/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Volume size (MB)</label>
                    <input 
                      type="number"
                      value={sizeMB}
                      onChange={(e) => {
                        const mb = e.target.value;
                        setSizeMB(mb);
                        const pages = Math.floor((parseFloat(mb) || 0) * 1024 / 16);
                        setNumberOfPages(pages.toString());
                      }}
                      className="w-full h-9 px-3 bg-white dark:bg-bk-main/40 border border-slate-200 dark:border-slate-800/50 rounded text-[11px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-bk-yellow/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Calculated pages</label>
                    <div className="h-9 px-3 flex items-center bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[11px] font-medium text-bk-yellow">
                      {numberOfPages} pages
                    </div>
                  </div>
              </div>
            </div>

            <div className="p-3 bg-bk-yellow/5 border border-bk-yellow/10 rounded-lg">
              <div className="flex gap-2.5 items-start">
                <span className="material-symbols-outlined text-bk-yellow text-sm mt-0.5">info</span>
                <div className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                  Dynamic volume management allows scaling storage without taking the database offline. Ensure target path is writable by CUBRID service.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            disabled={loading}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={() => dispatch(closeAddVolumeModal())}
          >
            Discard
          </button>
          <button 
            disabled={loading || !path || !numberOfPages}
            className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-50"
            onClick={handleAdd}
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">add_to_drive</span>
                <span>Add volume</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
