import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeKillTransactionModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';
import Card from '../../../components/ui/Layout/Card';
import Input from '../../../components/ui/Forms/Input';
import Select from '../../../components/ui/Forms/Select';

export default function KillTransactionModal({ onTransactionKilled }) {
  const dispatch = useDispatch();
  const { isKillTransactionModalOpen, killTransactionData, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);

  const [loading, setLoading] = useState(false);
  const [killType, setKillType] = useState('i'); // Default: Kill selected only

  useEffect(() => {
    if (isKillTransactionModalOpen) setKillType('i');
  }, [isKillTransactionModalOpen]);

  if (!isKillTransactionModalOpen || !killTransactionData) return null;

  const handleKill = async () => {
    if (!selectedHostUid) return;
    setLoading(true);
    try {
      const idx = killTransactionData.tranindex?.match(/\d+/)?.[0] || '';
      const response = await databaseApi.killTransaction(selectedHostUid, selectedDatabase, {
        dbname: selectedDatabase,
        type: killType,
        parameter: idx
      });
      if (response.status === 201 || response.status === 200 || response.success) {
        dispatch(closeKillTransactionModal());
        if (onTransactionKilled) onTransactionKilled();
      }
    } catch (err) {
      console.error('Failed to kill transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeKillTransactionModal())} disabled={loading}>Discard</Button>
      <Button variant="danger" onClick={handleKill} loading={loading} icon="bolt" className="min-w-[140px]">Terminate Job</Button>
    </div>
  );

  return (
    <Modal
      isOpen={isKillTransactionModalOpen}
      onClose={() => dispatch(closeKillTransactionModal())}
      title="Terminate Transaction"
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="cancel"
      footer={footer}
      maxWidth="max-w-[560px]"
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
        <Alert variant="error" title="Destructive Operation" icon="warning">
           Forcefully terminating a transaction will immediately abort the session and Rollback all uncommitted database modifications.
        </Alert>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Transaction Context</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <Card className="p-6 border-border/50 bg-muted/5 space-y-6">
             <div className="grid grid-cols-2 gap-6">
                <Input label="Username" value={killTransactionData['@user'] || '-'} readOnly disabled variant="ghost" />
                <Input label="Source Host" value={killTransactionData.host || '-'} readOnly disabled variant="ghost" />
             </div>
             <div className="grid grid-cols-2 gap-6">
                <Input label="Process ID (PID)" value={killTransactionData.pid || '-'} readOnly disabled variant="ghost" className="font-mono" />
                <Input label="Application Context" value={killTransactionData.program || '-'} readOnly disabled variant="ghost" />
             </div>
          </Card>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-secondary/60">Termination Scope</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <div className="space-y-2">
             <Select
                value={killType}
                onChange={setKillType}
                options={[
                  { value: 'i', label: 'Kill only the selected transaction handle' },
                  { value: 'h', label: 'Kill all transactions from this client host' },
                  { value: 'p', label: 'Kill all transactions from this program name' }
                ]}
                className="w-full"
             />
             <Typography variant="caption" className="italic opacity-50 px-1">
                Note: Standard 'selected' termination is recommended unless an application-wide deadlock is detected.
             </Typography>
          </div>
        </section>
      </div>
    </Modal>
  );
}
