import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeLoadDBModal } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';
import { databaseApi } from '../databaseApi';

export default function LoadDatabaseModal() {
  const dispatch = useDispatch();
  const { isLoadDBModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [unloadList, setUnloadList] = useState([]);
  const [selectedUnload, setSelectedUnload] = useState("");
  const [dataSource, setDataSource] = useState([]);
  const [radio, setRadio] = useState(0); // 0: Custom Path, 1: Specific Files

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

  const updateDataSource = (rawData) => {
    // 1. Get entries and filter out 'dbname'
    const convertedList = Object.entries(rawData)
      .filter(([key]) => key !== 'dbname')
      .map(([key, value]) => {
        // 2. Split path and date by the semicolon
        const [path, date] = value.split(';');

        return {
          loadType: key, // "object" or "schema"
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

      // Fetch unload info
      databaseApi.getUnloadInfo(selectedHostUid).then((res) => {
        // Assuming project response structure matches reference: res.result.database
        const dbs = res.database || []; // Adjusting based on common patterns if res.result.database is nested
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
    try {
      const toYesNo = (val) => (val ? "yes" : "no");
      let loadObject = {};

      if (radio === 0) {
        // Custom Path logic
        ["index", "schema", "object", "trigger"].forEach(item => {
          const found = dataSource.find(res => res.checked && res.loadType === item);
          loadObject[item] = found ? found.path : "none";
        });
      } else {
        // Specific Files logic
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
        title: 'Load Success',
        message: 'Database load has been initiated successfully.'
      }));
    } catch (err) {
      console.error('Failed to load database:', err);
      dispatch(showStatusModal({
        type: 'error',
        title: 'Load Failed',
        message: err.response?.data?.message || 'Failed to initiate database load'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-2xl rounded shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white/60 dark:bg-[#1e2230]/60 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-2 font-normal">
              <div className="w-8 h-8 border-3 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              <span className="text-[12px] text-slate-500 dark:text-slate-400">Loading...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230] flex-shrink-0">
          <h3 className="text-[13px] font-normal text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[18px]">download</span>
            Load Database
          </h3>
          <button 
            onClick={() => dispatch(closeLoadDBModal())}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4 custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          
          {/* Section: Database Information */}
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-3 pt-4 mt-2">
            <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                Database Information
              </span>
            </div>
            <div className="space-y-2.5 px-2">
              <div className="flex items-center gap-2">
                <label className="w-44 shrink-0 text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">Target database name :</label>
                <div className="flex-1">
                  <input 
                    type="text" 
                    name="targetDbName"
                    value={formData.targetDbName}
                    readOnly
                    className="w-full h-8 px-2 rounded-lg text-[12px] border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/10 text-slate-400 dark:text-slate-500 cursor-default outline-none font-normal"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <label className="w-44 shrink-0 text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">Username <span className="text-rose-500">*</span> :</label>
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
            </div>
          </div>

          {/* Section: Unload Files */}
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-3 pt-4 mt-2">
            <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                Unload Files
              </span>
            </div>
            <div className="space-y-3 px-2">
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 w-44 shrink-0 justify-start">
                      <div className="relative flex items-center">
                        <input 
                            type="radio" 
                            name="radioOption" 
                            checked={radio === 0}
                            onChange={() => setRadio(0)}
                            className="peer w-3.5 h-3.5 appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-primary transition-all cursor-pointer"
                        />
                        <div className="absolute w-1.5 h-1.5 bg-primary rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                      </div>
                      <label className="text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">Custom Path :</label>
                    </div>
                    <div className="flex-1 relative">
                      <select 
                          value={selectedUnload}
                          onChange={(e) => handleUnloadSelectChange(e.target.value)}
                          disabled={radio !== 0}
                          className="w-full h-8 px-2 pr-8 rounded-lg text-[12px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-900 dark:text-slate-200 outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/5 disabled:opacity-30 appearance-none transition-all font-normal"
                      >
                          {unloadList.map(db => (
                              <option key={db.dbname} value={db.dbname}>{db.dbname}</option>
                          ))}
                      </select>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <span className="material-symbols-outlined text-[16px]">expand_more</span>
                      </div>
                    </div>
                </div>

                <div className={`border border-slate-200 dark:border-slate-800 rounded-lg flex flex-col bg-slate-50/30 dark:bg-slate-900/10 overflow-hidden transition-all ${radio !== 0 ? 'opacity-30 grayscale-[0.5]' : ''}`}>
                    <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-tight uppercase">
                            <tr>
                                <th className="px-3 py-1.5 font-medium">Load Type</th>
                                <th className="px-3 py-1.5 font-medium">Path</th>
                                <th className="px-3 py-1.5 font-medium text-right">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                            {dataSource.map(row => (
                                <tr key={row.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-3 py-1 flex items-center gap-2">
                                        <div className="relative flex items-center">
                                          <input 
                                              type="checkbox" 
                                              className="peer h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary transition-colors" 
                                              checked={row.checked} 
                                              disabled={radio !== 0}
                                              onChange={(e) => handleTableCheckboxChange(e.target.checked, row.key)}
                                          />
                                          <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                            <span className="material-symbols-outlined text-[12px]">check</span>
                                          </span>
                                        </div>
                                        <span className="capitalize font-normal">{row.loadType}</span>
                                    </td>
                                    <td className="px-3 py-1 text-slate-400 font-mono text-[10px] truncate max-w-[240px] font-normal">{row.path}</td>
                                    <td className="px-3 py-1 text-slate-400 text-[10px] text-right font-normal">{row.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 w-44 shrink-0 justify-start">
                      <div className="relative flex items-center">
                        <input 
                            type="radio" 
                            name="radioOption" 
                            checked={radio === 1}
                            onChange={() => setRadio(1)}
                            className="peer w-3.5 h-3.5 appearance-none rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:border-primary transition-all cursor-pointer"
                        />
                        <div className="absolute w-1.5 h-1.5 bg-primary rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                      </div>
                      <label className="text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">Unloaded file from :</label>
                    </div>

                    <div className="space-y-2 pl-2">
                        {['schema', 'object', 'index', 'trigger'].map(type => (
                            <div key={type} className={`flex items-center gap-2 transition-all ${radio !== 1 ? 'opacity-30' : ''}`}>
                                <label className="flex items-center gap-2 w-44 shrink-0 cursor-pointer group justify-start">
                                    <div className="relative flex items-center">
                                      <input 
                                          type="checkbox"
                                          checked={formData.checkBoxes[type]}
                                          onChange={(e) => handleCheckBoxChange(type, e.target.checked)}
                                          disabled={radio !== 1}
                                          className="peer h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary transition-colors"
                                      />
                                      <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                        <span className="material-symbols-outlined text-[12px]">check</span>
                                      </span>
                                    </div>
                                    <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400 transition-colors capitalize">Load {type} :</span>
                                </label>
                                <div className="flex-1">
                                  <input 
                                      type="text"
                                      value={formData.unloadFiles[type]}
                                      onChange={(e) => handleUnloadPathChange(type, e.target.value)}
                                      disabled={radio !== 1 || !formData.checkBoxes[type]}
                                      className={`w-full h-8 px-2 rounded-lg text-[12px] border transition-all outline-none font-normal
                                        ${(radio !== 1 || !formData.checkBoxes[type])
                                          ? 'bg-slate-50/50 dark:bg-slate-800/10 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 italic cursor-not-allowed'
                                          : 'bg-white dark:bg-[#1e2230] border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:border-primary/50 focus:ring-4 focus:ring-primary/5'}`}
                                  />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
          </div>

          {/* Section: Load Option */}
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-3 pt-4 mt-2">
            <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                Load Option
              </span>
            </div>
            <div className="space-y-4 px-2">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-50/50 dark:bg-slate-800/10 p-3 rounded-lg border border-slate-100 dark:border-slate-800/50">
                    {[
                        { id: 'checkoption', label: 'check syntax and load database' },
                        { id: 'nolog', label: "Don't create log" },
                        { id: 'oiduse', label: "Don't use OID" },
                        { id: 'statisticsuse', label: "Don't update statistics" },
                    ].map(opt => (
                        <label key={opt.id} className="flex items-center gap-2 p-1 rounded-lg cursor-pointer group transition-all">
                            <div className="relative flex items-center">
                              <input 
                                  type="checkbox"
                                  checked={formData.checkBoxes[opt.id]}
                                  onChange={(e) => handleCheckBoxChange(opt.id, e.target.checked)}
                                  className="peer h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary transition-colors"
                              />
                              <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                <span className="material-symbols-outlined text-[12px]">check</span>
                              </span>
                            </div>
                            <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors truncate">{opt.label}</span>
                        </label>
                    ))}
                </div>

                <div className="space-y-2 pt-1 pb-1">
                    {[
                        { id: 'estimated', label: 'Estimated number of instances', type: 'number' },
                        { id: 'period', label: 'Insertion count for periodic commit', type: 'number' },
                        { id: 'errorcontrolfile', label: 'Using error control file', type: 'text' },
                        { id: 'ignoreclassfile', label: 'Ignored table file', type: 'text' },
                    ].map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                            <label className="w-[190px] shrink-0 flex items-center gap-2 cursor-pointer group justify-start">
                                <div className="relative flex items-center">
                                  <input 
                                      type="checkbox"
                                      checked={formData.checkBoxes[item.id]}
                                      onChange={(e) => handleCheckBoxChange(item.id, e.target.checked)}
                                      className="peer h-3.5 w-3.5 cursor-pointer appearance-none rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 checked:bg-primary checked:border-primary transition-colors"
                                  />
                                  <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                                    <span className="material-symbols-outlined text-[12px]">check</span>
                                  </span>
                                </div>
                                <span className="text-[10px] font-normal tracking-tight text-slate-500 dark:text-slate-400 transition-colors truncate uppercase">{item.label} :</span>
                            </label>
                            <div className="flex-1">
                              <input 
                                  type={item.type}
                                  value={formData.values[item.id]}
                                  onChange={(e) => handleValueChange(item.id, e.target.value)}
                                  disabled={!formData.checkBoxes[item.id]}
                                  className={`w-full h-8 px-2 rounded-lg text-[12px] border transition-all outline-none font-normal
                                    ${!formData.checkBoxes[item.id]
                                      ? 'bg-slate-50/50 dark:bg-slate-800/10 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600 italic cursor-not-allowed'
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
            onClick={() => dispatch(closeLoadDBModal())}
          >
            Cancel
          </button>
          <button 
            className="px-6 py-1.5 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white text-xs rounded shadow transition-all flex items-center justify-center gap-2 min-w-[100px] font-normal disabled:opacity-50"
            onClick={handleLoadDatabase}
            disabled={isLoading}
          >
            {isLoading ? (
               <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
                <>
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Load Database</span>
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
