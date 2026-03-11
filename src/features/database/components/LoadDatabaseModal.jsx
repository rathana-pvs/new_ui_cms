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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-3xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]">
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white dark:bg-[#1e2230]/80">
            <div className="flex flex-col items-center gap-3 font-medium">
              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-sm animate-spin"></div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans tracking-wide">Loading Database...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-800/50">
          <h3 className="text-[15px] font-bold text-slate-700 dark:text-white">
            Load Database
          </h3>
          <button 
            onClick={() => dispatch(closeLoadDBModal())}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="px-5 py-4 overflow-y-auto space-y-5 custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          
          {/* Section: Database Information */}
          <fieldset className="border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-3.5">
            <legend className="text-[12px] font-bold text-slate-500 dark:text-slate-400 px-2 mx-2 uppercase tracking-wider">Database Information</legend>
            <div className="flex items-center gap-4">
              <label className="w-[180px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right uppercase tracking-tight">Target database name :</label>
              <input 
                type="text" 
                name="targetDbName"
                value={formData.targetDbName}
                readOnly
                className="flex-1 h-[34px] px-3 rounded-md text-[13px] border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-500 cursor-default outline-none shadow-sm"
              />
            </div>
            <div className="flex items-center gap-4">
              <label className="w-[180px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right uppercase tracking-tight">
                Username <span className="text-rose-500">*</span> :
              </label>
              <input 
                type="text" 
                name="dbUsername"
                value={formData.dbUsername}
                onChange={handleInputChange}
                className="flex-1 h-[34px] px-3 rounded-md text-[13px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none focus:border-blue-500 shadow-sm"
              />
            </div>
          </fieldset>

          {/* Section: Unload Files */}
          <fieldset className="border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-3.5">
            <legend className="text-[12px] font-bold text-slate-500 dark:text-slate-400 px-2 mx-2 uppercase tracking-wider">Unload Files</legend>
                
            <div className="flex items-center gap-3">
                <input 
                    type="radio" 
                    name="radioOption" 
                    checked={radio === 0}
                    onChange={() => setRadio(0)}
                    className="h-5 w-5 rounded-full border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer bg-white dark:bg-[#1e2230]"
                />
                <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300 shrink-0">Custom Path :</label>
                <select 
                    value={selectedUnload}
                    onChange={(e) => handleUnloadSelectChange(e.target.value)}
                    disabled={radio !== 0}
                    className="flex-1 h-[34px] px-3 rounded-md text-[13px] border border-slate-300 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none focus:border-blue-500 disabled:opacity-30 shadow-sm font-bold"
                >
                    {unloadList.map(db => (
                        <option key={db.dbname} value={db.dbname}>{db.dbname}</option>
                    ))}
                </select>
            </div>

            <div className={`border border-slate-200 dark:border-slate-800 rounded-md flex flex-col bg-white dark:bg-slate-900 overflow-hidden transition-opacity ${radio !== 0 ? 'opacity-30 shadow-none' : 'shadow-sm'}`}>
                <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                        <tr>
                            <th className="px-5 py-2">Load Type</th>
                            <th className="px-5 py-2">Path</th>
                            <th className="px-5 py-2 text-right">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                        {dataSource.map(row => (
                            <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-blue-900/10 transition-colors">
                                <td className="px-5 py-2 flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        className="h-[15px] w-[15px] rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 cursor-pointer bg-white dark:bg-[#1e2230]" 
                                        checked={row.checked} 
                                        disabled={radio !== 0}
                                        onChange={(e) => handleTableCheckboxChange(e.target.checked, row.key)}
                                    />
                                    <span className="capitalize font-bold text-[13px]">{row.loadType}</span>
                                </td>
                                <td className="px-5 py-2 font-mono text-[11px] truncate max-w-[300px] text-slate-500 dark:text-slate-400">{row.path}</td>
                                <td className="px-5 py-2 text-[11px] text-right text-slate-400 dark:text-slate-500 font-bold">{row.date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
                <div className="flex items-center gap-3">
                    <input 
                        type="radio" 
                        name="radioOption" 
                        checked={radio === 1}
                        onChange={() => setRadio(1)}
                        className="h-5 w-5 rounded-full border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 transition-all cursor-pointer bg-white dark:bg-[#1e2230]"
                    />
                    <label className="text-[13px] font-bold text-slate-600 dark:text-slate-300">Unloaded file from :</label>
                </div>

                <div className="space-y-3 pl-8">
                    {['schema', 'object', 'index', 'trigger'].map(type => (
                        <div key={type} className={`flex items-center gap-4 transition-opacity ${radio !== 1 ? 'opacity-30' : ''}`}>
                            <label className="flex items-center gap-3 w-[150px] shrink-0 cursor-pointer group">
                                <input 
                                    type="checkbox"
                                    checked={formData.checkBoxes[type]}
                                    onChange={(e) => handleCheckBoxChange(type, e.target.checked)}
                                    disabled={radio !== 1}
                                    className="h-[16px] w-[16px] rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 cursor-pointer bg-white dark:bg-[#1e2230]"
                                />
                                <span className="text-[12px] font-bold text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors capitalize tracking-tight">Load {type}</span>
                            </label>
                            <input 
                                type="text"
                                value={formData.unloadFiles[type]}
                                onChange={(e) => handleUnloadPathChange(type, e.target.value)}
                                disabled={radio !== 1 || !formData.checkBoxes[type]}
                                className={`flex-1 h-[34px] px-3 rounded-md text-[13px] border transition-all outline-none shadow-sm
                                  ${(radio !== 1 || !formData.checkBoxes[type])
                                    ? 'bg-slate-50/50 dark:bg-slate-800/10 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-600 italic cursor-not-allowed shadow-none'
                                    : 'bg-white dark:bg-[#1e2230] border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 focus:border-blue-500'}`}
                            />
                        </div>
                    ))}
                </div>
            </div>
          </fieldset>

          {/* Section: Load Option */}
          <fieldset className="border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-3.5">
            <legend className="text-[12px] font-bold text-slate-500 dark:text-slate-400 px-2 mx-2 uppercase tracking-wider">Load Options</legend>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 pl-4">
                {[
                    { id: 'checkoption', label: 'check syntax and load database' },
                    { id: 'nolog', label: "Don't create log" },
                    { id: 'oiduse', label: "Don't use OID" },
                    { id: 'statisticsuse', label: "Don't update statistics" },
                ].map(opt => (
                    <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                            type="checkbox"
                            checked={formData.checkBoxes[opt.id]}
                            onChange={(e) => handleCheckBoxChange(opt.id, e.target.checked)}
                            className="h-[18px] w-[18px] rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 cursor-pointer bg-white dark:bg-[#1e2230]"
                        />
                        <span className="text-[13px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{opt.label}</span>
                    </label>
                ))}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3.5">
                {[
                    { id: 'estimated', label: 'Estimated number of instances', type: 'number' },
                    { id: 'period', label: 'Insertion count for periodic commit', type: 'number' },
                    { id: 'errorcontrolfile', label: 'Using error control file', type: 'text' },
                    { id: 'ignoreclassfile', label: 'Ignored table file', type: 'text' },
                ].map(item => (
                    <div key={item.id} className="flex items-center gap-4">
                        <label className="w-[240px] shrink-0 flex items-center gap-3 cursor-pointer group">
                            <input 
                                type="checkbox"
                                checked={formData.checkBoxes[item.id]}
                                onChange={(e) => handleCheckBoxChange(item.id, e.target.checked)}
                                className="h-[18px] w-[18px] rounded border-slate-300 dark:border-slate-800 text-blue-600 focus:ring-blue-500/20 cursor-pointer bg-white dark:bg-[#1e2230]"
                            />
                            <span className="text-[13px] text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{item.label}</span>
                        </label>
                        <input 
                            type={item.type}
                            value={formData.values[item.id]}
                            onChange={(e) => handleValueChange(item.id, e.target.value)}
                            disabled={!formData.checkBoxes[item.id]}
                            className={`flex-1 h-[34px] px-3 rounded-md text-[13px] border transition-all outline-none shadow-sm
                              ${!formData.checkBoxes[item.id]
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
            onClick={() => dispatch(closeLoadDBModal())}
          >
            Cancel
          </button>
          <button 
            className="h-[34px] px-6 bg-blue-600 hover:bg-blue-700 text-white text-[13px] rounded-md shadow-sm transition-all font-bold disabled:opacity-50 flex items-center justify-center gap-2"
            onClick={handleLoadDatabase}
            disabled={isLoading}
          >
            {isLoading ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-sm animate-spin"></div>
            ) : (
                <>
                    <span className="material-symbols-outlined text-[18px]">check</span>
                    <span>Load Database</span>
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
