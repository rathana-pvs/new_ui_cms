import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeLoadDBModal } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';
import { databaseApi } from '../databaseApi';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

export default function LoadDatabaseModal() {
  const dispatch = useDispatch();
  const { isLoadDBModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [unloadList, setUnloadList] = useState([]);
  const [selectedUnload, setSelectedUnload] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [radio, setRadio] = useState(0); // 0: Pre-defined source, 1: Specific path

  const [formData, setFormData] = useState({
    targetDbName: '',
    dbUsername: 'dba',
    unloadFiles: {
      schema: '',
      object: '',
      index: '',
      trigger: ''
    },
    checkBoxes: {
      schema: false,
      object: false,
      index: false,
      trigger: false,
      checkoption: false,
      nolog: false,
      oiduse: false,
      statisticsuse: false,
      estimated: false,
      period: false,
      errorcontrolfile: false,
      ignoreclassfile: false
    },
    values: {
      estimated: '',
      period: '',
      errorcontrolfile: '',
      ignoreclassfile: ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const updateDataSource = (rawData) => {
    const convertedList = Object.entries(rawData)
      .filter(([key]) => key !== 'dbname')
      .map(([key, value]) => {
        const [path, date] = value.split(';');
        return {
          loadType: key,
          path: path,
          date: date,
          key: Math.random().toString(36).substr(2, 4),
          checked: false
        };
      });
    setDataSource(convertedList);
  };

  useEffect(() => {
    if (isLoadDBModalOpen && selectedDatabase) {
      setFormData(prev => ({
        ...prev,
        targetDbName: selectedDatabase,
      }));

      databaseApi.getUnloadInfo(selectedHostUid).then((res) => {
        const dbs = res.database || [];
        setUnloadList(dbs);
        if (dbs.length > 0) {
          const firstDb = dbs[0];
          setSelectedUnload(firstDb.dbname);
          updateDataSource(firstDb);
        }
      }).catch(err => console.error("Failed to fetch unload info:", err));
    }
  }, [isLoadDBModalOpen, selectedDatabase, selectedHostUid]);

  if (!isLoadDBModalOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleValueChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      values: { ...prev.values, [name]: value }
    }));
  };

  const handleCheckBoxChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      checkBoxes: { ...prev.checkBoxes, [name]: checked }
    }));
  };

  const handleUnloadPathChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      unloadFiles: { ...prev.unloadFiles, [name]: value }
    }));
  };

  const handleTableCheckboxChange = (checked, key) => {
    setDataSource(prev => prev.map(item => item.key === key ? { ...item, checked } : item));
  };

  const handleUnloadSelectChange = (dbname) => {
    setSelectedUnload(dbname);
    const dbData = unloadList.find(d => d.dbname === dbname);
    if (dbData) {
      updateDataSource(dbData);
    }
  };

  const handleLoadDatabase = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const toYesNo = (val) => (val ? "yes" : "no");
      let loadObject = {};

      if (radio === 0) {
        ["index", "schema", "object", "trigger"].forEach(item => {
          const found = dataSource.find(res => res.checked && res.loadType === item);
          loadObject[item] = found ? found.path : "none";
        });
      } else {
        loadObject = {
          index: formData.checkBoxes.index ? formData.unloadFiles.index : "none",
          schema: formData.checkBoxes.schema ? formData.unloadFiles.schema : "none",
          object: formData.checkBoxes.object ? formData.unloadFiles.object : "none",
          trigger: formData.checkBoxes.trigger ? formData.unloadFiles.trigger : "none",
        };
      }

      const payload = {
        dbname: selectedDatabase,
        ...loadObject,
        user: formData.dbUsername,
        oiduse: toYesNo(formData.checkBoxes.oiduse),
        statisticsuse: toYesNo(formData.checkBoxes.statisticsuse),
        nolog: toYesNo(formData.checkBoxes.nolog),
        period: formData.checkBoxes.period ? formData.values.period : "none",
        estimated: formData.checkBoxes.estimated ? formData.values.estimated : "none",
        errorcontrolfile: formData.checkBoxes.errorcontrolfile ? formData.values.errorcontrolfile : "none",
        ignoreclassfile: formData.checkBoxes.ignoreclassfile ? formData.values.ignoreclassfile : "none",
        checkoption: formData.checkBoxes.checkoption ? "both" : "none",
      };

      await databaseApi.loadDatabase(selectedHostUid, selectedDatabase, payload);
      dispatch(closeLoadDBModal());
      dispatch(showStatusModal({
        type: 'success',
        title: 'Load success',
        message: 'Database load operation has been queued successfully.'
      }));
    } catch (err) {
      console.error('Failed to load database:', err);
      setError(err.response?.data?.note || err.response?.data?.message || 'Database restoration failed. Verify source file access.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-300 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[640px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        <LoadingOverlay 
            isVisible={isLoading} 
            title="Processing load" 
            subtitle="Streaming volumes into target database..." 
        />
        <ErrorOverlay 
          isVisible={!!error} 
          error={error} 
          onRetry={handleLoadDatabase}
          onClose={() => setError(null)}
        />

        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">download</span>
            </div>
            <div>
              <h3 className="text-sm font-medium text-slate-900 dark:text-white leading-none">Load database</h3>
            </div>
          </div>
          <button 
            onClick={() => dispatch(closeLoadDBModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-5 space-y-6 overflow-y-auto custom-scrollbar flex-1 max-h-[75vh]">
          
          {/* Section: Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Profile context</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Target database</label>
                <div className="w-full h-9 px-3 flex items-center bg-slate-100 dark:bg-bk-main/10 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-400 truncate cursor-default">
                  {formData.targetDbName}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">DB Authority</label>
                <input 
                  type="text" 
                  name="dbUsername"
                  value={formData.dbUsername}
                  onChange={handleInputChange}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section: Source Selection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Source parameters</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>

            <div className="space-y-4">
              {/* Option 1: Pre-defined source */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className="relative flex items-center">
                    <input 
                      type="radio" 
                      name="radioOption" 
                      checked={radio === 0}
                      onChange={() => setRadio(0)}
                      className="peer w-4 h-4 appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-bk-yellow transition-all cursor-pointer"
                    />
                    <div className="absolute w-2 h-2 bg-bk-yellow rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className={`text-[11px] font-medium tracking-wide transition-colors ${radio === 0 ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>Pre-defined backup volumes</span>
                </label>

                <div className={`space-y-3 transition-all ${radio !== 0 ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                  <div className="relative pl-7">
                    <select 
                        value={selectedUnload}
                        onChange={(e) => handleUnloadSelectChange(e.target.value)}
                        className="w-full h-9 px-3 pr-8 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium appearance-none transition-all"
                    >
                        {unloadList.map(db => (
                            <option key={db.dbname} value={db.dbname}>{db.dbname}</option>
                        ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-lg">expand_more</span>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/20 dark:bg-bk-main/30 ml-7">
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead className="bg-slate-50/80 dark:bg-bk-main/50 text-[10px] font-medium text-slate-400 tracking-wide border-b border-slate-100 dark:border-slate-800">
                        <tr>
                          <th className="px-3 py-2">Flag</th>
                          <th className="px-3 py-2">Volume path</th>
                          <th className="px-3 py-2 text-right">Timestamp</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                        {dataSource.map(row => (
                          <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer" onClick={() => handleTableCheckboxChange(!row.checked, row.key)}>
                            <td className="px-3 py-2">
                                <input 
                                  type="checkbox" 
                                  className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all" 
                                  checked={row.checked} 
                                  readOnly
                                />
                            </td>
                            <td className="px-3 py-2 font-mono text-[10px] text-slate-500 max-w-[280px] truncate">{row.path}</td>
                            <td className="px-3 py-2 text-right font-mono text-[10px] text-slate-400">{row.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Option 2: Custom path */}
              <div className="space-y-3 pt-2 border-t border-slate-50 dark:border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                  <div className="relative flex items-center">
                    <input 
                      type="radio" 
                      name="radioOption" 
                      checked={radio === 1}
                      onChange={() => setRadio(1)}
                      className="peer w-4 h-4 appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-bk-yellow transition-all cursor-pointer"
                    />
                    <div className="absolute w-2 h-2 bg-bk-yellow rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                  </div>
                  <span className={`text-[11px] font-medium tracking-wide transition-colors ${radio === 1 ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400'}`}>Manual volume paths</span>
                </label>

                <div className={`space-y-2 pl-7 transition-all ${radio !== 1 ? 'opacity-30 grayscale pointer-events-none' : ''}`}>
                  {['schema', 'object', 'index', 'trigger'].map(type => (
                    <div key={type} className="flex items-center gap-3 group">
                      <div className="w-32 shrink-0 flex items-center gap-2.5">
                          <input 
                            type="checkbox"
                            checked={formData.checkBoxes[type]}
                            onChange={(e) => handleCheckBoxChange(type, e.target.checked)}
                            className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all"
                          />
                        <span className="text-[10px] font-medium text-slate-400 tracking-wide">Load {type}</span>
                      </div>
                      <input 
                        type="text"
                        value={formData.unloadFiles[type]}
                        onChange={(e) => handleUnloadPathChange(type, e.target.value)}
                        disabled={!formData.checkBoxes[type]}
                        placeholder="/absolute/path/to/file"
                        className={`flex-1 h-8 px-3 rounded text-[11px] border transition-all outline-none font-medium
                          ${!formData.checkBoxes[type]
                            ? 'bg-slate-50 dark:bg-bk-main/10 border-slate-100 dark:border-slate-800 text-slate-300 cursor-not-allowed'
                            : 'bg-white dark:bg-bk-main/30 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-bk-yellow/50'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section: Load Option */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Load behaviors</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 px-1">
              {[
                  { id: 'checkoption', label: 'Verify syntax before load' },
                  { id: 'nolog', label: "Suppress log generation" },
                  { id: 'oiduse', label: "Ignore object identifiers (OID)" },
                  { id: 'statisticsuse', label: "Skip statistics update" },
              ].map(opt => (
                <label key={opt.id} className="flex items-center gap-2.5 cursor-pointer group">
                  <input 
                    type="checkbox"
                    checked={formData.checkBoxes[opt.id]}
                    onChange={(e) => handleCheckBoxChange(opt.id, e.target.checked)}
                    className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all"
                  />
                  <span className="text-[11px] font-medium text-slate-500 group-hover:text-slate-700 dark:text-slate-400 dark:group-hover:text-slate-200 transition-colors tracking-tight">{opt.label}</span>
                </label>
              ))}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-50 dark:border-white/5">
              {[
                  { id: 'estimated', label: 'Estimated instance count', type: 'number', placeholder: '0' },
                  { id: 'period', label: 'Periodic commit threshold', type: 'number', placeholder: '1000' },
                  { id: 'errorcontrolfile', label: 'Error control definition', type: 'text' },
                  { id: 'ignoreclassfile', label: 'Excluded table definition', type: 'text' },
              ].map(item => (
                <div key={item.id} className="flex items-center gap-3 group">
                  <div className="w-52 shrink-0 flex items-center gap-2.5">
                      <input 
                        type="checkbox"
                        checked={formData.checkBoxes[item.id]}
                        onChange={(e) => handleCheckBoxChange(item.id, e.target.checked)}
                        className="h-3.5 w-3.5 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow transition-all"
                      />
                    <label className={`text-[10px] font-medium tracking-wide transition-colors ${formData.checkBoxes[item.id] ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>{item.label}</label>
                  </div>
                  <input 
                    type={item.type}
                    value={formData.values[item.id]}
                    onChange={(e) => handleValueChange(item.id, e.target.value)}
                    disabled={!formData.checkBoxes[item.id]}
                    placeholder={item.placeholder || ""}
                    className={`flex-1 h-8 px-3 rounded text-[11px] border transition-all outline-none font-medium
                      ${!formData.checkBoxes[item.id]
                        ? 'bg-slate-50 dark:bg-bk-main/10 border-slate-100 dark:border-slate-800 text-slate-300 cursor-not-allowed'
                        : 'bg-white dark:bg-bk-main/30 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:border-bk-yellow/50'}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            disabled={isLoading}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={() => dispatch(closeLoadDBModal())}
          >
            Discard
          </button>
          <button 
            disabled={isLoading}
            className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-50"
            onClick={handleLoadDatabase}
          >
            {isLoading ? (
              <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">play_circle</span>
                <span>Run load</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
