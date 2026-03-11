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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Loading Overlay */}
        {isUnloading && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white dark:bg-[#1e2230]/80">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-sm animate-spin"></div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans">Unloading Database...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-800/50">
          <h3 className="text-[15px] font-bold text-slate-700 dark:text-white">
            Unload Database
          </h3>
          <button 
            onClick={() => dispatch(closeUnloadDBModal())}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto space-y-5 custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          
          {/* Section: Database Information */}
          <fieldset className="border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-3.5">
            <legend className="text-[12px] font-bold text-slate-500 dark:text-slate-400 px-2 mx-2">Database Information</legend>
            <div className="flex items-center gap-4">
              <label className="w-[180px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right">Database name * :</label>
              <input 
                type="text" 
                name="targetDbName"
                value={formData.targetDbName}
                onChange={handleInputChange}
                className="flex-1 h-[34px] px-3 rounded-md text-[13px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-[180px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right uppercase tracking-tight">
                Target directory <span className="text-rose-500">*</span> :
              </label>
              <input 
                type="text" 
                name="targetDirectory"
                value={formData.targetDirectory}
                onChange={handleInputChange}
                className="flex-1 h-[34px] px-3 rounded-md text-[13px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
          </fieldset>

          {/* Section: Database Auth */}
          <fieldset className="border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-3.5">
            <legend className="text-[12px] font-bold text-slate-500 dark:text-slate-400 px-2 mx-2">Database Auth</legend>
            <div className="flex items-center gap-4">
              <label className="w-[180px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right">
                DB Username <span className="text-rose-500">*</span> :
              </label>
              <input 
                type="text" 
                name="dbUsername"
                value={formData.dbUsername}
                onChange={handleInputChange}
                className="flex-1 h-[34px] px-3 rounded-md text-[13px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-[180px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right">DB Password :</label>
              <div className="flex-1 relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="dbPassword"
                  value={formData.dbPassword}
                  onChange={handleInputChange}
                  className="w-full h-[34px] px-3 rounded-md text-[13px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none focus:border-blue-500 pr-10 shadow-sm"
                />
                <button 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </fieldset>

          {/* Section: Unload Target */}
          <fieldset className="border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-5">
            <legend className="text-[12px] font-bold text-slate-500 dark:text-slate-400 px-2 mx-2">Unload Target</legend>
            <div className="flex gap-12 pl-4">
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pl-1">Schema</p>
                <div className="space-y-2">
                  {['All', 'Selected tables', 'Not include'].map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="schemaOption" 
                        value={opt}
                        checked={formData.schemaOption === opt}
                        onChange={handleSchemaChange}
                        className="h-5 w-5 rounded-full border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer bg-white dark:bg-[#1e2230]" 
                      />
                      <span className="text-[13px] text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 pl-1">Data</p>
                <div className="space-y-2">
                  {['Selected tables', 'Not include'].map(opt => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="dataOption" 
                        value={opt}
                        checked={formData.dataOption === opt}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded-full border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer bg-white dark:bg-[#1e2230]" 
                      />
                      <span className="text-[13px] text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-md bg-white dark:bg-slate-900 h-[160px] overflow-hidden flex flex-col shadow-sm">
              <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
                {isTablesLoading ? (
                  <div className="flex flex-col items-center justify-center py-10">
                     <div className="w-6 h-6 border-3 border-blue-600/20 border-t-blue-600 rounded-sm animate-spin mb-3"></div>
                     <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">Fetching Tables...</span>
                  </div>
                ) : dynamicTables.length === 0 ? (
                  <div className="flex items-center justify-center py-10 text-slate-400 dark:text-slate-500 italic text-[13px]">
                    No tables found.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-1.5">
                    {dynamicTables.map(table => (
                      <label key={table} className="flex items-center gap-3 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-blue-900/10 rounded-md cursor-pointer transition-colors group">
                        <input 
                          type="checkbox" 
                          checked={formData.selectedTables.includes(table)}
                          onChange={() => handleTableToggle(table)}
                          className="h-[15px] w-[15px] rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 cursor-pointer transition-all bg-white dark:bg-[#1e2230]" 
                        />
                        <span className="text-[13px] text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate font-medium">{table}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </fieldset>

          {/* Section: Unload Option */}
          <fieldset className="border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-5">
            <legend className="text-[12px] font-bold text-slate-500 dark:text-slate-400 px-2 mx-2">Unload Options</legend>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 pl-4">
              {[
                { label: 'As dba', name: 'asDba' },
                { label: 'Split schema files', name: 'splitSchema' },
                { label: 'Class Only', name: 'classOnly' },
                { label: 'Skip index detail', name: 'skipIndex' },
                { label: 'Use delimited identifier', name: 'useDelimitedIdentifier' },
                { label: 'Include referenced tables', name: 'includeReferencedTables', disabled: formData.schemaOption !== 'Not include' },
              ].map(opt => (
                <label key={opt.name} className={`flex items-center gap-3 ${opt.disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} group`}>
                  <input 
                    type="checkbox" 
                    name={opt.name}
                    checked={formData[opt.name]}
                    onChange={handleInputChange}
                    disabled={opt.disabled}
                    className="h-[18px] w-[18px] rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 cursor-pointer transition-all bg-white dark:bg-[#1e2230]" 
                  />
                  <span className="text-[13px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
              {[
                { label: 'Prefix for output files', name: 'prefixOutputFile', useName: 'usePrefixOutputFile', type: 'text' },
                { label: 'File for hash', name: 'fileForHash', useName: 'useFileForHash', type: 'text' },
                { label: 'Number of cached pages', name: 'cachedPages', useName: 'useCachedPages', type: 'number' },
                { label: 'Estimate number of instances', name: 'estimateInstances', useName: 'useEstimateInstances', type: 'number' },
                { label: 'Lo file for current directory', name: 'loFileDirectory', useName: 'useLoFileDirectory', type: 'text' },
              ].map(field => (
                <div key={field.name} className="flex items-center gap-4">
                  <div className="w-[240px] shrink-0 flex items-center gap-3 cursor-pointer group">
                      <input 
                          type="checkbox" 
                          name={field.useName}
                          checked={formData[field.useName]}
                          onChange={handleInputChange}
                          className="h-[18px] w-[18px] rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 cursor-pointer transition-all bg-white dark:bg-[#1e2230]" 
                      />
                      <label className="text-[13px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{field.label}</label>
                  </div>
                  <input 
                    type={field.type} 
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    disabled={!formData[field.useName]}
                    className={`flex-1 h-[34px] px-3 rounded-md text-[13px] border transition-all outline-none shadow-sm
                      ${!formData[field.useName] 
                        ? 'bg-slate-50/50 dark:bg-slate-800/10 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 italic cursor-not-allowed shadow-none' 
                        : 'bg-white dark:bg-[#1e2230] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:border-blue-500'}`}
                  />
                </div>
              ))}
            </div>
          </fieldset>

        </div>
        
        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-2.5 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50 font-sans">
          <button 
            className="h-[34px] px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[13px] rounded-md transition-all font-bold"
            onClick={() => dispatch(closeUnloadDBModal())}
          >
            Cancel
          </button>
          <button 
            className="h-[34px] px-6 bg-blue-600 hover:bg-blue-700 text-white text-[13px] rounded-md shadow-sm transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={handleUnloadDatabase}
            disabled={isUnloading}
          >
            {isUnloading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-sm animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">upload</span>
                <span>Unload Database</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
