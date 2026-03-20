import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { closeBrokerPropertyModal, fetchBrokerConfig, updateBrokerConfig } from '../brokerSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Input from '../../../components/ui/Forms/Input';
import Select from '../../../components/ui/Forms/Select';
import Tabs from '../../../components/ui/Layout/Tabs';
import Card from '../../../components/ui/Layout/Card';
import Table from '../../../components/ui/Layout/Table';
import Toggle from '../../../components/ui/Forms/Toggle';

const BROKER_PARAMETERS = [
  { name: 'SERVICE', type: 'string(ON|OFF)', default: 'ON', category: 'common' },
  { name: 'BROKER_PORT', type: 'int(1024~65535)', default: '', category: 'common' },
  { name: 'MIN_NUM_APPL_SERVER', type: 'int', default: '5', category: 'common' },
  { name: 'MAX_NUM_APPL_SERVER', type: 'int', default: '40', category: 'common' },
  { name: 'APPL_SERVER_SHM_ID', type: 'int(1024~65535)', default: '', category: 'common' },
  { name: 'LOG_DIR', type: 'string', default: 'log/broker/sql_log', category: 'common' },
  { name: 'ERROR_LOG_DIR', type: 'string', default: 'log/broker/error_log', category: 'common' },
  { name: 'SQL_LOG', type: 'string(ON|OFF|ERROR|NOTICE|TIMEOUT)', default: 'ON', category: 'common' },
  { name: 'TIME_TO_KILL', type: 'int', default: '120', category: 'common' },
  { name: 'SESSION_TIMEOUT', type: 'int', default: '300', category: 'common' },
  { name: 'KEEP_CONNECTION', type: 'string(ON|OFF|AUTO)', default: 'AUTO', category: 'common' },
  { name: 'STATEMENT_POOLING', type: 'string(ON|OFF)', default: 'ON', category: 'advance' },
  { name: 'LONG_QUERY_TIME', type: 'int', default: '60', category: 'advance' },
  { name: 'LONG_TRANSACTION_TIME', type: 'int', default: '60', category: 'advance' },
  { name: 'SQL_LOG_MAX_SIZE', type: 'int', default: '100000', category: 'advance' },
  { name: 'LOG_BACKUP', type: 'string(ON|OFF)', default: 'OFF', category: 'advance' },
  { name: 'SOURCE_ENV', type: 'string', default: 'cubrid.env', category: 'advance' },
  { name: 'MAX_STRING_LENGTH', type: 'int', default: '-1', category: 'advance' },
  { name: 'APPL_SERVER_PORT', type: 'int', default: '', category: 'advance' },
  { name: 'ACCESS_LOG', type: 'string(ON|OFF)', default: 'ON', category: 'advance' },
  { name: 'ACCESS_LIST', type: 'string', default: '', category: 'advance' },
  { name: 'CCI_PCONNECT', type: 'string(ON|OFF)', default: 'OFF', category: 'advance' },
  { name: 'SELECT_AUTO_COMMIT', type: 'string(ON|OFF)', default: 'OFF', category: 'advance' },
  { name: 'ACCESS_MODE', type: 'string(RW|RO|SO)', default: 'RW', category: 'advance' },
  { name: 'PREFERRED_HOSTS', type: 'string', default: '', category: 'advance' },
  { name: 'CCI_DEFAULT_AUTOCOMMIT', type: 'string(ON|OFF)', default: 'ON', category: 'advance' },
  { name: 'ENABLE_OPENSSL', type: 'string(ON|OFF)', default: 'OFF', category: 'advance' }
];

export default function BrokerPropertyModal() {
  const dispatch = useDispatch();
  const { propertyModal, brokerConfig, actionLoading } = useSelector((state) => state.broker);
  const { isOpen, brokerName, hostUid } = propertyModal;

  const [activeTab, setActiveTab] = useState('parameters');
  const [localParams, setLocalParams] = useState({});
  const [specificParams, setSpecificParams] = useState(new Set());
  const [refreshEnabled, setRefreshEnabled] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(5);

  const config = useMemo(() => brokerConfig[hostUid] || { data: {}, loading: false }, [brokerConfig, hostUid]);

  useEffect(() => {
    if (isOpen && hostUid) dispatch(fetchBrokerConfig({ hostUid }));
  }, [isOpen, hostUid, dispatch]);

  useEffect(() => {
    if (config.data && config.data.confdata) {
      const sections = {};
      let currentSection = 'general';
      config.data.confdata.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return;
        const sectionMatch = trimmed.match(/^\[%?(.+)\]$/);
        if (sectionMatch) {
          currentSection = sectionMatch[1].toLowerCase();
          sections[currentSection] = {};
        } else {
          const [key, value] = trimmed.split('=').map(s => s.trim());
          if (key && value !== undefined) {
            if (!sections[currentSection]) sections[currentSection] = {};
            sections[currentSection][key] = value;
          }
        }
      });
      const targetBroker = brokerName?.toLowerCase();
      const brokerCommonParams = sections['broker'] || {};
      const brokerSpecificParams = sections[targetBroker] || {};
      setLocalParams({ ...brokerCommonParams, ...brokerSpecificParams });
      setSpecificParams(new Set(Object.keys(brokerSpecificParams)));
    }
  }, [config.data, brokerName, isOpen]);

  const handleParamChange = (name, value) => {
    setLocalParams(prev => ({ ...prev, [name]: value }));
    setSpecificParams(prev => {
      const next = new Set(prev);
      next.add(name);
      return next;
    });
  };

  const handleSave = () => {
    if (!config.data?.confdata) return;
    const newConfData = [];
    let inTargetSection = false;
    const targetBroker = brokerName?.toLowerCase();
    const updatedInTargetSection = new Set();

    config.data.confdata.forEach(line => {
        const trimmed = line.trim();
        const sectionMatch = trimmed.match(/^\[%?(.+)\]$/);
        if (sectionMatch) {
            const sectionName = sectionMatch[1].toLowerCase();
            if (inTargetSection) {
                specificParams.forEach(paramName => {
                    if (!updatedInTargetSection.has(paramName) && localParams[paramName] !== undefined) newConfData.push(`${paramName}=${localParams[paramName]}`);
                });
            }
            inTargetSection = sectionName === targetBroker;
            newConfData.push(line);
        } else if (inTargetSection) {
            const [key] = trimmed.split('=').map(s => s.trim());
            if (key && localParams[key] !== undefined && specificParams.has(key)) {
                newConfData.push(`${key}=${localParams[key]}`);
                updatedInTargetSection.add(key);
            } else { newConfData.push(line); }
        } else { newConfData.push(line); }
    });
    if (inTargetSection) {
        specificParams.forEach(paramName => {
            if (!updatedInTargetSection.has(paramName) && localParams[paramName] !== undefined) newConfData.push(`${paramName}=${localParams[paramName]}`);
        });
    }
    dispatch(updateBrokerConfig({ hostUid, confdata: newConfData })).unwrap().then(() => dispatch(closeBrokerPropertyModal()));
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeBrokerPropertyModal())} disabled={actionLoading}>Discard</Button>
      <Button variant="primary" onClick={handleSave} loading={actionLoading} disabled={config.loading} icon="check_circle">Apply Changes</Button>
    </div>
  );

  const columns = [
    { key: 'name', title: 'Parameter', className: 'w-[40%]' },
    { key: 'type', title: 'Type', className: 'w-[20%] text-center italic opacity-50' },
    { 
      key: 'value', 
      title: 'Value', 
      className: 'w-[40%]',
      render: (item) => {
        const currentValue = localParams[item.name] || item.default;
        if (item.type.includes('|')) {
          const match = item.type.match(/\((.+)\)/);
          const options = match ? match[1].split('|').map(v => ({ value: v, label: v })) : [{ value: 'ON', label: 'ON' }, { value: 'OFF', label: 'OFF' }];
          return <Select value={currentValue} onChange={(val) => handleParamChange(item.name, val)} options={options} className="h-8 py-0 min-h-[32px]" />;
        }
        return <Input value={currentValue} onChange={(e) => handleParamChange(item.name, e.target.value)} placeholder={item.default} className="h-8" />;
      }
    }
  ];

  const tabs = [
    { id: 'parameters', label: 'Parameters', icon: 'settings' },
    { id: 'refresh', label: 'Monitoring', icon: 'update' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => dispatch(closeBrokerPropertyModal())}
      title="Broker Properties"
      subtitle={`${brokerName} @ ${hostUid}`}
      icon="tune"
      footer={footer}
      maxWidth="max-w-[700px]"
    >
      <div className="space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} variant="line" />

        <div className="min-h-[400px]">
          {activeTab === 'parameters' ? (
            <div className="animate-in fade-in slide-in-from-top-2">
              {config.loading && Object.keys(localParams).length === 0 ? (
                <div className="py-24 flex flex-col items-center gap-4 opacity-30">
                  <Icon name="sync" className="animate-spin text-3xl" />
                  <Typography variant="span" className="font-black uppercase tracking-widest">Fetching Data...</Typography>
                </div>
              ) : (
                <div className="border border-border rounded-xl overflow-hidden">
                  <Table columns={columns} data={BROKER_PARAMETERS} />
                </div>
              )}
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-2 space-y-8 p-4">
              <Card className="bg-primary/5 border-primary/20 p-6 flex gap-5">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20"><Icon name="speed" className="text-primary text-2xl" /></div>
                <div className="space-y-1 flex-1">
                  <Typography variant="h4" className="text-primary">Status Monitoring</Typography>
                  <Typography variant="p" className="opacity-60 text-[13px] leading-snug">
                    Fine-tune the auto-refresh behavior for real-time broker metrics. Smaller intervals provide higher precision but increase management overhead.
                  </Typography>
                </div>
              </Card>

              <div className="space-y-6 max-w-md mx-auto">
                <div className="flex items-center justify-between p-5 bg-background border border-border rounded-xl shadow-sm group hover:border-primary/50 transition-all">
                  <div className="space-y-1">
                    <Typography variant="span" className="font-bold block tracking-tight">Auto Refresh</Typography>
                    <Typography variant="caption" className="opacity-50 block">Keep dashboard context synchronized</Typography>
                  </div>
                  <Toggle checked={refreshEnabled} onChange={setRefreshEnabled} />
                </div>

                <div className={`space-y-4 transition-all duration-300 ${refreshEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
                  <Typography variant="caption" className="font-black uppercase tracking-widest text-primary/60 ml-1">Refresh Interval (sec)</Typography>
                  <div className="flex items-center gap-6 p-5 bg-background border border-border rounded-xl shadow-sm">
                    <input type="range" min="1" max="60" value={refreshInterval} onChange={(e) => setRefreshInterval(e.target.value)} className="flex-1 accent-primary h-1.5 bg-muted rounded-lg appearance-none cursor-pointer" />
                    <Card className="w-16 h-10 flex items-center justify-center bg-primary/20 border-primary text-primary font-black shadow-lg shadow-primary/20">
                      {refreshInterval}
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
