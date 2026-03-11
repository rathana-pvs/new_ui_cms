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
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Unloading Database...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230] flex-shrink-0">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500">upload</span>
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
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          
          {/* Section: Database Information */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">Database Information</div>
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/30 dark:bg-[#1e2230] space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Target database name</label>
                <input 
                  type="text" 
                  name="targetDbName"
                  value={formData.targetDbName}
                  onChange={handleInputChange}
                  className="h-9 px-3 rounded text-[13px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  Target directory <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="targetDirectory"
                  value={formData.targetDirectory}
                  onChange={handleInputChange}
                  className="h-9 px-3 rounded text-[13px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none focus:border-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Section: Database Auth */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">Database Auth</div>
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/30 dark:bg-[#1e2230] space-y-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  DB Username <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  name="dbUsername"
                  value={formData.dbUsername}
                  onChange={handleInputChange}
                  className="h-9 px-3 rounded text-[13px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none focus:border-primary/50"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[13px] font-medium text-slate-600 dark:text-slate-400">DB Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"} 
                    name="dbPassword"
                    value={formData.dbPassword}
                    onChange={handleInputChange}
                    className="w-full h-9 px-3 rounded text-[13px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none focus:border-primary/50 pr-9"
                  />
                  <button 
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
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
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">Unload Target</div>
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/30 dark:bg-[#1e2230] space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Schema</p>
                  <div className="space-y-1.5">
                    {['All', 'Selected tables', 'Not include'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="schemaOption" 
                          value={opt}
                          checked={formData.schemaOption === opt}
                          onChange={handleSchemaChange}
                          className="w-3.5 h-3.5 text-primary border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-0" 
                        />
                        <span className="text-[13px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase">Data</p>
                  <div className="space-y-1.5">
                    {['Selected tables', 'Not include'].map(opt => (
                      <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="dataOption" 
                          value={opt}
                          checked={formData.dataOption === opt}
                          onChange={handleInputChange}
                          className="w-3.5 h-3.5 text-primary border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 focus:ring-0" 
                        />
                        <span className="text-[13px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-900/50 min-h-[120px] max-h-[160px] overflow-hidden flex flex-col">
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                  {isTablesLoading ? (
                    <div className="flex flex-col items-center justify-center py-8">
                       <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin mb-1.5"></div>
                       <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">Loading...</span>
                    </div>
                  ) : dynamicTables.length === 0 ? (
                    <div className="flex items-center justify-center py-8 text-slate-400 dark:text-slate-500 italic text-[13px]">
                      No tables found.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-0.5">
                      {dynamicTables.map(table => (
                        <label key={table} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded cursor-pointer transition-colors group">
                          <input 
                            type="checkbox" 
                            checked={formData.selectedTables.includes(table)}
                            onChange={() => handleTableToggle(table)}
                            className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary focus:ring-0" 
                          />
                          <span className="text-[12px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 truncate">{table}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Unload Option */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">Unload Option</div>
            <div className="p-4 border border-slate-200 dark:border-slate-800 rounded bg-slate-50/30 dark:bg-[#1e2230] space-y-4">
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  { label: 'As dba', name: 'asDba' },
                  { label: 'Split schema files', name: 'splitSchema' },
                  { label: 'Class Only', name: 'classOnly' },
                  { label: 'Skip index detail', name: 'skipIndex' },
                  { label: 'Use delimited identifier', name: 'useDelimitedIdentifier' },
                  { label: 'include referenced tables', name: 'includeReferencedTables', disabled: formData.schemaOption !== 'Not include' },
                ].map(opt => (
                  <label key={opt.name} className={`flex items-center gap-2 ${opt.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/30'} p-1 rounded transition-colors group`}>
                    <input 
                      type="checkbox" 
                      name={opt.name}
                      checked={formData[opt.name]}
                      onChange={handleInputChange}
                      disabled={opt.disabled}
                      className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary focus:ring-0" 
                    />
                    <span className="text-[12px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 truncate transition-colors font-medium">{opt.label}</span>
                  </label>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                {[
                  { label: 'Prefix for output files', name: 'prefixOutputFile', useName: 'usePrefixOutputFile', type: 'text' },
                  { label: 'File for hash', name: 'fileForHash', useName: 'useFileForHash', type: 'text' },
                  { label: 'Number of cached pages', name: 'cachedPages', useName: 'useCachedPages', type: 'number' },
                  { label: 'Estimate number of instances', name: 'estimateInstances', useName: 'useEstimateInstances', type: 'number' },
                  { label: 'Lo file for current directory', name: 'loFileDirectory', useName: 'useLoFileDirectory', type: 'text' },
                ].map(field => (
                  <div key={field.name} className="flex items-center gap-4">
                    <div className="w-[180px] shrink-0 flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            name={field.useName}
                            checked={formData[field.useName]}
                            onChange={handleInputChange}
                            className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary focus:ring-0" 
                        />
                        <label className={`text-[11px] font-bold uppercase tracking-tight transition-colors ${formData[field.useName] ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'}`}>{field.label}</label>
                    </div>
                    <input 
                      type={field.type} 
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleInputChange}
                      disabled={!formData[field.useName]}
                      className={`flex-1 h-8 px-2 rounded text-[12px] border transition-all outline-none font-medium
                        ${!formData[field.useName] 
                          ? 'bg-slate-100 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 italic cursor-not-allowed' 
                          : 'bg-white dark:bg-[#1e2230] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:border-primary/50'}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-[#1e2230] flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            className="px-8 py-1.5 text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-all font-medium"
            onClick={() => dispatch(closeUnloadDBModal())}
          >
            Cancel
          </button>
          <button 
            className="px-8 py-1.5 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white text-sm rounded shadow transition-all flex items-center justify-center gap-2 min-w-[120px] font-bold disabled:opacity-50"
            onClick={handleUnloadDatabase}
            disabled={isUnloading}
          >
            {isUnloading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
