import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeUnloadDBModal, openUnloadResultModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

export default function UnloadDatabaseModal() {
  const dispatch = useDispatch();
  const { isUnloadDBModalOpen, selectedDatabase, databases, activeDatabases } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const currentDb = databases.find(db => db.dbname === selectedDatabase);

  const [formData, setFormData] = useState({
    targetDbName: '',
    targetDirectory: '',
    dbUsername: '',
    dbPassword: '',
    schemaOption: 'All', // All, Selected tables, Not include
    dataOption: 'Selected tables', // Selected tables, Not include
    selectedTables: [],
    asDba: false,
    splitSchema: false,
    classOnly: false,
    skipIndex: false,
    useDelimitedIdentifier: false,
    includeReferencedTables: false,
    usePrefixOutputFile: false,
    prefixOutputFile: '',
    useFileForHash: false,
    fileForHash: '',
    useCachedPages: false,
    cachedPages: '',
    useEstimateInstances: false,
    estimateInstances: '',
    useLoFileDirectory: false,
    loFileDirectory: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [dynamicTables, setDynamicTables] = useState([]);
  const [isTablesLoading, setIsTablesLoading] = useState(false);
  const [isUnloading, setIsUnloading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTables = useCallback(async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setIsTablesLoading(true);
    try {
      const status = activeDatabases.includes(selectedDatabase) ? 'on' : 'off';
      const res = await databaseApi.getClassInfo(selectedHostUid, selectedDatabase, status);
      
      const userTables = res.userclass?.[0]?.class?.map(c => c.classname) || [];
      setDynamicTables(userTables);
      
      setFormData(prev => {
        if (prev.schemaOption === 'All') {
          return { ...prev, selectedTables: userTables };
        }
        return prev;
      });
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    } finally {
      setIsTablesLoading(false);
    }
  }, [selectedHostUid, selectedDatabase, activeDatabases]);


  useEffect(() => {
    if (isUnloadDBModalOpen && selectedDatabase) {
      setFormData(prev => ({
        ...prev,
        targetDbName: selectedDatabase,
        targetDirectory: currentDb?.dbdir || `/home/cubrid/databases/${selectedDatabase}`,
        dbUsername: 'dba',
        fileForHash: currentDb?.dbdir ? `${currentDb.dbdir}/hashfile` : `/home/cubrid/databases/${selectedDatabase}/hashfile`
      }));
      fetchTables();
    }
  }, [isUnloadDBModalOpen, selectedDatabase, currentDb, fetchTables]);

  if (!isUnloadDBModalOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSchemaChange = (e) => {
    const { value } = e.target;
    setFormData(prev => {
      let newSelectedTables = prev.selectedTables;
      if (value === 'All') {
        newSelectedTables = [...dynamicTables];
      } else if (value === 'Selected tables' || value === 'Not include') {
        newSelectedTables = [];
      }
      
      return {
        ...prev,
        schemaOption: value,
        selectedTables: newSelectedTables
      };
    });
  };

  const handleTableToggle = (table) => {
    setFormData(prev => ({
      ...prev,
      selectedTables: prev.selectedTables.includes(table)
        ? prev.selectedTables.filter(t => t !== table)
        : [...prev.selectedTables, table]
    }));
  };

  const handleUnloadDatabase = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    
    setIsUnloading(true);
    setError(null);
    try {
      const payload = {
        targetdir: formData.targetDirectory,
        isSchemaIncluded: formData.schemaOption !== 'Not include',
        isDataIncluded: formData.dataOption !== 'Not include',
        dbuser: formData.dbUsername,
        dbpasswd: formData.dbPassword,
        usehash: formData.useFileForHash ? 'yes' : 'no',
        hashdir: formData.useFileForHash ? formData.fileForHash : '',
        class: formData.selectedTables.map(t => ({ classname: t })),
        ref: formData.includeReferencedTables ? 'yes' : 'no',
        classonly: formData.classOnly ? 'yes' : 'no',
        "as-dba": formData.asDba ? 'yes' : 'no',
        "skip-index-detail": formData.skipIndex ? 'yes' : 'no',
        "split-schema-files": formData.splitSchema ? 'yes' : 'no',
        delimit: formData.useDelimitedIdentifier ? 'yes' : 'no',
        estimate: formData.useEstimateInstances ? String(formData.estimateInstances) : '',
        prefix: formData.usePrefixOutputFile ? formData.prefixOutputFile : '',
        cach: formData.useCachedPages ? String(formData.cachedPages) : '',
        lofile: formData.useLoFileDirectory ? String(formData.loFileDirectory) : ''
      };

      const response = await databaseApi.unloadDatabase(selectedHostUid, selectedDatabase, payload);
      dispatch(closeUnloadDBModal());
      dispatch(openUnloadResultModal(response));
    } catch (err) {
      console.error('Failed to unload database:', err);
      setError(err.response?.data?.note || err.response?.data?.message || 'The unload operation failed. Check the target directory permissions and database state.');
    } finally {
      setIsUnloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
      <div className="bg-white dark:bg-bk-side w-full max-w-[580px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        <LoadingOverlay 
            isVisible={isUnloading} 
            title="Unloading database" 
            subtitle="Synchronizing schema and data records..." 
        />
        <ErrorOverlay 
          isVisible={!!error} 
          error={error} 
          onRetry={handleUnloadDatabase}
          onClose={() => setError(null)}
        />

        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">upload</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">Unload database</h3>
            </div>
          </div>
          <button 
            onClick={() => dispatch(closeUnloadDBModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar flex-1">
          
          {/* Section: Source Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Target configuration</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Database name</label>
                <input 
                  type="text" 
                  value={formData.targetDbName}
                  readOnly
                  className="w-full h-9 px-3 bg-slate-100 dark:bg-bk-main/10 border border-slate-100 dark:border-slate-800/50 rounded text-[12px] text-slate-400 dark:text-slate-500 cursor-default font-medium outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Target directory</label>
                <input 
                  type="text" 
                  name="targetDirectory"
                  value={formData.targetDirectory}
                  onChange={handleInputChange}
                  placeholder="e.g. /home/cubrid/backup"
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-medium placeholder:text-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-50 dark:border-white/5 pt-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">DB Username</label>
                <input 
                  type="text" 
                  name="dbUsername"
                  value={formData.dbUsername}
                  onChange={handleInputChange}
                  placeholder="dba"
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-medium"
                />
              </div>
              <div className="space-y-1.5 relative">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">DB Password</label>
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="dbPassword"
                  value={formData.dbPassword}
                  onChange={handleInputChange}
                  placeholder="Password"
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-medium pr-9"
                />
                <button 
                  className="absolute right-2.5 bottom-1.5 text-slate-400 hover:text-bk-yellow dark:text-slate-500 dark:hover:text-bk-yellow transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Unload Content */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Unload parameters</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50/50 dark:bg-bk-main/20 p-3 rounded-xl border border-slate-100 dark:border-white/5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[14px] text-bk-yellow">terminal</span>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 tracking-wide">Objects</span>
                </div>
                <div className="space-y-2">
                  {['All', 'Selected tables', 'Not include'].map(opt => (
                    <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="radio" 
                          name="schemaOption" 
                          value={opt}
                          checked={formData.schemaOption === opt}
                          onChange={handleSchemaChange}
                          className="peer w-3.5 h-3.5 appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-bk-yellow transition-all cursor-pointer" 
                        />
                        <div className="absolute w-1.5 h-1.5 bg-bk-yellow rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors">Schema: {opt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-bk-main/20 p-3 rounded-xl border border-slate-100 dark:border-white/5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[14px] text-bk-yellow">dataset</span>
                  <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 tracking-wide">Data</span>
                </div>
                <div className="space-y-2">
                  {['Selected tables', 'Not include'].map(opt => (
                    <label key={opt} className="flex items-center gap-2.5 cursor-pointer group">
                      <div className="relative flex items-center">
                        <input 
                          type="radio" 
                          name="dataOption" 
                          value={opt}
                          checked={formData.dataOption === opt}
                          onChange={handleInputChange}
                          className="peer w-3.5 h-3.5 appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-bk-yellow transition-all cursor-pointer" 
                        />
                        <div className="absolute w-1.5 h-1.5 bg-bk-yellow rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors">Data: {opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/30 dark:bg-bk-main/20 overflow-hidden flex flex-col">
              <div className="px-3 py-1.5 bg-slate-50/80 dark:bg-bk-main/50 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">Available classes</span>
                <span className="text-[10px] text-slate-400 font-medium">{formData.selectedTables.length} selected</span>
              </div>
              <div className="max-h-[140px] overflow-y-auto p-2 custom-scrollbar">
                {isTablesLoading ? (
                  <div className="flex flex-col items-center justify-center py-6 gap-2">
                    <div className="w-4 h-4 border-2 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-wide">Fetching schema...</span>
                  </div>
                ) : dynamicTables.length === 0 ? (
                  <div className="py-6 text-center text-[11px] text-slate-400 dark:text-slate-500 italic">No classes found in this database.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-1 px-1">
                    {dynamicTables.map(table => (
                      <label key={table} className="flex items-center gap-2 px-2 py-1.5 hover:bg-white dark:hover:bg-white/5 rounded active:scale-[0.99] transition-all cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={formData.selectedTables.includes(table)}
                          onChange={() => handleTableToggle(table)}
                          className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all" 
                        />
                        <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-200 truncate">{table}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section: Advanced Options */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Advanced options</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-1">
              {[
                { label: 'As dba', name: 'asDba' },
                { label: 'Split schema files', name: 'splitSchema' },
                { label: 'Class Only', name: 'classOnly' },
                { label: 'Skip index detail', name: 'skipIndex' },
                { label: 'Use delimited identifier', name: 'useDelimitedIdentifier' },
                { label: 'Include referenced tables', name: 'includeReferencedTables', disabled: formData.schemaOption === 'Not include' },
              ].map(opt => (
                <label key={opt.name} className={`flex items-center gap-2.5 ${opt.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} group`}>
                  <input 
                    type="checkbox" 
                    name={opt.name}
                    checked={formData[opt.name]}
                    onChange={handleInputChange}
                    disabled={opt.disabled}
                    className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all" 
                  />
                  <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-white/5">
              {[
                { label: 'Output file prefix', name: 'prefixOutputFile', useName: 'usePrefixOutputFile', type: 'text', placeholder: 'prefix_' },
                { label: 'Hash file path', name: 'fileForHash', useName: 'useFileForHash', type: 'text' },
                { label: 'Cached pages limit', name: 'cachedPages', useName: 'useCachedPages', type: 'number', placeholder: '0' },
                { label: 'Instances estimate', name: 'estimateInstances', useName: 'useEstimateInstances', type: 'number', placeholder: '1000' },
                { label: 'LO file directory', name: 'loFileDirectory', useName: 'useLoFileDirectory', type: 'text' },
              ].map(field => (
                <div key={field.name} className="flex items-center gap-3 group">
                  <div className="w-48 shrink-0 flex items-center gap-2.5">
                    <input 
                      type="checkbox" 
                      name={field.useName}
                      checked={formData[field.useName]}
                      onChange={handleInputChange}
                      className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all" 
                    />
                    <label className={`text-[10px] font-medium tracking-tight transition-colors ${formData[field.useName] ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>{field.label}</label>
                  </div>
                  <div className="flex-1">
                    <input 
                      type={field.type} 
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      placeholder={field.placeholder || ''}
                      disabled={!formData[field.useName]}
                      className={`w-full h-8 px-3 rounded text-[12px] border transition-all outline-none font-medium
                        ${!formData[field.useName] 
                          ? 'bg-slate-50 dark:bg-bk-main/10 border-slate-100 dark:border-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed' 
                          : 'bg-white dark:bg-bk-main/30 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-bk-yellow/50'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={() => dispatch(closeUnloadDBModal())}
          >
            Discard
          </button>
          <button 
            disabled={isUnloading}
            className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-50"
            onClick={handleUnloadDatabase}
          >
            {isUnloading ? (
              <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                <span>Proceed unload</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
