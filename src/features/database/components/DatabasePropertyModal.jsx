import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeDatabasePropertyModal } from '../databaseSlice';
import { hostApi } from '../../host/hostApi';
import { brokerApi } from '../../broker/brokerApi';
import SelectField from '../../../components/common/SelectField';

// Metadata for CUBRID Advanced Parameters based on d-cms ConfConstants.java
const ADVANCED_PARAMS_SCHEMA = [
  { key: 'access_ip_control', type: 'bool(yes|no)', default: 'no', scope: 'SERVER' },
  { key: 'access_ip_control_file', type: 'string', default: '', scope: 'SERVER' },
  { key: 'async_commit', type: 'bool(yes|no)', default: 'no', scope: 'SERVER' },
  { key: 'backup_volume_max_size_bytes', type: 'int', default: '-1', scope: 'SERVER' },
  { key: 'block_ddl_statement', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'block_nowhere_statement', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'call_stack_dump_activation_list', type: 'string', default: '', scope: 'BOTH' },
  { key: 'call_stack_dump_deactivation_list', type: 'string', default: '', scope: 'BOTH' },
  { key: 'call_stack_dump_on_error', type: 'bool(yes|no)', default: 'no', scope: 'BOTH' },
  { key: 'compactdb_page_reclaim_only', type: 'int', default: '0', scope: 'SERVER' },
  { key: 'compat_numeric_division_scale', type: 'bool(yes|no)', default: 'no', scope: 'BOTH' },
  { key: 'compat_primary_key', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'csql_history_num', type: 'int', default: '50', scope: 'CLIENT' },
  { key: 'db_hosts', type: 'string', default: '', scope: 'CLIENT' },
  { key: 'dont_reuse_heap_file', type: 'bool(yes|no)', default: 'no', scope: 'SERVER' },
  { key: 'error_log', type: 'string', default: 'cubrid.err', scope: 'BOTH' },
  { key: 'file_lock', type: 'bool(yes|no)', default: 'yes', scope: 'SERVER' },
  { key: 'garbage_collection', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'group_commit_interval_in_msecs', type: 'int', default: '0', scope: 'SERVER' },
  { key: 'ha_mode', type: 'string(on|off|yes|no|replica)', default: 'off', scope: 'SERVER' },
  { key: 'ha_node_list', type: 'string', default: '', scope: 'SERVER' },
  { key: 'ha_port_id', type: 'int', default: '', scope: 'SERVER' },
  { key: 'hostvar_late_binding', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'index_scan_in_oid_order', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'index_scan_oid_buffer_pages', type: 'int', default: '4', scope: 'SERVER' },
  { key: 'index_scan_oid_buffer_size', type: 'int', default: '65536', scope: 'SERVER' },
  { key: 'insert_execution_mode', type: 'int', default: '1', scope: 'CLIENT' },
  { key: 'intl_mbs_support', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'lock_timeout_message_type', type: 'int', default: '0', scope: 'SERVER' },
  { key: 'max_plan_cache_entries', type: 'int', default: '1000', scope: 'BOTH' },
  { key: 'max_query_cache_entries', type: 'int', default: '-1', scope: 'SERVER' },
  { key: 'media_failure_support', type: 'bool(yes|no)', default: 'yes', scope: 'SERVER' },
  { key: 'oracle_style_empty_string', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'oracle_style_outerjoin', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'pthread_scope_process', type: 'bool(yes|no)', default: 'yes', scope: 'SERVER' },
  { key: 'query_cache_mode', type: 'int', default: '0', scope: 'SERVER' },
  { key: 'query_cache_size_in_pages', type: 'int', default: '-1', scope: 'SERVER' },
  { key: 'single_byte_compare', type: 'bool(yes|no)', default: 'no', scope: 'SERVER' },
  { key: 'temp_file_max_size_in_pages', type: 'int', default: '-1', scope: 'SERVER' },
  { key: 'temp_file_memory_size_in_pages', type: 'int', default: '4', scope: 'SERVER' },
  { key: 'temp_volume_path', type: 'string', default: '', scope: 'SERVER' },
  { key: 'uj_job_timeout', type: 'int', default: '0', scope: 'SERVER' },
  { key: 'unfill_factor', type: 'float', default: '0.1', scope: 'SERVER' },
  { key: 'volume_extension_path', type: 'string', default: '', scope: 'SERVER' }
];

const GENERAL_PARAMS_SCHEMA = {
  data_buffer_pages: '25000',
  data_buffer_size: '512MB',
  sort_buffer_pages: '16',
  sort_buffer_size: '2MB',
  log_buffer_pages: '50',
  log_buffer_size: '4MB',
  lock_escalation: '100000',
  lock_timeout_in_secs: '-1',
  deadlock_detection_interval_in_secs: '1',
  checkpoint_interval_in_mins: '1000',
  isolation_level: 'TRAN_REP_CLASS_UNCOMMIT_INSTANCE',
  cubrid_port_id: '1523',
  max_clients: '100',
  auto_restart_server: 'no',
  replication: 'no'
};

const GENERAL_PARAMS_KEYS = Object.keys(GENERAL_PARAMS_SCHEMA);

const InputField = ({ label, paramKey, disabled, value, defaultValue, onChange, labelWidth = 'w-[140px]' }) => {
  const isModified = value !== undefined && value !== null;
  const displayValue = isModified ? value : defaultValue;
  
  return (
    <div className="flex items-center gap-4 mb-2.5 last:mb-0">
      <label className={`${labelWidth} text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-tight`}>{label}</label>
      <div className="flex-1 relative group/field">
        <input
          type="text"
          value={displayValue || ''}
          onChange={onChange}
          disabled={disabled}
          className={`w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border ${disabled ? 'border-slate-100 dark:border-slate-800/50 opacity-30 shadow-none' : 'border-slate-200 dark:border-slate-800'} rounded focus:outline-none focus:border-bk-yellow/50 text-[11px] transition-all font-medium ${isModified ? 'text-bk-yellow' : 'text-slate-400 italic'}`}
        />
      </div>
    </div>
  );
};

export default function DatabasePropertyModal() {
  const dispatch = useDispatch();
  const { isDatabasePropertyModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid, authorizedHosts } = useSelector((state) => state.host);
  const isAuthorized = selectedHostUid && authorizedHosts.includes(selectedHostUid);
  
  const [activeTab, setActiveTab] = useState('General');
  const [activeSidebar, setActiveSidebar] = useState('Server Parameter');
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({});
  const [rawLines, setRawLines] = useState([]);
  const [units, setUnits] = useState({ data: 'MB', sort: 'MB', log: 'MB' });
  const [bufferSettings, setBufferSettings] = useState({
    data: 'size', sort: 'size', log: 'size'
  });

  const [brokers, setBrokers] = useState([]);
  const [connectionInfo, setConnectionInfo] = useState({
    brokerIp: 'localhost',
    brokerPort: '',
    charset: 'UTF-8'
  });

  // Load selection state on modal open
  useEffect(() => {
    if (isDatabasePropertyModalOpen) {
      if (selectedDatabase) {
        setActiveSidebar('Connection Information');
      } else {
        setActiveSidebar('Server Parameter');
      }
    }
  }, [isDatabasePropertyModalOpen, selectedDatabase]);

  // Fetch brokers only once when modal opens
  useEffect(() => {
    if (isDatabasePropertyModalOpen && selectedHostUid && isAuthorized) {
      const fetchBrokers = async () => {
        try {
          const response = await brokerApi.getBrokerList(selectedHostUid);
          const brokerList = response.result || (Array.isArray(response) ? response[0]?.broker : []);
          if (brokerList && Array.isArray(brokerList)) {
            const list = brokerList.map(b => ({
              label: `${b.name} [${b.port}/${b.status || b.state}]`,
              port: b.port
            }));
            setBrokers(list);
            setConnectionInfo(prev => {
              if (!prev.brokerPort && list.length > 0) {
                return { ...prev, brokerPort: list[0].label };
              }
              return prev;
            });
          }
        } catch (err) {
          console.error('Failed to fetch brokers:', err);
        }
      };
      fetchBrokers();
    }
  }, [isDatabasePropertyModalOpen, selectedHostUid, isAuthorized]);

  // Fetch parameters
  useEffect(() => {
    if (isDatabasePropertyModalOpen && selectedHostUid && isAuthorized) {
      if (activeSidebar === 'Connection Information') return;
      
      const fetchParams = async () => {
        setLoading(true);
        try {
          const response = await hostApi.getHostConfig(selectedHostUid, 'cubridconf');
          const lines = response?.conflist?.[0]?.confdata || [];
          setRawLines(lines);
          let currentSection = '';
          const newParams = {};
          
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
              currentSection = trimmed.slice(1, -1).toLowerCase();
              continue;
            }
            const target = selectedDatabase ? `@${selectedDatabase.toLowerCase()}` : 'common';
            // Match 'common' always, and also match the specific database section if it exists
            if (currentSection === 'common' || (selectedDatabase && currentSection === target)) {
              const [key, ...valueParts] = trimmed.split('=');
              const k = key?.trim();
              let v = valueParts.join('=').trim();
              if (k) {
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
          console.error('Failed to fetch config:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchParams();
    }
  }, [isDatabasePropertyModalOpen, selectedDatabase, selectedHostUid, activeSidebar, isAuthorized]);

  const handleApply = async () => {
    if (activeSidebar === 'Connection Information') {
      dispatch(closeDatabasePropertyModal());
      return;
    }
    setLoading(true);
    try {
      // 1. Prepare the parameters to save
      const saveParams = { ...params };
      ['data', 'sort', 'log'].forEach(prefix => {
        const setting = bufferSettings[prefix];
        const pagesKey = `${prefix}_buffer_pages`;
        const sizeKey = `${prefix}_buffer_size`;
        
        if (setting === 'size') {
          const val = params[sizeKey];
          const unit = units[prefix].charAt(0); // K, M, G, T
          if (val) saveParams[sizeKey] = `${val}${unit}`;
          delete saveParams[pagesKey];
        } else {
          delete saveParams[sizeKey];
        }
      });

      // 2. Modify rawLines to apply changes
      const sectionName = selectedDatabase ? `[@${selectedDatabase.toLowerCase()}]` : '[common]';
      let lines = [...rawLines];
      
      // Find section start and end
      let sectionStartIndex = -1;
      let sectionEndIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().toLowerCase() === sectionName.toLowerCase()) {
          sectionStartIndex = i;
          // Find next section
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim().startsWith('[') && lines[j].trim().endsWith(']')) {
              sectionEndIndex = j;
              break;
            }
          }
          if (sectionEndIndex === -1) sectionEndIndex = lines.length;
          break;
        }
      }

      if (sectionStartIndex === -1) {
        // Section not found, append to end
        lines.push("");
        lines.push(sectionName);
        sectionStartIndex = lines.length - 1;
        sectionEndIndex = lines.length;
      }

      const sectionLines = lines.slice(sectionStartIndex + 1, sectionEndIndex);
      const otherBefore = lines.slice(0, sectionStartIndex + 1);
      const otherAfter = lines.slice(sectionEndIndex);

      // Update existing or add new
      const updatedSection = [...sectionLines];
      Object.entries(saveParams).forEach(([key, value]) => {
        let found = false;
        for (let i = 0; i < updatedSection.length; i++) {
          const trimmed = updatedSection[i].trim();
          if (trimmed.startsWith('#')) continue;
          if (trimmed.split('=')[0].trim().toLowerCase() === key.toLowerCase()) {
            updatedSection[i] = `${key}=${value}`;
            found = true;
            break;
          }
        }
        if (!found) {
          updatedSection.push(`${key}=${value}`);
        }
      });

      const finalConfData = [...otherBefore, ...updatedSection, ...otherAfter];
      const payload = {
        confname: 'cubridconf',
        confdata: finalConfData
      };

      await hostApi.setHostConfig(selectedHostUid, payload);
      dispatch(closeDatabasePropertyModal());
    } catch (err) {
      console.error('Failed to save properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const advancedData = useMemo(() => ADVANCED_PARAMS_SCHEMA
    .filter(p => !GENERAL_PARAMS_KEYS.includes(p.key))
    .map(p => ({
      ...p,
      currentValue: params[p.key] !== undefined ? params[p.key] : p.default,
      isModified: params[p.key] !== undefined
    })), [params]);

  if (!isDatabasePropertyModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-bk-side w-full max-w-[700px] shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden rounded-xl animate-in zoom-in-95 duration-200 flex flex-col relative h-[600px]">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">tune</span>
            </div>
            <h3 className="text-[12px] font-medium text-slate-900 dark:text-slate-100 leading-none tracking-wide text-left">
              {(activeSidebar === 'Connection Information' ? `${selectedDatabase} CONNECTION` : (selectedDatabase ? `${selectedDatabase} PROPERTIES` : 'SERVER PROPERTIES')).toUpperCase()}
            </h3>
          </div>
          <button onClick={() => dispatch(closeDatabasePropertyModal())} className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-48 bg-slate-50/30 dark:bg-bk-main/20 border-r border-slate-100 dark:border-slate-800/50 flex flex-col py-2 overflow-y-auto">
            {(selectedDatabase ? ['Connection Information', 'Server Parameter'] : ['Server Parameter']).map(id => (
              <button key={id} onClick={() => setActiveSidebar(id)} className={`flex items-center gap-2.5 px-4 py-2 text-[10px] font-medium transition-all relative group ${activeSidebar === id ? 'text-bk-yellow bg-bk-yellow/5' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/5 uppercase tracking-wide'}`}>
                <span className={`material-symbols-outlined text-[16px] ${activeSidebar === id ? 'text-bk-yellow' : 'text-slate-400 opacity-60'}`}>{id === 'Connection Information' ? 'settings_ethernet' : 'hub'}</span>
                <span className="tracking-tight">{id}</span>
                {activeSidebar === id && <div className="absolute left-0 top-1.5 bottom-1.5 w-[2px] bg-bk-yellow rounded-r"></div>}
              </button>
            ))}
          </div>

          <div className="flex-1 flex flex-col bg-white dark:bg-transparent overflow-hidden">
            {activeSidebar === 'Server Parameter' && (
              <div className="px-4 flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/20 dark:bg-bk-main/10 flex-shrink-0">
                {['General', 'Advanced'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2.5 text-[10px] uppercase font-medium transition-all relative ${activeTab === tab ? 'text-bk-yellow' : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                    {tab}
                    {activeTab === tab && <div className="absolute bottom-0 left-3 right-3 h-[1.5px] bg-bk-yellow rounded-t-full"></div>}
                  </button>
                ))}
              </div>
            )}
            
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar flex flex-col">
              {loading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 opacity-60">
                  <div className="w-8 h-8 border-2 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div>
                  <span className="text-[10px] font-medium tracking-widest text-slate-500 uppercase">Synchronizing...</span>
                </div>
              ) : activeSidebar === 'Connection Information' ? (
                /* Inline rendering for Connection Information View to ensure absolute stability */
                <div key="connection-view" className="flex-1 flex flex-col gap-8 animate-in fade-in slide-in-from-right-2 duration-200">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium tracking-widest text-slate-500 uppercase">Connection Information</span>
                      <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800"></div>
                    </div>
                    <div className="px-1 space-y-4">
                      <InputField label="Broker IP:" value={connectionInfo.brokerIp} onChange={(e) => setConnectionInfo({ ...connectionInfo, brokerIp: e.target.value })} />
                      <div className="flex items-center gap-4">
                        <label className="w-[140px] text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-tight">Broker Port:</label>
                        <div className="flex-1">
                          <SelectField 
                            value={connectionInfo.brokerPort} 
                            options={brokers.map(b => ({ value: b.label, label: b.label }))} 
                            onChange={(val) => setConnectionInfo({ ...connectionInfo, brokerPort: val })} 
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="w-[140px] text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-tight">Character set:</label>
                        <div className="flex-1">
                          <SelectField 
                            value={connectionInfo.charset} 
                            options={['UTF-8', 'EUC-KR', 'ISO-8859-1', 'UHC'].map(o => ({ value: o, label: o }))} 
                            onChange={(val) => setConnectionInfo({ ...connectionInfo, charset: val })} 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-auto p-4 bg-bk-yellow/5 border border-bk-yellow/10 rounded-lg flex gap-4 pr-6">
                    <span className="material-symbols-outlined text-bk-yellow text-xl">info</span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed italic">
                      These connection settings establish a communication channel with the database through the CUBRID Broker. Changes affect manager connectivity only.
                    </p>
                  </div>
                </div>
              ) : activeTab === 'General' ? (
                <div key="general-view" className="animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {['data', 'sort', 'log'].map(prefix => {
                    const pagesKey = `${prefix}_buffer_pages`;
                    const sizeKey = `${prefix}_buffer_size`;
                    const hasPages = params[pagesKey] !== undefined;
                    const hasSize = params[sizeKey] !== undefined;
                    
                    return (
                      <div key={prefix} className="space-y-3 mb-5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500 uppercase">{prefix} Buffers</span>
                          <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                        </div>
                        <div className="space-y-2.5 px-1">
                          <div className="flex items-center gap-3">
                            <input type="radio" checked={bufferSettings[prefix] === 'pages'} onChange={() => setBufferSettings(s => ({ ...s, [prefix]: 'pages' }))} className="w-4 h-4 cursor-pointer accent-bk-yellow"/>
                            <label className={`w-[160px] text-[11px] font-medium ${bufferSettings[prefix] !== 'pages' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{pagesKey}</label>
                            <input 
                              type="text" 
                              value={hasPages ? params[pagesKey] : GENERAL_PARAMS_SCHEMA[pagesKey] || ''} 
                              onChange={(e) => setParams({ ...params, [pagesKey]: e.target.value })} 
                              disabled={bufferSettings[prefix] !== 'pages'} 
                              className={`flex-1 h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded text-[11px] focus:outline-none ${hasPages ? 'text-bk-yellow font-medium' : 'text-slate-400 italic'}`}
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <input type="radio" checked={bufferSettings[prefix] === 'size'} onChange={() => setBufferSettings(s => ({ ...s, [prefix]: 'size' }))} className="w-4 h-4 cursor-pointer accent-bk-yellow"/>
                            <label className={`w-[160px] text-[11px] font-medium ${bufferSettings[prefix] !== 'size' ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>{sizeKey}</label>
                            <div className="flex-1 flex gap-2">
                               <input 
                                 type="text" 
                                 value={hasSize ? params[sizeKey] : (GENERAL_PARAMS_SCHEMA[sizeKey] ? GENERAL_PARAMS_SCHEMA[sizeKey].replace(/[A-Z]/g, '') : '')} 
                                 onChange={(e) => setParams({ ...params, [sizeKey]: e.target.value })} 
                                 disabled={bufferSettings[prefix] !== 'size'} 
                                 className={`flex-1 h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded text-[12px] focus:outline-none ${hasSize ? 'text-slate-100 font-medium' : 'text-slate-400 italic'}`}
                               />
                               <SelectField 
                                 value={units[prefix]} 
                                 options={['KB', 'MB', 'GB', 'TB'].map(o => ({ value: o, label: o }))} 
                                 onChange={(val) => setUnits(u => ({ ...u, [prefix]: val }))} 
                                 disabled={bufferSettings[prefix] !== 'size'}
                                 className="w-[85px]"
                               />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="space-y-4 pt-1">
                    <div className="flex items-center gap-2"><span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500 uppercase">Other Parameters</span><div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div></div>
                    <div className="space-y-1 px-1">
                        <InputField label="lock_escalation" value={params.lock_escalation} defaultValue={GENERAL_PARAMS_SCHEMA.lock_escalation} onChange={(e) => setParams({ ...params, lock_escalation: e.target.value })} />
                        <InputField label="lock_timeout_in_secs" value={params.lock_timeout_in_secs} defaultValue={GENERAL_PARAMS_SCHEMA.lock_timeout_in_secs} onChange={(e) => setParams({ ...params, lock_timeout_in_secs: e.target.value })} />
                        <InputField label="deadlock_interval" value={params.deadlock_detection_interval_in_secs} defaultValue={GENERAL_PARAMS_SCHEMA.deadlock_detection_interval_in_secs} onChange={(e) => setParams({ ...params, deadlock_detection_interval_in_secs: e.target.value })} />
                        <InputField label="checkpoint_interval" value={params.checkpoint_interval_in_mins} defaultValue={GENERAL_PARAMS_SCHEMA.checkpoint_interval_in_mins} onChange={(e) => setParams({ ...params, checkpoint_interval_in_mins: e.target.value })} />
                        <div className="flex items-center gap-4 py-1.5">
                          <label className="w-[140px] text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-tight">isolation_level</label>
                          <div className="flex-1">
                            <SelectField 
                              value={params.isolation_level || GENERAL_PARAMS_SCHEMA.isolation_level} 
                              options={['TRAN_SERIALIZABLE','TRAN_REP_CLASS_REP_INSTANCE','TRAN_REP_CLASS_COMMIT_INSTANCE','TRAN_REP_CLASS_UNCOMMIT_INSTANCE','TRAN_COMMIT_CLASS_COMMIT_INSTANCE','TRAN_COMMIT_CLASS_UNCOMMIT_INSTANCE'].map(o => ({ value: o, label: o }))} 
                              onChange={(val) => setParams({ ...params, isolation_level: val })}
                              isHighlight={params.isolation_level !== undefined}
                            />
                          </div>
                        </div>
                        <InputField label="max_clients" value={params.max_clients} defaultValue={GENERAL_PARAMS_SCHEMA.max_clients} onChange={(e) => setParams({ ...params, max_clients: e.target.value })} />
                        <div className="flex items-center gap-4 py-1.5">
                          <label className="w-[140px] text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-tight">auto_restart_server</label>
                          <div className="flex-1">
                            <SelectField 
                              value={params.auto_restart_server || GENERAL_PARAMS_SCHEMA.auto_restart_server} 
                              options={['yes', 'no'].map(o => ({ value: o, label: o }))} 
                              onChange={(val) => setParams({ ...params, auto_restart_server: val })}
                              isHighlight={params.auto_restart_server !== undefined}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-4 py-1.5">
                          <label className="w-[140px] text-[10px] font-medium text-slate-500 dark:text-slate-400 tracking-tight">replication</label>
                          <div className="flex-1">
                            <SelectField 
                              value={params.replication || GENERAL_PARAMS_SCHEMA.replication} 
                              options={['yes', 'no'].map(o => ({ value: o, label: o }))} 
                              onChange={(val) => setParams({ ...params, replication: val })}
                              isHighlight={params.replication !== undefined}
                            />
                          </div>
                        </div>
                        <InputField label="cubrid_port_id" value={params.cubrid_port_id} defaultValue={GENERAL_PARAMS_SCHEMA.cubrid_port_id} onChange={(e) => setParams({ ...params, cubrid_port_id: e.target.value })} />
                    </div>
                  </div>
                </div>
              ) : (
                <div key="advanced-view" className="flex-1 flex flex-col min-h-0 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-slate-50/20 dark:bg-bk-main/10 flex flex-col flex-1">
                    <div className="sticky top-0 bg-slate-100 dark:bg-bk-main flex border-b border-slate-200 dark:border-slate-800 z-10 uppercase">
                      <div className="w-[200px] px-4 py-2.5 text-[9px] font-medium text-slate-500 dark:text-slate-400 tracking-wide">PARAMETER</div>
                      <div className="w-[70px] px-4 py-2.5 text-[9px] font-medium text-slate-500 dark:text-slate-400 tracking-wide border-l border-slate-200 dark:border-slate-800 text-center">TARGET</div>
                      <div className="w-[90px] px-4 py-2.5 text-[9px] font-medium text-slate-500 dark:text-slate-400 tracking-wide border-l border-slate-200 dark:border-slate-800 text-center">TYPE</div>
                      <div className="flex-1 px-4 py-2.5 text-[9px] font-medium text-slate-500 dark:text-slate-400 tracking-wide border-l border-slate-200 dark:border-slate-800">VALUE</div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                      {advancedData.map((item, idx) => (
                        <div key={item.key} className={`flex border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group ${idx % 2 === 0 ? 'bg-white/40 dark:bg-transparent' : ''}`}>
                          <div className="w-[240px] px-4 py-2 flex items-center shrink-0">
                            <span className={`text-[12px] font-medium truncate ${item.isModified ? 'text-bk-yellow' : 'text-slate-700 dark:text-slate-100'}`}>{item.key}</span>
                          </div>
                          <div className="w-[80px] px-4 py-2 flex items-center shrink-0 border-l border-slate-100 dark:border-slate-800/30 justify-center">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-bk-side text-[9px] font-medium text-slate-500 dark:text-slate-400">{item.scope}</span>
                          </div>
                          <div className="w-[110px] px-4 py-2 flex items-center shrink-0 justify-center border-l border-slate-100 dark:border-slate-800/30">
                            <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase">{item.type.split('(')[0]}</span>
                          </div>
                          <div className="flex-1 px-4 py-1.5 flex items-center border-l border-slate-100 dark:border-slate-800/30">
                            {item.type.includes('yes|no') || item.type.includes('on|off') ? (
                              <SelectField 
                                value={item.currentValue} 
                                options={(item.type.includes('on|off') && item.type.includes('yes|no') 
                                  ? (item.type.includes('replica') ? ['on', 'off', 'yes', 'no', 'replica'] : ['on', 'off', 'yes', 'no']) 
                                  : item.type.includes('on|off') ? ['on', 'off'] : ['yes', 'no']).map(o => ({ value: o, label: o }))} 
                                onChange={(val) => setParams({ ...params, [item.key]: val })}
                                isHighlight={true}
                              />
                            ) : (
                              <input type="text" value={item.currentValue} onChange={(e) => setParams({ ...params, [item.key]: e.target.value })} className={`w-full h-9 px-2 bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-800 focus:border-bk-yellow/40 focus:bg-white dark:focus:bg-bk-main/50 rounded text-[11px] transition-all outline-none ${item.isModified ? 'text-bk-yellow font-medium' : 'text-slate-500 dark:text-slate-400 italic'}`}/>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button onClick={() => dispatch(closeDatabasePropertyModal())} className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all uppercase">DISCARD</button>
          <button onClick={handleApply} className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[140px] uppercase">
             <span className="material-symbols-outlined text-[16px]">save</span>
             <span>APPLY CHANGES</span>
          </button>
        </div>
      </div>
    </div>
  );
}
