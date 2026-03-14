import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeDatabasePropertyModal } from '../databaseSlice';
import { hostApi } from '../../host/hostApi';

// Metadata for CUBRID Advanced Parameters based on d-cms ConfConstants.java
const ADVANCED_PARAMS_SCHEMA = [
  { key: 'access_ip_control', type: 'bool(yes|no)', default: 'no', scope: 'SERVER' },
  { key: 'async_commit', type: 'bool(yes|no)', default: 'no', scope: 'SERVER' },
  { key: 'backup_volume_max_size_bytes', type: 'int', default: '-1', scope: 'SERVER' },
  { key: 'block_ddl_statement', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'block_nowhere_statement', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'compat_primary_key', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'csql_history_num', type: 'int', default: '50', scope: 'CLIENT' },
  { key: 'dont_reuse_heap_file', type: 'bool(yes|no)', default: 'no', scope: 'SERVER' },
  { key: 'error_log', type: 'string', default: 'cubrid.err', scope: 'BOTH' },
  { key: 'file_lock', type: 'bool(yes|no)', default: 'yes', scope: 'SERVER' },
  { key: 'group_commit_interval_in_msecs', type: 'int', default: '0', scope: 'SERVER' },
  { key: 'ha_mode', type: 'string(on|off|yes|no)', default: 'off', scope: 'SERVER' },
  { key: 'index_scan_in_oid_order', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'insert_execution_mode', type: 'int', default: '1', scope: 'CLIENT' },
  { key: 'lock_timeout_message_type', type: 'int', default: '0', scope: 'SERVER' },
  { key: 'max_plan_cache_entries', type: 'int', default: '1000', scope: 'BOTH' },
  { key: 'max_query_cache_entries', type: 'int', default: '-1', scope: 'SERVER' },
  { key: 'media_failure_support', type: 'bool(yes|no)', default: 'yes', scope: 'SERVER' },
  { key: 'oracle_style_empty_string', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'oracle_style_outerjoin', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'query_cache_mode', type: 'int', default: '0', scope: 'SERVER' },
  { key: 'temp_file_max_size_in_pages', type: 'int', default: '-1', scope: 'SERVER' },
  { key: 'temp_file_memory_size_in_pages', type: 'int', default: '4', scope: 'SERVER' },
  { key: 'uj_job_timeout', type: 'int', default: '0', scope: 'SERVER' },
  { key: 'unfill_factor', type: 'float', default: '0.1', scope: 'SERVER' }
];

// Parameters explicitly shown in the General tab should be hidden in Advanced tab
const GENERAL_PARAMS_KEYS = [
  'data_buffer_pages', 'data_buffer_size', 'sort_buffer_pages', 'sort_buffer_size',
  'log_buffer_pages', 'log_buffer_size', 'lock_escalation', 'lock_timeout_in_secs',
  'deadlock_detection_interval_in_secs', 'checkpoint_interval_in_mins', 'isolation_level', 'cubrid_port_id'
];

export default function DatabasePropertyModal() {
  const dispatch = useDispatch();
  const { isDatabasePropertyModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [activeTab, setActiveTab] = useState('General');
  const [activeSidebar, setActiveSidebar] = useState('Server Common');
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({});
  const [units, setUnits] = useState({ data: 'MB', sort: 'MB', log: 'MB' });
  const [bufferSettings, setBufferSettings] = useState({
    data: 'size', sort: 'size', log: 'size'
  });

  useEffect(() => {
    if (isDatabasePropertyModalOpen) {
      if (selectedDatabase) {
        setActiveSidebar('Database Config');
      } else {
        setActiveSidebar('Server Common');
      }
    }
  }, [isDatabasePropertyModalOpen, selectedDatabase]);

  useEffect(() => {
    if (isDatabasePropertyModalOpen && selectedHostUid) {
      const fetchParams = async () => {
        setLoading(true);
        try {
          const response = await hostApi.getHostConfig(selectedHostUid, 'cubridconf');
          const lines = response?.conflist?.[0]?.confdata || [];
          let currentSection = '';
          const newParams = {};
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
              currentSection = trimmed.slice(1, -1).toLowerCase();
              continue;
            }
            
            const targetSection = activeSidebar === 'Server Common' ? 'common' : selectedDatabase?.toLowerCase();
            if (currentSection === targetSection) {
              const [key, ...valueParts] = trimmed.split('=');
              const k = key?.trim();
              let v = valueParts.join('=').trim();
              if (k) {
                // Detect units for buffers
                if (k.endsWith('_buffer_size')) {
                  const unit = v.slice(-1).toUpperCase();
                  if (['K', 'M', 'G', 'T'].includes(unit)) {
                    const unitMap = { 'K': 'KB', 'M': 'MB', 'G': 'GB', 'T': 'TB' };
                    const prefix = k.split('_')[0];
                    setUnits(prev => ({ ...prev, [prefix]: unitMap[unit] || 'MB' }));
                    v = v.slice(0, -1);
                  }
                  const prefix = k.split('_')[0];
                  setBufferSettings(prev => ({ ...prev, [prefix]: 'size' }));
                } else if (k.endsWith('_buffer_pages')) {
                  const prefix = k.split('_')[0];
                  setBufferSettings(prev => ({ ...prev, [prefix]: 'pages' }));
                }
                newParams[k] = v;
              }
            }
          }
          setParams(newParams);
        } catch (err) {
          console.error('Failed to fetch config for properties:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchParams();
    }
  }, [isDatabasePropertyModalOpen, selectedDatabase, selectedHostUid, activeSidebar]);

  if (!isDatabasePropertyModalOpen) return null;

  const handleApply = async () => {
    setLoading(true);
    try {
      const finalParams = { ...params };
      
      // Post-process buffers to match d-cms logic
      ['data', 'sort', 'log'].forEach(prefix => {
        const setting = bufferSettings[prefix];
        if (setting === 'size') {
          const val = params[`${prefix}_buffer_size`];
          const unit = units[prefix].slice(0, 1); // K, M, G, T
          if (val) {
            finalParams[`${prefix}_buffer_size`] = `${val}${unit}`;
          }
          // Remove pages param when size is used to avoid conflicts in CUBRID
          delete finalParams[`${prefix}_buffer_pages`];
        } else {
          // Remove size param when pages is used
          delete finalParams[`${prefix}_buffer_size`];
        }
      });

      const section = activeSidebar === 'Server Common' ? 'common' : `[@${selectedDatabase}]`;
      const payload = {
        hostUid: selectedHostUid,
        confname: 'cubridconf',
        section,
        params: finalParams
      };

      await hostApi.setHostConfig(selectedHostUid, payload);
      dispatch(closeDatabasePropertyModal());
    } catch (err) {
      console.error('Failed to save properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({ label, paramKey, disabled }) => (
    <div className="flex items-center gap-4 mb-2.5 last:mb-0">
      <label className={`w-[180px] text-[10px] font-medium ${disabled ? 'text-slate-400 opacity-50' : 'text-slate-500 dark:text-slate-400'}`}>{label}</label>
      <div className="flex-1 relative group/field">
        <input
          type="text"
          value={params[paramKey] || ''}
          onChange={(e) => setParams({ ...params, [paramKey]: e.target.value })}
          disabled={disabled}
          className={`w-full h-8 px-3 bg-slate-50 dark:bg-bk-main/30 border ${disabled ? 'border-slate-100 dark:border-slate-800/50 opacity-30 shadow-none' : 'border-slate-200 dark:border-slate-800'} rounded focus:outline-none focus:border-bk-yellow/50 text-[11px] text-slate-900 dark:text-slate-100 transition-all font-medium`}
        />
      </div>
    </div>
  );

  const BufferGroup = ({ title, prefix, settingKey }) => {
    const isPages = bufferSettings[settingKey] === 'pages';
    const isSize = bufferSettings[settingKey] === 'size';

    return (
      <div className="space-y-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">{title}</span>
          <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
        </div>
        <div className="space-y-2.5 px-1">
          <div className="flex items-center gap-3">
             <input 
               type="radio" 
               checked={isPages} 
               onChange={() => setBufferSettings(s => ({ ...s, [settingKey]: 'pages' }))}
               className="w-4 h-4 cursor-pointer rounded-full border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow"
             />
             <label className={`w-[160px] text-[11px] font-medium transition-colors ${!isPages ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}`}>{prefix}_buffer_pages</label>
             <input
               type="text"
               value={params[`${prefix}_buffer_pages`] || ''}
               onChange={(e) => setParams({ ...params, [`${prefix}_buffer_pages`]: e.target.value })}
               disabled={!isPages}
               className={`flex-1 h-8 px-3 bg-slate-50 dark:bg-bk-main/30 border ${!isPages ? 'border-slate-100 dark:border-slate-800/50 opacity-30 shadow-none' : 'border-slate-200 dark:border-slate-800'} rounded focus:outline-none focus:border-bk-yellow/50 text-[11px] text-slate-900 dark:text-slate-100 transition-all font-medium`}
             />
          </div>
          <div className="flex items-center gap-3">
             <input 
               type="radio" 
               checked={isSize} 
               onChange={() => setBufferSettings(s => ({ ...s, [settingKey]: 'size' }))}
               className="w-4 h-4 cursor-pointer rounded-full border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-bk-yellow focus:ring-bk-yellow/50 accent-bk-yellow"
             />
             <label className={`w-[160px] text-[11px] font-medium transition-colors ${!isSize ? 'text-slate-400 dark:text-slate-600' : 'text-slate-700 dark:text-slate-300'}`}>{prefix}_buffer_size</label>
             <div className="flex-1 flex gap-2">
               <input
                 type="text"
                 value={params[`${prefix}_buffer_size`] || ''}
                 onChange={(e) => setParams({ ...params, [`${prefix}_buffer_size`]: e.target.value })}
                 disabled={!isSize}
                 className={`flex-1 h-8 px-3 bg-slate-50 dark:bg-bk-main/30 border ${!isSize ? 'border-slate-100 dark:border-slate-800/50 opacity-30 shadow-none' : 'border-slate-200 dark:border-slate-800'} rounded focus:outline-none focus:border-bk-yellow/50 text-[11px] text-slate-900 dark:text-slate-100 transition-all font-medium`}
               />
               <select 
                 value={units[prefix]}
                 onChange={(e) => setUnits(u => ({ ...u, [prefix]: e.target.value }))}
                 className={`bg-slate-50 dark:bg-bk-main/50 border border-slate-200 dark:border-slate-800 rounded px-2 py-1 text-[10px] text-slate-600 dark:text-slate-400 outline-none w-18 cursor-pointer ${!isSize && 'opacity-30'}`}
               >
                 <option>KB</option>
                 <option>MB</option>
                 <option>GB</option>
                 <option>TB</option>
               </select>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const AdvancedPropertyTable = () => {
    // Filter out General parameters and merge with schema
    const data = ADVANCED_PARAMS_SCHEMA.map(p => ({
      ...p,
      currentValue: params[p.key] !== undefined ? params[p.key] : p.default,
      isModified: params[p.key] !== undefined
    }));

    return (
      <div className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/20 dark:bg-bk-main/10 flex flex-col flex-1">
          <div className="sticky top-0 bg-slate-100 dark:bg-bk-main flex border-b border-slate-200 dark:border-slate-800 z-10">
            <div className="w-[35%] px-4 py-2.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Parameter Name</div>
            <div className="w-[15%] px-4 py-2.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-l border-slate-200 dark:border-slate-800">Target</div>
            <div className="w-[15%] px-4 py-2.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-l border-slate-200 dark:border-slate-800 text-center">Value Type</div>
            <div className="flex-1 px-4 py-2.5 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-l border-slate-200 dark:border-slate-800">Value</div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {data.map((item, idx) => (
              <div key={item.key} className={`flex border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group ${idx % 2 === 0 ? 'bg-white/40 dark:bg-transparent' : ''}`}>
                <div className="w-[35%] px-4 py-2 flex items-center">
                  <span className={`text-[11px] font-medium ${item.isModified ? 'text-bk-yellow' : 'text-slate-700 dark:text-slate-300'}`}>{item.key}</span>
                </div>
                <div className="w-[15%] px-4 py-2 flex items-center border-l border-slate-100 dark:border-slate-800/30">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-medium text-slate-500 dark:text-slate-400">{item.scope}</span>
                </div>
                <div className="w-[15%] px-4 py-2 flex items-center justify-center border-l border-slate-100 dark:border-slate-800/30">
                  <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{item.type.split('(')[0]}</span>
                </div>
                <div className="flex-1 px-3 py-1.5 flex items-center border-l border-slate-100 dark:border-slate-800/30">
                  <input
                    type="text"
                    value={item.currentValue}
                    onChange={(e) => setParams({ ...params, [item.key]: e.target.value })}
                    className={`w-full h-7 px-2.5 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-bk-yellow/40 focus:bg-white dark:focus:bg-bk-main/50 rounded text-[11px] transition-all outline-none ${item.isModified ? 'text-bk-yellow font-bold' : 'text-slate-500 dark:text-slate-400 italic'}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[10px] text-slate-400 italic dark:text-slate-500 flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-[14px]">info</span>
          Parameters in <span className="text-bk-yellow font-bold">Gold</span> are explicitly defined in the config. Other values represent CUBRID defaults.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
      <div className="bg-white dark:bg-bk-side w-full max-w-[850px] shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden rounded-xl animate-in zoom-in-95 duration-300 flex flex-col relative h-[680px]">
        
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">tune</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide uppercase">
                {activeSidebar === 'Server Common' ? 'Server Properties' : `Database Properties [${selectedDatabase}]`}
              </h3>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={() => dispatch(closeDatabasePropertyModal())}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-56 bg-slate-50/30 dark:bg-bk-main/20 border-r border-slate-100 dark:border-slate-800/50 flex flex-col py-3 overflow-y-auto">
            {[
              { id: 'Server Common', label: 'Common Params', icon: 'hub' },
              { id: 'Database Config', label: 'DB Overrides', icon: 'settings_backup_restore' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSidebar(item.id)}
                className={`flex items-center gap-3 px-5 py-2.5 text-[11px] font-medium transition-all relative group
                  ${activeSidebar === item.id 
                    ? 'text-bk-yellow bg-bk-yellow/5' 
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5'}`}
              >
                <span className={`material-symbols-outlined text-[18px] ${activeSidebar === item.id ? 'text-bk-yellow' : 'text-slate-400 opacity-60'}`}>{item.icon}</span>
                <span className="tracking-tight">{item.label}</span>
                {activeSidebar === item.id && (
                  <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-bk-yellow rounded-r"></div>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col bg-white dark:bg-transparent overflow-hidden">
            {/* Sub-Tabs */}
            <div className="px-6 flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-bk-main/10 flex-shrink-0">
               {['General', 'Advanced'].map(tab => (
                 <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-3 text-[11px] font-medium transition-all relative
                      ${activeTab === tab ? 'text-bk-yellow' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    {tab}
                    {activeTab === tab && (
                      <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-bk-yellow rounded-t-full shadow-[0_-2px_8px_rgba(252,211,77,0.3)]"></div>
                    )}
                 </button>
               ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-60">
                  <div className="w-8 h-8 border-2 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div>
                  <span className="text-[10px] font-medium tracking-widest text-slate-500 uppercase">Synchronizing...</span>
                </div>
              ) : activeTab === 'General' ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <BufferGroup title="Cache and Data Buffers" prefix="data" settingKey="data" />
                  <BufferGroup title="Sort and Join Parameters" prefix="sort" settingKey="sort" />
                  <BufferGroup title="Transaction Log Processing" prefix="log" settingKey="log" />

                  <div className="space-y-4 pt-1">
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Other common parameters</span>
                       <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                    </div>
                    <div className="space-y-1 px-1">
                       <InputField label="lock_escalation" paramKey="lock_escalation" />
                       <InputField label="lock_timeout_in_secs" paramKey="lock_timeout_in_secs" />
                       <InputField label="deadlock_interval" paramKey="deadlock_detection_interval_in_secs" />
                       <InputField label="checkpoint_interval" paramKey="checkpoint_interval_in_mins" />
                       
                       <div className="flex items-center gap-4 py-1.5">
                         <label className="w-[180px] text-[10px] font-medium text-slate-500 dark:text-slate-400">isolation_level</label>
                         <div className="flex-1 relative">
                           <select 
                             value={params.isolation_level || 'TRAN_REP_CLASS_UNCOMMIT_INSTANCE'}
                             onChange={(e) => setParams({ ...params, isolation_level: e.target.value })}
                             className="w-full h-8 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded px-3 py-1 text-[11px] text-slate-700 dark:text-slate-200 font-medium outline-none appearance-none cursor-pointer"
                           >
                             <option>TRAN_SERIALIZABLE</option>
                             <option>TRAN_REP_CLASS_REP_INSTANCE</option>
                             <option>TRAN_REP_CLASS_COMMIT_INSTANCE</option>
                             <option>TRAN_REP_CLASS_UNCOMMIT_INSTANCE</option>
                             <option>TRAN_COMMIT_CLASS_COMMIT_INSTANCE</option>
                             <option>TRAN_COMMIT_CLASS_UNCOMMIT_INSTANCE</option>
                           </select>
                           <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-sm">filter_list</span>
                         </div>
                       </div>

                       <InputField label="cubrid_port_id" paramKey="cubrid_port_id" />
                    </div>
                  </div>
                </div>
              ) : (
                <AdvancedPropertyTable />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            onClick={() => dispatch(closeDatabasePropertyModal())}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
          >
            Discard
          </button>
          <button 
            onClick={handleApply}
            className="px-8 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[140px]"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            <span>Apply changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
