import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCheckDatabaseModal } from '../databaseSlice';
import { databaseApi } from '../databaseApi';
import { showStatusModal } from '../../layout/layoutSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';
import Card from '../../../components/ui/Layout/Card';
import Checkbox from '../../../components/ui/Forms/Checkbox';

export default function CheckDatabaseModal() {
  const dispatch = useDispatch();
  const { isCheckDatabaseModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  const [repair, setRepair] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isCheckDatabaseModalOpen) return null;

  const handleCheck = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await databaseApi.checkDatabase(selectedHostUid, selectedDatabase, { repairdb: repair ? 'y' : 'n' });
      dispatch(closeCheckDatabaseModal());
      dispatch(showStatusModal({
        type: 'success',
        title: 'Check complete',
        message: response.note || 'Database check completed successfully.'
      }));
    } catch (err) {
      setError(err.response?.data?.note || err.response?.data?.message || 'The database check operation encountered a conflict or failed to reach the server.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeCheckDatabaseModal())} disabled={loading}>Discard</Button>
      <Button variant="primary" onClick={handleCheck} loading={loading} icon="verified">Run Check</Button>
    </div>
  );

  return (
    <Modal
      isOpen={isCheckDatabaseModalOpen}
      onClose={() => dispatch(closeCheckDatabaseModal())}
      title="Check database"
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="verified"
      footer={footer}
      maxWidth="max-w-[440px]"
    >
      <div className="space-y-6">
        {error && <Alert variant="error" title="Verification failed" onClose={() => setError(null)}>{error}</Alert>}

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Scanning Scope</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <Card className="bg-muted/10 border-border/50 py-3 px-4 flex items-center justify-between">
             <Typography variant="span" className="font-black text-secondary">{selectedDatabase}</Typography>
             <Icon name="database" size="sm" className="opacity-20" />
          </Card>
        </section>

        <section className="space-y-4">
          <Card className="p-4 bg-primary/5 border-primary/10 flex gap-4">
             <Icon name="info" className="text-primary" />
             <div className="space-y-1.5 flex-1">
                <Typography variant="caption" className="font-bold block tracking-tight uppercase">Integrity Verification</Typography>
                <Typography variant="p" className="opacity-70 leading-relaxed text-[12px]">
                   Scans for storage-level inconsistencies and data corruption. Enabling auto-repair allows the system to attempt recovery if issues are detected.
                </Typography>
             </div>
          </Card>

          <div className="p-4 border border-border rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all" onClick={() => setRepair(!repair)}>
             <div className="flex flex-col">
                <Typography variant="span" className="font-bold block tracking-tight">Attempt automatic repair</Typography>
                <Typography variant="caption" className="opacity-50 block leading-tight">Recover from minor discrepancies during the scan.</Typography>
             </div>
             <Checkbox checked={repair} onChange={setRepair} />
          </div>
        </section>
      </div>
    </Modal>
  );
}
