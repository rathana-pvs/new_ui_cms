import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeDatabaseInfoModal, fetchDatabaseParamDump } from '../databaseSlice';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

export default function DatabaseInfoModal() {
  const dispatch = useDispatch();
  const { isDatabaseInfoModalOpen, selectedDatabase, databaseInfoData, databaseInfoLoading, databaseInfoError, activeDatabases } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);

  const [step, setStep] = useState('setup'); // 'setup' or 'results'
  const [dumpBoth, setDumpBoth] = useState(false);

  const isActive = activeDatabases.includes(selectedDatabase);

  // Reset state when modal opens
  useEffect(() => {
    if (isDatabaseInfoModalOpen) {
      setStep('setup');
      setDumpBoth(false);
    }
  }, [isDatabaseInfoModalOpen]);

  if (!isDatabaseInfoModalOpen) return null;

  const handleRunDump = () => {
    if (selectedHostUid && selectedDatabase) {
      dispatch(fetchDatabaseParamDump({ 
        hostUid: selectedHostUid, 
        dbname: selectedDatabase, 
        both: dumpBoth ? 'y' : 'n' 
      })).unwrap().then(() => {
        setStep('results');
      });
    }
  };

  const handleClose = () => {
    dispatch(closeDatabaseInfoModal());
  };

  const rawData = databaseInfoData[selectedDatabase] || {};
  const serverParams = (rawData.server && rawData.server.length > 0) ? rawData.server[0] : {};
  const clientParams = (rawData.client && rawData.client.length > 0) ? rawData.client[0] : null;

  // Merge keys to follow d-cms horizontal comparison
  const allKeys = Array.from(new Set([
    ...Object.keys(serverParams),
    ...(clientParams ? Object.keys(clientParams) : [])
  ])).sort();

  const paramList = allKeys.map(key => ({
    name: key,
    server: serverParams[key] !== undefined ? (typeof serverParams[key] === 'boolean' ? (serverParams[key] ? 'yes' : 'no') : String(serverParams[key])) : '-',
    client: clientParams ? (clientParams[key] !== undefined ? (typeof clientParams[key] === 'boolean' ? (clientParams[key] ? 'yes' : 'no') : String(clientParams[key])) : '-') : null
  }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className={`bg-white dark:bg-bk-side w-full transition-all duration-200 ${step === 'setup' ? 'max-w-[460px]' : 'max-w-[750px]'} rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left ${step === 'setup' ? 'h-auto' : 'h-[650px]'}`}>
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        <LoadingOverlay 
            isVisible={databaseInfoLoading} 
            title="Processing Dump" 
            subtitle="Retrieving used parameter values..." 
        />
        <ErrorOverlay 
          isVisible={!!databaseInfoError} 
          error={databaseInfoError} 
          onRetry={handleRunDump}
          onClose={() => handleClose()}
        />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">database</span>
            </div>
            <div>
              <h3 className="text-[13px] font-bold text-slate-900 dark:text-white leading-none tracking-tight">Used Parameter Dump</h3>
              {step === 'setup' && <p className="text-[11px] text-slate-500 mt-1">Check out the parameter values</p>}
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          {step === 'setup' ? (
            <div className="p-6 space-y-6">
              {/* Database Name Field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Database name:</label>
                </div>
                <div className="w-full h-10 px-4 flex items-center bg-slate-50/80 dark:bg-bk-main/40 border border-slate-200 dark:border-slate-800 rounded-lg text-[13px] font-medium text-slate-500 dark:text-slate-400 select-none">
                  {selectedDatabase}
                </div>
              </div>

              {/* Description Field */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 px-1">Description</label>
                <div className="w-full p-4 bg-bk-yellow/[0.03] border border-bk-yellow/10 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                  This utility is used to display information about the parameters currently being used by the database server. It provides a comprehensive dump of all configuration settings reflecting the current operational state.
                </div>
              </div>

              {/* Checkbox */}
              <label 
                className={`flex items-center gap-3 p-4 border rounded-xl transition-all group ${isActive ? 'bg-slate-50/50 dark:bg-bk-main/20 border-slate-100 dark:border-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 active:scale-[0.99]' : 'bg-slate-100/50 dark:bg-slate-800/20 border-transparent opacity-50 cursor-not-allowed'} mt-2`}
                title={!isActive ? "This option is only available for active databases" : ""}
              >
                <input 
                  type="checkbox" 
                  checked={dumpBoth}
                  onChange={(e) => isActive && setDumpBoth(e.target.checked)}
                  disabled={!isActive}
                  className={`w-4.5 h-4.5 rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow ${isActive ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                />
                <div className="flex flex-col">
                  <span className={`text-[12px] font-bold transition-colors tracking-tight ${isActive ? 'text-slate-700 dark:text-slate-300 group-hover:text-bk-yellow' : 'text-slate-400 dark:text-slate-500'}`}>Dump both client and server parameters</span>
                </div>
              </label>
            </div>
          ) : (
            /* Results View */
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              {/* Database Name Info Bar - following d-cms style */}
              <div className="px-5 py-2 flex items-center gap-3 bg-slate-50/80 dark:bg-bk-main/40 border-b border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Viewing Cache For:</span>
                <span className="text-[12px] font-black text-bk-yellow underline decoration-bk-yellow/20 underline-offset-4">{selectedDatabase}</span>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-bk-main/10 flex flex-col h-full shadow-inner">
                  {/* Table Header */}
                  <div className="sticky top-0 bg-slate-50 dark:bg-bk-main flex border-b border-slate-200 dark:border-slate-800 z-10 font-bold overflow-hidden shadow-sm">
                    <div className="flex-1 px-5 py-3 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest border-r border-slate-200 dark:border-slate-800">Parameter Identifier</div>
                    <div className={`${dumpBoth ? 'w-[150px]' : 'w-[250px]'} px-5 py-3 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest border-r border-slate-200 dark:border-slate-800`}>Server Value</div>
                    {dumpBoth && (
                      <div className="w-[150px] px-5 py-3 text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest text-center">Client Value</div>
                    )}
                  </div>

                  {/* Table Content */}
                  <div className="overflow-y-auto">
                    {paramList.map((item, idx) => (
                      <div key={item.name} className={`flex border-b border-slate-100 dark:border-slate-800/50 hover:bg-bk-yellow/[0.03] transition-colors group ${idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/20 dark:bg-white/5'}`}>
                        <div className="flex-1 px-5 py-2.5 flex items-center shrink-0 border-r border-slate-100 dark:border-slate-800/30">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 transition-colors group-hover:text-bk-yellow" title={item.name}>{item.name}</span>
                        </div>
                        <div className={`${dumpBoth ? 'w-[150px]' : 'w-[250px]'} px-5 py-2.5 flex items-center border-r border-slate-100 dark:border-slate-800/30`}>
                          <span className="text-[11px] text-slate-900 dark:text-white font-mono break-all">{item.server}</span>
                        </div>
                        {dumpBoth && (
                          <div className="w-[150px] px-5 py-2.5 flex items-center justify-center">
                            <span className={`text-[11px] font-mono break-all ${item.client === '-' ? 'text-slate-300 dark:text-slate-700' : 'text-slate-900 dark:text-white'}`}>
                              {item.client}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {paramList.length === 0 && !databaseInfoLoading && (
                      <div className="p-20 text-center opacity-40">
                         <span className="material-symbols-outlined text-4xl mb-2">find_in_page</span>
                         <p className="text-[11px] italic">No parameter data available for this database</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            className="px-5 py-1.5 text-[11px] font-bold tracking-tight text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={handleClose}
          >
            Close
          </button>
          
          {step === 'setup' ? (
            <button 
              className="px-10 py-2 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-black tracking-widest rounded-lg border border-bk-yellow/50 shadow-lg shadow-bk-yellow/10 transition-all uppercase"
              onClick={handleRunDump}
            >
              OK
            </button>
          ) : (
            <button 
              className="px-10 py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 active:scale-[0.98] text-white text-[11px] font-black tracking-widest rounded-lg transition-all uppercase"
              onClick={() => setStep('setup')}
            >
              Back to settings
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
