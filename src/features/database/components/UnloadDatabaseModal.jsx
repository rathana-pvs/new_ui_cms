import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeUnloadDBModal, openUnloadResultModal } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';
import { databaseApi } from '../databaseApi';

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

  const fetchTables = useCallback(async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setIsTablesLoading(true);
    try {
      const status = activeDatabases.includes(selectedDatabase) ? 'on' : 'off';
      const res = await databaseApi.getClassInfo(selectedHostUid, selectedDatabase, status);
      
      // The response structure is res.userclass[0].class
      const userTables = res.userclass?.[0]?.class?.map(c => c.classname) || [];
      setDynamicTables(userTables);
      
      // If "All" is selected by default, select them all
      if (formData.schemaOption === 'All') {
        setFormData(prev => ({ ...prev, selectedTables: userTables }));
      }
    } catch (err) {
      console.error('Failed to fetch tables:', err);
    } finally {
      setIsTablesLoading(false);
    }
  }, [selectedHostUid, selectedDatabase, activeDatabases, formData.schemaOption]);

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
      // Show detailed result modal instead of generic status
      dispatch(openUnloadResultModal(response));
    } catch (err) {
      console.error('Failed to unload database:', err);
      dispatch(showStatusModal({
        type: 'error',
        title: 'Unload Failed',
        message: err.response?.data?.message || 'Failed to initiate database unload'
      }));
    } finally {
      setIsUnloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-xl rounded shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Loading Overlay */}
        {isUnloading && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white/80 dark:bg-[#1e2230]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Unloading Database...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230] flex-shrink-0">
          <h3 className="text-[13px] font-normal text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500 text-[18px]">upload</span>
            Unload DB
          </h3>
          <button 
            onClick={() => dispatch(closeUnloadDBModal())}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-3 overflow-y-auto space-y-3 custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          
          {/* Section: Database Information */}
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-2 pt-3 mt-1">
            <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                Database Information
              </span>
            </div>
            <div className="space-y-2 px-2">
              <div className="flex items-center gap-2">
                <label className="w-36 shrink-0 text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">Target database name :</label>
                <div className="flex-1">
                  <input 
                    type="text" 
                    name="targetDbName"
                    value={formData.targetDbName}
                    onChange={handleInputChange}
                    className="w-full h-8 px-2 rounded-lg text-[12px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-900 dark:text-slate-200 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-normal"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-36 shrink-0 text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">Target directory <span className="text-rose-500">*</span> :</label>
                <div className="flex-1">
                  <input 
                    type="text" 
                    name="targetDirectory"
                    value={formData.targetDirectory}
                    onChange={handleInputChange}
                    className="w-full h-8 px-2 rounded-lg text-[12px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-900 dark:text-slate-200 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-normal"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Database Auth */}
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-2 pt-3 mt-3">
            <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                Database Auth
              </span>
            </div>
            <div className="space-y-2 px-2">
              <div className="flex items-center gap-2">
                <label className="w-36 shrink-0 text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">DB Username <span className="text-rose-500">*</span> :</label>
                <div className="flex-1">
                  <input 
                    type="text" 
                    name="dbUsername"
                    value={formData.dbUsername}
                    onChange={handleInputChange}
                    className="w-full h-8 px-2 rounded-lg text-[12px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-900 dark:text-slate-200 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 transition-all font-normal"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-36 shrink-0 text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">DB Password :</label>
                <div className="flex-1 relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="dbPassword"
                    value={formData.dbPassword}
                    onChange={handleInputChange}
                    className="w-full h-8 px-2 rounded-lg text-[12px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-900 dark:text-slate-200 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 pr-10 transition-all font-normal"
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Unload Target */}
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-2 pt-3 mt-3">
            <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                Unload Target
              </span>
            </div>
            <div className="space-y-3 px-2">
              <div className="flex gap-4 pt-2">
                <div className="flex-1 relative border border-slate-200 dark:border-slate-800 rounded-xl p-2 pt-3">
                  <div className="absolute top-0 -translate-y-[55%] left-3 px-1.5 bg-white dark:bg-[#1e2230]">
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-none">
                      Schema
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {['All', 'Selected tables', 'Not include'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <div className="relative flex items-center">
                          <input 
                            type="radio" 
                            name="schemaOption" 
                            value={opt}
                            checked={formData.schemaOption === opt}
                            onChange={handleSchemaChange}
                            className="peer w-3.5 h-3.5 appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-primary transition-all cursor-pointer" 
                          />
                          <div className="absolute w-1.5 h-1.5 bg-primary rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-[12px] font-normal text-slate-600 dark:text-slate-400 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex-1 relative border border-slate-200 dark:border-slate-800 rounded-xl p-2 pt-3">
                  <div className="absolute top-0 -translate-y-[55%] left-3 px-1.5 bg-white dark:bg-[#1e2230]">
                    <span className="text-[10px] font-medium text-slate-600 dark:text-slate-400 leading-none">
                      Data
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {['Selected tables', 'Not include'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <div className="relative flex items-center">
                          <input 
                            type="radio" 
                            name="dataOption" 
                            value={opt}
                            checked={formData.dataOption === opt}
                            onChange={handleInputChange}
                            className="peer w-3.5 h-3.5 appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-primary transition-all cursor-pointer" 
                          />
                          <div className="absolute w-1.5 h-1.5 bg-primary rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-[12px] font-normal text-slate-600 dark:text-slate-400 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl min-h-[100px] max-h-[140px] overflow-hidden flex flex-col p-1">
                <div className="flex-1 overflow-y-auto p-1 custom-scrollbar">
                  {isTablesLoading ? (
                    <div className="flex flex-col items-center justify-center py-4">
                       <div className="w-4 h-4 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-1"></div>
                       <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal tracking-tight">Loading...</span>
                    </div>
                  ) : dynamicTables.length === 0 ? (
                    <div className="flex items-center justify-center py-4 text-slate-400 dark:text-slate-500 italic text-[12px]">
                      No tables found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-0.5 px-1">
                      {dynamicTables.map(table => (
                        <label key={table} className="flex items-center gap-2 px-2 py-0.5 bg-white dark:bg-slate-900/40 rounded-lg cursor-pointer border border-transparent transition-all">
                          <div className="relative flex items-center">
                            <input 
                              type="checkbox" 
                              checked={formData.selectedTables.includes(table)}
                              onChange={() => handleTableToggle(table)}
                              className="peer h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary transition-colors" 
                            />
                            <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                              <span className="material-symbols-outlined text-[12px]">check</span>
                            </span>
                          </div>
                          <span className="text-[12px] font-normal text-slate-600 dark:text-slate-400 truncate">{table}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Unload Option */}
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-2 pt-3 mt-3">
            <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                Unload Option
              </span>
            </div>
            <div className="space-y-3 px-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 p-1.5 border border-slate-100 dark:border-slate-800/50 rounded-xl">
                {[
                  { label: 'As dba', name: 'asDba' },
                  { label: 'Split schema files', name: 'splitSchema' },
                  { label: 'Class Only', name: 'classOnly' },
                  { label: 'Skip index detail', name: 'skipIndex' },
                  { label: 'Use delimited identifier', name: 'useDelimitedIdentifier' },
                  { label: 'include referenced tables', name: 'includeReferencedTables', disabled: formData.schemaOption !== 'Not include' },
                ].map(opt => (
                  <label key={opt.name} className={`flex items-center gap-2 ${opt.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} p-1 rounded-lg transition-all`}>
                    <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        name={opt.name}
                        checked={formData[opt.name]}
                        onChange={handleInputChange}
                        disabled={opt.disabled}
                        className="peer h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary transition-colors" 
                      />
                      <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="material-symbols-outlined text-[12px]">check</span>
                      </span>
                    </div>
                    <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400 transition-colors uppercase tracking-tight">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="space-y-1.5 pt-0.5">
                {[
                  { label: 'Prefix for output files', name: 'prefixOutputFile', useName: 'usePrefixOutputFile', type: 'text' },
                  { label: 'File for hash', name: 'fileForHash', useName: 'useFileForHash', type: 'text' },
                  { label: 'Number of cached pages', name: 'cachedPages', useName: 'useCachedPages', type: 'number' },
                  { label: 'Estimate number of instances', name: 'estimateInstances', useName: 'useEstimateInstances', type: 'number' },
                  { label: 'Lo file for current directory', name: 'loFileDirectory', useName: 'useLoFileDirectory', type: 'text' },
                ].map(field => (
                  <div key={field.name} className="flex items-center gap-2">
                    <div className="w-44 shrink-0 flex items-center gap-2">
                        <div className="relative flex items-center">
                          <input 
                              type="checkbox" 
                              name={field.useName}
                              checked={formData[field.useName]}
                              onChange={handleInputChange}
                              className="peer h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary transition-colors" 
                          />
                          <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                            <span className="material-symbols-outlined text-[12px]">check</span>
                          </span>
                        </div>
                        <label className={`text-[11px] font-normal tracking-tight transition-colors ${formData[field.useName] ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{field.label}</label>
                    </div>
                    <div className="flex-1">
                      <input 
                        type={field.type} 
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleInputChange}
                        disabled={!formData[field.useName]}
                        className={`w-full h-8 px-2 rounded-lg text-[12px] border transition-all outline-none font-normal
                          ${!formData[field.useName] 
                            ? 'bg-slate-50 dark:bg-slate-800/10 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 italic cursor-not-allowed' 
                            : 'bg-white dark:bg-[#1e2230] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/5'}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="px-6 py-2 bg-slate-50 dark:bg-[#1e2230] flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            className="px-6 py-1.5 text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-all font-normal"
            onClick={() => dispatch(closeUnloadDBModal())}
          >
            Cancel
          </button>
          <button 
            className="px-6 py-1.5 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white text-xs rounded shadow transition-all flex items-center justify-center gap-2 min-w-[100px] font-normal disabled:opacity-50"
            onClick={handleUnloadDatabase}
            disabled={isUnloading}
          >
            {isUnloading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-sm">upload</span>
            )}
            Proceed Unload
          </button>
        </div>
      </div>
    </div>
  );
}
