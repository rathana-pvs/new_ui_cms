import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeSetAutomationVolumeModal, fetchAutoVolumeConfig, updateAutoVolumeConfig } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';

export default function SetAutomationVolumeModal() {
  const dispatch = useDispatch();
  const { isSetAutomationVolumeModalOpen, selectedDatabase, autoVolumeConfig, autoVolumeLoading } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  // Data Settings
  const [dataEnabled, setDataEnabled] = useState(false);
  const [dataThreshold, setDataThreshold] = useState(15);
  const [dataAddSize, setDataAddSize] = useState(2048);
  
  // Index Settings
  const [indexEnabled, setIndexEnabled] = useState(false);
  const [indexThreshold, setIndexThreshold] = useState(15);
  const [indexAddSize, setIndexAddSize] = useState(2048);

  useEffect(() => {
    if (isSetAutomationVolumeModalOpen && selectedHostUid && selectedDatabase) {
      dispatch(fetchAutoVolumeConfig({ hostUid: selectedHostUid, dbname: selectedDatabase }));
    }
  }, [isSetAutomationVolumeModalOpen, selectedHostUid, selectedDatabase, dispatch]);

  useEffect(() => {
    const config = autoVolumeConfig[selectedDatabase];
    if (config) {
      setDataEnabled(config.data === 'ON');
      setDataThreshold(config.data_warn_outofspace ? Math.round(parseFloat(config.data_warn_outofspace) * 100) : 15);
      setDataAddSize(config.data_ext_page ? (parseInt(config.data_ext_page) * 16384 / 1024 / 1024) : 2048);
      
      setIndexEnabled(config.index === 'ON');
      setIndexThreshold(config.index_warn_outofspace ? Math.round(parseFloat(config.index_warn_outofspace) * 100) : 15);
      setIndexAddSize(config.index_ext_page ? (parseInt(config.index_ext_page) * 16384 / 1024 / 1024) : 2048);
    }
  }, [autoVolumeConfig, selectedDatabase]);


  if (!isSetAutomationVolumeModalOpen) return null;

  const handleSave = async () => {
    const payload = {
      data: dataEnabled ? 'ON' : 'OFF',
      data_warn_outofspace: (dataThreshold / 100).toFixed(2),
      data_ext_page: Math.floor(dataAddSize * 1024 * 1024 / 16384).toString(),
      index: indexEnabled ? 'ON' : 'OFF',
      index_warn_outofspace: (indexThreshold / 100).toFixed(2),
      index_ext_page: Math.floor(indexAddSize * 1024 * 1024 / 16384).toString()
    };

    const result = await dispatch(updateAutoVolumeConfig({ 
      hostUid: selectedHostUid, 
      dbname: selectedDatabase, 
      payload 
    }));


    if (!result.error) {
      dispatch(closeSetAutomationVolumeModal());
      dispatch(showStatusModal({
        type: 'success',
        title: 'Policy Applied',
        message: `Automation policies for ${selectedDatabase} have been successfully updated.`
      }));
    }
  };

  const ConfigGroup = ({ title, icon, enabled, setEnabled, threshold, setThreshold, addSize, setAddSize, pages }) => (
    <div className="space-y-4 p-4 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-bk-yellow text-lg">{icon}</span>
          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="sr-only peer" />
          <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-bk-yellow"></div>
        </label>
      </div>

      <div className={`space-y-4 transition-all duration-300 ${enabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Trigger threshold (%)</label>
            <span className="text-[11px] font-bold text-bk-yellow">{threshold}%</span>
          </div>
          <input 
            type="range" min="5" max="30" step="1"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            className="w-full accent-bk-yellow h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Expansion size (MB)</label>
            <div className="relative">
              <input 
                type="number" value={addSize}
                onChange={(e) => setAddSize(e.target.value)}
                className="w-full h-8 px-3 pr-10 bg-white dark:bg-bk-side border border-slate-200 dark:border-slate-800 rounded text-[11px] font-medium text-slate-700 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-bk-yellow/50"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 uppercase">MB</span>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Extension pages</label>
            <div className="h-8 px-3 flex items-center bg-slate-100 dark:bg-bk-main/40 border border-slate-200 dark:border-slate-800/50 rounded text-[11px] font-medium text-slate-500 dark:text-slate-400 italic">
              {Math.floor(addSize * 1024 * 1024 / 16384)} pts
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[480px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left">
        
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">settings_suggest</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">Set automation volume</h3>
              <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-widest font-bold">{selectedDatabase}</p>
            </div>
          </div>
          <button onClick={() => dispatch(closeSetAutomationVolumeModal())} className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group">
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4 flex-1 overflow-y-auto max-h-[70vh] relative">
          {autoVolumeLoading && (
            <div className="absolute inset-0 z-10 bg-white/60 dark:bg-bk-side/60 backdrop-blur-[1px] flex items-center justify-center">
               <div className="flex flex-col items-center gap-2">
                 <span className="material-symbols-outlined animate-spin text-bk-yellow text-2xl">refresh</span>
                 <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fetching policy...</span>
               </div>
            </div>
          )}
          <div className="p-3 bg-bk-yellow/5 border border-bk-yellow/10 rounded-lg flex gap-3">
             <span className="material-symbols-outlined text-bk-yellow text-sm">info</span>
             <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
               Configure automatic volume expansion for Data and Index storage. Thresholds define when new volumes should be created.
             </p>
          </div>

          <ConfigGroup 
            title="Data parameters" 
            icon="database" 
            enabled={dataEnabled} setEnabled={setDataEnabled}
            threshold={dataThreshold} setThreshold={setDataThreshold}
            addSize={dataAddSize} setAddSize={setDataAddSize}
          />

          <ConfigGroup 
            title="Index parameters" 
            icon="list_alt" 
            enabled={indexEnabled} setEnabled={setIndexEnabled}
            threshold={indexThreshold} setThreshold={setIndexThreshold}
            addSize={indexAddSize} setAddSize={setIndexAddSize}
          />
        </div>

        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all" onClick={() => dispatch(closeSetAutomationVolumeModal())}>Discard</button>
          <button className="px-8 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-black tracking-tight rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2" onClick={handleSave}>
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Apply policy</span>
          </button>
        </div>
      </div>
    </div>
  );
}
