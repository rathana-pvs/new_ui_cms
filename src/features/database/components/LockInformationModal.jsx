import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeLockInfoModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';
import Card from '../../../components/ui/Layout/Card';
import Table from '../../../components/ui/Layout/Table';
import Tabs from '../../../components/ui/Layout/Tabs';

export default function LockInformationModal() {
  const dispatch = useDispatch();
  const { isLockInfoModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [activeTab, setActiveTab] = useState('client'); // 'client' or 'object'
  const [settings, setSettings] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLockInfo = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setLoading(true);
    setError(null);
    try {
      const response = await databaseApi.getLockInfo(selectedHostUid, selectedDatabase);
      if (response && response.lockinfo && response.lockinfo.length > 0) {
        const { dinterval, esc, lot, transaction } = response.lockinfo[0];
        setSettings({ dinterval, esc, ...(lot?.[0] || {}) });
        setTransactions(transaction || []);
      }
    } catch (err) {
      setError(err.response?.data?.note || err.response?.data?.message || 'Failed to retrieve locking information. The database might be under high contention.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLockInfoModalOpen) fetchLockInfo();
  }, [isLockInfoModalOpen, selectedHostUid, selectedDatabase]);

  if (!isLockInfoModalOpen) return null;

  const clientColumns = [
    { key: 'index', title: 'Idx', className: 'w-[60px] font-mono text-primary font-bold' },
    { key: 'pname', title: 'Process Name', className: 'font-bold' },
    { key: 'uid', title: 'UID', render: (_, item) => item['@uid'] || '-', className: 'font-mono opacity-60' },
    { key: 'host', title: 'Host Address', className: 'font-mono opacity-60' },
    { 
      key: 'pid', title: 'PID', 
      render: (val) => <span className="bg-muted/10 px-2 py-0.5 rounded-lg border border-border/50 font-mono">{val}</span> 
    },
    { key: 'isolevel', title: 'Isolation', className: 'text-[10px] uppercase font-black opacity-40 tracking-tighter' },
    { key: 'timeout', title: 'Timeout', render: (val) => `${val}s`, className: 'text-right font-mono' }
  ];

  const objectColumns = [
    { key: 'oid', title: 'Object ID (OID)', className: 'font-mono text-secondary font-bold' },
    { key: 'type', title: 'Structure Type', render: () => 'Table/Index', className: 'italic opacity-50' },
    { key: 'holders', title: 'Holders', className: 'text-center font-bold' },
    { key: 'blocked', title: 'Blocked', className: 'text-center text-rose-500 font-black' },
    { key: 'waiters', title: 'Waiters', className: 'text-right font-mono' }
  ];

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeLockInfoModal())} disabled={loading}>Discard</Button>
      <Button variant="primary" onClick={fetchLockInfo} loading={loading} icon="refresh">Refresh Stats</Button>
    </div>
  );

  return (
    <Modal
      isOpen={isLockInfoModalOpen}
      onClose={() => dispatch(closeLockInfoModal())}
      title="Locking System Monitor"
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="lock"
      footer={footer}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {error && <Alert variant="error" title="Diagnostics failure" onClose={() => setError(null)}>{error}</Alert>}

        <div className="border-b border-border -mx-6 px-6 bg-muted/5">
           <Tabs 
              tabs={[{ id: 'client', label: 'Client / Session Info' }, { id: 'object', label: 'Object Lock Status' }]} 
              activeTab={activeTab} 
              onChange={setActiveTab} 
              variant="line" 
           />
        </div>

        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          {activeTab === 'client' ? (
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                   <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Server Global Context</Typography>
                   <div className="flex-1 h-[1px] bg-border/50"></div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                   <Card className="p-5 bg-primary/5 border-primary/10 flex items-center justify-between">
                      <Typography variant="caption" className="font-bold opacity-50 uppercase tracking-widest text-[10px]">Lock Escalation Threshold</Typography>
                      <Typography variant="h4" className="font-black text-primary">{settings.esc || '100,000'}</Typography>
                   </Card>
                   <Card className="p-5 bg-secondary/5 border-secondary/10 flex items-center justify-between">
                      <Typography variant="caption" className="font-bold opacity-50 uppercase tracking-widest text-[10px]">Deadlock Check Interval</Typography>
                      <div className="flex items-baseline gap-1">
                         <Typography variant="h4" className="font-black text-secondary">{settings.dinterval || '0'}</Typography>
                         <Typography variant="caption" className="font-bold opacity-40">ms</Typography>
                      </div>
                   </Card>
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                   <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-foreground/40">Active Session Manifest</Typography>
                   <div className="flex-1 h-[1px] bg-border/50"></div>
                   <Typography variant="caption" className="bg-muted px-2 py-0.5 rounded-lg font-black text-[10px]">{transactions.length} SESSIONS</Typography>
                </div>
                <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                   <Table columns={clientColumns} data={transactions} loading={loading && transactions.length === 0} emptyMessage="No active client sessions discovered." />
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-8">
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                   <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Resource Footprint</Typography>
                   <div className="flex-1 h-[1px] bg-border/50"></div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                   {[
                     { label: 'Locked Objects', value: settings.numlocked || 0, unit: 'count', icon: 'key' },
                     { label: 'Allocated Limit', value: settings.numallocated || 5000, unit: 'count', icon: 'inventory_2' },
                     { label: 'Memory Footprint', value: settings.sizelock || '1M', unit: 'bytes', icon: 'memory' }
                   ].map(stat => (
                     <Card key={stat.label} className="p-5 border-border/50 bg-muted/5 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                           <Typography variant="caption" className="font-bold opacity-40 uppercase text-[9px] tracking-[0.15em]">{stat.label}</Typography>
                           <Icon name={stat.icon} size="xs" className="opacity-20" />
                        </div>
                        <div className="flex items-baseline gap-2">
                           <Typography variant="h3" className="font-black text-secondary tracking-tighter">{stat.value}</Typography>
                           <Typography variant="caption" className="font-bold opacity-30 text-[10px]">{stat.unit}</Typography>
                        </div>
                     </Card>
                   ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-3">
                   <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-foreground/40">Contention Analysis</Typography>
                   <div className="flex-1 h-[1px] bg-border/50"></div>
                </div>
                <div className="border border-border rounded-xl overflow-hidden shadow-sm">
                   <Table columns={objectColumns} data={[]} loading={loading && transactions.length === 0} emptyMessage="No object-level lock contention detected." />
                </div>
                <div className="flex justify-end">
                   <Button variant="secondary" size="sm" icon="analytics">Export Telemetry</Button>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
