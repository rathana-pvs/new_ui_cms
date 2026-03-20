import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeDatabasePropertyModal } from '../databaseSlice';
import { hostApi } from '../../host/hostApi';
import { brokerApi } from '../../broker/brokerApi';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Input from '../../../components/ui/Forms/Input';
import Select from '../../../components/ui/Forms/Select';
import Radio from '../../../components/ui/Forms/Radio';
import Tabs from '../../../components/ui/Layout/Tabs';
import Card from '../../../components/ui/Layout/Card';
import Table from '../../../components/ui/Layout/Table';
import Alert from '../../../components/ui/Feedback/Alert';

const ADVANCED_PARAMS_SCHEMA = [
  { key: 'access_ip_control', type: 'bool(yes|no)', default: 'no', scope: 'SERVER' },
  { key: 'access_ip_control_file', type: 'string', default: '', scope: 'SERVER' },
  { key: 'async_commit', type: 'bool(yes|no)', default: 'no', scope: 'SERVER' },
  { key: 'backup_volume_max_size_bytes', type: 'int', default: '-1', scope: 'SERVER' },
  { key: 'block_ddl_statement', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'block_nowhere_statement', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'call_stack_dump_activation_list', type: 'string', default: '', scope: 'BOTH' },
  { key: 'call_stack_dump_deactivation_list', type: 'string', default: '', scope: 'BOTH' },
  { key: 'compactdb_page_reclaim_only', type: 'int', default: '0', scope: 'SERVER' },
  { key: 'compat_numeric_division_scale', type: 'bool(yes|no)', default: 'no', scope: 'BOTH' },
  { key: 'compat_primary_key', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'error_log', type: 'string', default: 'cubrid.err', scope: 'BOTH' },
  { key: 'file_lock', type: 'bool(yes|no)', default: 'yes', scope: 'SERVER' },
  { key: 'garbage_collection', type: 'bool(yes|no)', default: 'no', scope: 'CLIENT' },
  { key: 'ha_mode', type: 'string(on|off|yes|no|replica)', default: 'off', scope: 'SERVER' },
  { key: 'ha_node_list', type: 'string', default: '', scope: 'SERVER' },
  { key: 'ha_port_id', type: 'int', default: '', scope: 'SERVER' },
  { key: 'media_failure_support', type: 'bool(yes|no)', default: 'yes', scope: 'SERVER' },
  { key: 'single_byte_compare', type: 'bool(yes|no)', default: 'no', scope: 'SERVER' },
  { key: 'temp_volume_path', type: 'string', default: '', scope: 'SERVER' },
  { key: 'volume_extension_path', type: 'string', default: '', scope: 'SERVER' }
];

const GENERAL_PARAMS_SCHEMA = {
  data_buffer_pages: '25000', data_buffer_size: '512MB',
  sort_buffer_pages: '16', sort_buffer_size: '2MB',
  log_buffer_pages: '50', log_buffer_size: '4MB',
  lock_escalation: '100000', lock_timeout_in_secs: '-1',
  isolation_level: 'TRAN_REP_CLASS_UNCOMMIT_INSTANCE',
  auto_restart_server: 'no'
};

const GENERAL_PARAMS_KEYS = Object.keys(GENERAL_PARAMS_SCHEMA);

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
  const [bufferSettings, setBufferSettings] = useState({ data: 'size', sort: 'size', log: 'size' });
  const [brokers, setBrokers] = useState([]);
  const [connectionInfo, setConnectionInfo] = useState({ brokerIp: 'localhost', brokerPort: '', charset: 'UTF-8' });

  useEffect(() => {
    if (isDatabasePropertyModalOpen) setActiveSidebar(selectedDatabase ? 'Connection Information' : 'Server Parameter');
  }, [isDatabasePropertyModalOpen, selectedDatabase]);

  useEffect(() => {
    if (isDatabasePropertyModalOpen && selectedHostUid && isAuthorized) {
      brokerApi.getBrokerList(selectedHostUid).then(res => {
        const list = res.result || (Array.isArray(res) ? res[0]?.broker : []);
        if (Array.isArray(list)) {
          const mapped = list.map(b => ({ label: `${b.name} (${b.port})`, value: b.port }));
          setBrokers(mapped);
          if (mapped.length > 0) setConnectionInfo(prev => ({ ...prev, brokerPort: String(mapped[0].value) }));
        }
      }).catch(err => console.error(err));
    }
  }, [isDatabasePropertyModalOpen, selectedHostUid, isAuthorized]);

  useEffect(() => {
    if (isDatabasePropertyModalOpen && selectedHostUid && isAuthorized && activeSidebar !== 'Connection Information') {
      setLoading(true);
      hostApi.getHostConfig(selectedHostUid, 'cubridconf').then(res => {
        const lines = res?.conflist?.[0]?.confdata || [];
        setRawLines(lines);
        let currentSection = '';
        const newParams = {};
        lines.forEach(line => {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) return;
          if (trimmed.startsWith('[') && trimmed.endsWith(']')) { currentSection = trimmed.slice(1, -1).toLowerCase(); return; }
          const target = selectedDatabase ? `@${selectedDatabase.toLowerCase()}` : 'common';
          if (currentSection === 'common' || (selectedDatabase && currentSection === target)) {
            const [key, value] = trimmed.split('=').map(s => s.trim());
            if (key) {
               if (key.endsWith('_buffer_size')) {
                  const unit = value.slice(-1).toUpperCase();
                  if (['K','M','G','T'].includes(unit)) {
                     const uMap = {'K':'KB','M':'MB','G':'GB','T':'TB'};
                     setUnits(prev => ({ ...prev, [key.split('_')[0]]: uMap[unit] || 'MB' }));
                     newParams[key] = value.slice(0, -1);
                  } else { newParams[key] = value; }
                  setBufferSettings(prev => ({ ...prev, [key.split('_')[0]]: 'size' }));
               } else if (key.endsWith('_buffer_pages')) {
                  setBufferSettings(prev => ({ ...prev, [key.split('_')[0]]: 'pages' }));
                  newParams[key] = value;
               } else { newParams[key] = value; }
            }
          }
        });
        setParams(newParams);
      }).finally(() => setLoading(false));
    }
  }, [isDatabasePropertyModalOpen, selectedDatabase, selectedHostUid, activeSidebar, isAuthorized]);

  const handleApply = async () => {
    if (activeSidebar === 'Connection Information') { dispatch(closeDatabasePropertyModal()); return; }
    setLoading(true);
    try {
      const saveParams = { ...params };
      ['data', 'sort', 'log'].forEach(p => {
        if (bufferSettings[p] === 'size') {
           if (params[`${p}_buffer_size`]) saveParams[`${p}_buffer_size`] = `${params[`${p}_buffer_size`]}${units[p].charAt(0)}`;
           delete saveParams[`${p}_buffer_pages`];
        } else { delete saveParams[`${p}_buffer_size`]; }
      });
      const sectionName = selectedDatabase ? `[@${selectedDatabase.toLowerCase()}]` : '[common]';
      let lines = [...rawLines];
      let start = -1, end = -1;
      lines.forEach((l, i) => { if (l.trim().toLowerCase() === sectionName.toLowerCase()) start = i; });
      if (start !== -1) { for (let i = start + 1; i < lines.length; i++) { if (lines[i].trim().startsWith('[')) { end = i; break; } } if (end === -1) end = lines.length; }
      if (start === -1) { lines.push("", sectionName); start = lines.length - 1; end = lines.length; }
      const updated = lines.slice(start + 1, end);
      Object.entries(saveParams).forEach(([k, v]) => {
        let found = false;
        for (let i = 0; i < updated.length; i++) { if (!updated[i].trim().startsWith('#') && updated[i].split('=')[0].trim().toLowerCase() === k.toLowerCase()) { updated[i] = `${k}=${v}`; found = true; break; } }
        if (!found) updated.push(`${k}=${v}`);
      });
      await hostApi.setHostConfig(selectedHostUid, { confname: 'cubridconf', confdata: [...lines.slice(0, start + 1), ...updated, ...lines.slice(end)] });
      dispatch(closeDatabasePropertyModal());
    } finally { setLoading(false); }
  };

  const columns = [
    { key: 'key', title: 'Parameter', className: 'w-[40%] font-bold' },
    { key: 'scope', title: 'Scope', className: 'w-[15%] text-center uppercase opacity-40 font-black tracking-tighter' },
    { 
      key: 'value', title: 'Value', className: 'w-[45%]',
      render: (item) => {
        const val = params[item.key] !== undefined ? params[item.key] : item.default;
        if (item.type.includes('|')) {
           const opts = item.type.match(/\((.+)\)/)?.[1].split('|').map(v => ({ label: v, value: v })) || [];
           return <Select value={val} options={opts} onChange={v => setParams({ ...params, [item.key]: v })} className="h-8 py-0 min-h-[32px]" />;
        }
        return <Input value={val} onChange={e => setParams({ ...params, [item.key]: e.target.value })} className="h-8" />;
      }
    }
  ];

  const sidebarItems = selectedDatabase ? [
    { id: 'Connection Information', icon: 'settings_ethernet' },
    { id: 'Server Parameter', icon: 'hub' }
  ] : [{ id: 'Server Parameter', icon: 'hub' }];

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeDatabasePropertyModal())} disabled={loading}>Discard</Button>
      <Button variant="primary" onClick={handleApply} loading={loading} icon="save">Apply Changes</Button>
    </div>
  );

  return (
    <Modal
      isOpen={isDatabasePropertyModalOpen}
      onClose={() => dispatch(closeDatabasePropertyModal())}
      title={selectedDatabase ? `Database Properties: ${selectedDatabase}` : 'Common Server Properties'}
      subtitle={`${selectedHostUid}`}
      icon="tune"
      footer={footer}
      maxWidth="max-w-[850px]"
    >
      <div className="flex h-[550px] -mx-6 -my-6">
        {/* Sidebar Nav */}
        <div className="w-[220px] bg-muted/5 border-r border-border p-3 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSidebar(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeSidebar === item.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold' : 'text-foreground/60 hover:bg-muted/10'}`}
            >
              <Icon name={item.icon} size="sm" />
              <Typography variant="span" className="text-[12px] uppercase tracking-wide">{item.id}</Typography>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {activeSidebar === 'Server Parameter' && (
            <div className="px-6 pt-4 border-b border-border bg-background">
               <Tabs tabs={[{ id: 'General', label: 'General' }, { id: 'Advanced', label: 'Advanced' }]} activeTab={activeTab} onChange={setActiveTab} variant="line" />
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-8">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4"><Icon name="sync" className="animate-spin text-3xl" /><Typography variant="caption" className="font-black uppercase tracking-widest">Hydrating Config...</Typography></div>
            ) : activeSidebar === 'Connection Information' ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                 <div className="space-y-6 max-w-lg">
                    <Typography variant="caption" className="font-black uppercase tracking-widest text-primary border-b border-primary/20 pb-2 block">Manager Connectivity</Typography>
                    <Input label="Broker Host/IP" value={connectionInfo.brokerIp} onChange={e => setConnectionInfo({ ...connectionInfo, brokerIp: e.target.value })} icon="dns" />
                    <Select label="Broker Port" options={brokers} value={connectionInfo.brokerPort} onChange={v => setConnectionInfo({ ...connectionInfo, brokerPort: v })} icon="link" />
                    <Select label="Client Charset" options={['UTF-8','EUC-KR','ISO-8859-1','UHC'].map(o => ({label:o, value:o}))} value={connectionInfo.charset} onChange={v => setConnectionInfo({ ...connectionInfo, charset: v })} icon="translate" />
                 </div>
                 <Alert variant="info" title="Infrastructure Routing">Establish a direct path from the management interface to the CUBRID Broker. These settings impact administrative tooling only.</Alert>
              </div>
            ) : activeTab === 'General' ? (
              <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 pb-4">
                 {['data', 'sort', 'log'].map(p => (
                   <Card key={p} className="p-6 space-y-5 border-border/50 bg-muted/5">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] uppercase border border-primary/20">{p}</div>
                         <Typography variant="h4" className="uppercase tracking-widest opacity-80">{p} Space Allocation</Typography>
                      </div>
                      <div className="space-y-4 pt-2">
                         <div className="flex items-center gap-5 group">
                            <Radio checked={bufferSettings[p] === 'pages'} onChange={() => setBufferSettings(s => ({ ...s, [p]: 'pages' }))} />
                            <div className="flex-1 space-y-3">
                               <Typography variant="caption" className={`font-bold transition-all ${bufferSettings[p] === 'pages' ? 'text-foreground' : 'text-muted-foreground/40'}`}>{p.toUpperCase()}_BUFFER_PAGES</Typography>
                               <Input label="" value={params[`${p}_buffer_pages`] || GENERAL_PARAMS_SCHEMA[`${p}_buffer_pages`]} onChange={e => setParams({ ...params, [`${p}_buffer_pages`]: e.target.value })} disabled={bufferSettings[p] !== 'pages'} className="h-9" />
                            </div>
                         </div>
                         <div className="flex items-center gap-5 group">
                            <Radio checked={bufferSettings[p] === 'size'} onChange={() => setBufferSettings(s => ({ ...s, [p]: 'size' }))} />
                            <div className="flex-1 space-y-3">
                               <Typography variant="caption" className={`font-bold transition-all ${bufferSettings[p] === 'size' ? 'text-foreground' : 'text-muted-foreground/40'}`}>{p.toUpperCase()}_BUFFER_SIZE</Typography>
                               <div className="flex gap-3">
                                  <Input label="" value={params[`${p}_buffer_size`] || GENERAL_PARAMS_SCHEMA[`${p}_buffer_size`]?.replace(/[A-Z]/g, '')} onChange={e => setParams({ ...params, [`${p}_buffer_size`]: e.target.value })} disabled={bufferSettings[p] !== 'size'} className="flex-1 h-9" />
                                  <Select options={['KB','MB','GB','TB'].map(o => ({label:o, value:o}))} value={units[p]} onChange={v => setUnits(u => ({ ...u, [p]: v }))} disabled={bufferSettings[p] !== 'size'} className="w-[90px] h-9 min-h-[36px]" />
                               </div>
                            </div>
                         </div>
                      </div>
                   </Card>
                 ))}
                 <Card className="p-6 space-y-6 border-border/50">
                    <Typography variant="caption" className="font-black uppercase tracking-widest text-secondary border-b border-border/50 pb-2 block">Operational Policy</Typography>
                    <div className="grid grid-cols-2 gap-6">
                       <Input label="Lock Escalation" value={params.lock_escalation} onChange={e => setParams({ ...params, lock_escalation: e.target.value })} icon="lock_open" />
                       <Input label="Timeout (sec)" value={params.lock_timeout_in_secs} onChange={e => setParams({ ...params, lock_timeout_in_secs: e.target.value })} icon="timer" />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <Select label="Isolation Level" options={['TRAN_SERIALIZABLE','TRAN_REP_CLASS_REP_INSTANCE','TRAN_REP_CLASS_COMMIT_INSTANCE','TRAN_REP_CLASS_UNCOMMIT_INSTANCE'].map(o => ({label:o, value:o}))} value={params.isolation_level || 'TRAN_REP_CLASS_UNCOMMIT_INSTANCE'} onChange={v => setParams({ ...params, isolation_level: v })} />
                       <Select label="Auto Restart" options={[{label:'Yes', value:'yes'}, {label:'No', value:'no'}]} value={params.auto_restart_server || 'no'} onChange={v => setParams({ ...params, auto_restart_server: v })} />
                    </div>
                 </Card>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 border border-border rounded-2xl overflow-hidden shadow-sm">
                 <Table columns={columns} data={ADVANCED_PARAMS_SCHEMA.map(p => ({ ...p, name: p.key }))} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
