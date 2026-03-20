import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeTransactionInfoModal, openKillTransactionModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import KillTransactionModal from './KillTransactionModal';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';
import Card from '../../../components/ui/Layout/Card';
import Table from '../../../components/ui/Layout/Table';

export default function TransactionInfoModal() {
  const dispatch = useDispatch();
  const { isTransactionInfoModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTranIndex, setSelectedTranIndex] = useState(null);

  const fetchTransactionInfo = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    setLoading(true);
    setError(null);
    try {
      const response = await databaseApi.getTransactionInfo(selectedHostUid, selectedDatabase, { dbuser: 'dba', dbpasswd: '' });
      setTransactions(response?.transactioninfo?.[0]?.transaction || []);
    } catch (err) {
      setError(err.response?.data?.note || err.response?.data?.message || 'Failed to fetch transaction information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isTransactionInfoModalOpen) {
      fetchTransactionInfo();
      setSelectedTranIndex(null);
    }
  }, [isTransactionInfoModalOpen, selectedHostUid, selectedDatabase]);

  if (!isTransactionInfoModalOpen) return null;

  const handleOpenKillModal = () => {
    const selectedTran = transactions.find(t => t.tranindex === selectedTranIndex);
    if (selectedTran) dispatch(openKillTransactionModal(selectedTran));
  };

  const columns = [
    { 
      key: 'tranindex', title: 'Transaction Idx', 
      render: (val) => (
        <div className="flex items-center gap-3">
           <div className={`w-2 h-2 rounded-full ${String(val).includes('ACTIVE') ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-foreground/20'}`}></div>
           <Typography variant="span" className="font-mono font-bold tracking-tight text-primary">{val}</Typography>
        </div>
      ),
      className: 'w-[180px]'
    },
    { key: '@user', title: 'User Session', className: 'font-bold' },
    { key: 'host', title: 'Host Address', className: 'font-mono opacity-60' },
    { 
      key: 'pid', title: 'PID', 
      render: (val) => <span className="bg-muted/10 px-2 py-0.5 rounded-lg border border-border/50 font-mono text-[10px]">{val}</span>,
      className: 'text-center'
    },
    { key: 'program', title: 'Program', className: 'italic opacity-50 max-w-[150px] truncate' },
    { 
      key: 'query_time', title: 'Exec Time', 
      render: (val) => <span className={`font-mono font-black ${parseFloat(val) > 5 ? 'text-rose-500' : 'opacity-60'}`}>{val}s</span>,
      className: 'text-right'
    }
  ];

  const footer = (
    <div className="flex justify-between items-center w-full">
      <Button variant="danger" onClick={handleOpenKillModal} disabled={!selectedTranIndex || loading} icon="cancel">Kill Process</Button>
      <div className="flex gap-3">
         <Button variant="ghost" onClick={() => dispatch(closeTransactionInfoModal())}>Discard</Button>
         <Button variant="primary" onClick={fetchTransactionInfo} loading={loading} icon="refresh">Refresh</Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isTransactionInfoModalOpen}
      onClose={() => dispatch(closeTransactionInfoModal())}
      title="Transaction Monitor"
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="swap_horiz"
      footer={footer}
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {error && <Alert variant="error" title="Telemetry Isolation Failure" onClose={() => setError(null)}>{error}</Alert>}

        <section className="space-y-4">
           <div className="flex items-center justify-between px-2">
              <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Live Transaction Pipeline</Typography>
              <Typography variant="caption" className="bg-muted px-2 py-0.5 rounded-lg font-black text-[10px]">{transactions.length} ACTIVE</Typography>
           </div>
           
           <Card className="overflow-hidden border-border/50 shadow-sm">
              <Table 
                columns={columns} 
                data={transactions} 
                loading={loading && transactions.length === 0}
                onRowClick={(row) => setSelectedTranIndex(row.tranindex)}
                selectedRowId={selectedTranIndex}
                rowIdKey="tranindex"
                emptyMessage="No active transactions synchronized."
              />
           </Card>
        </section>

        <Alert variant="info" title="Infrastructure Safety" icon="shield">
           Terminating a transaction is a destructive action that will Rollback any uncommitted changes for the target session. Proceed with extreme caution.
        </Alert>
      </div>
      <KillTransactionModal onTransactionKilled={fetchTransactionInfo} />
    </Modal>
  );
}
