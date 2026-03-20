import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeCompactDatabaseModal } from '../databaseSlice';
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

export default function CompactDatabaseModal() {
  const dispatch = useDispatch();
  const { isCompactDatabaseModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  const [verbose, setVerbose] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isCompactDatabaseModalOpen) return null;

  const handleCompact = async () => {
    if (!selectedHostUid || !selectedDatabase) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await databaseApi.compactDatabase(selectedHostUid, selectedDatabase, { verbose: verbose ? 'y' : 'n' });
      dispatch(closeCompactDatabaseModal());
      dispatch(showStatusModal({
        type: 'success',
        title: 'Compaction success',
        message: response.note || 'Database compaction completed successfully.'
      }));
    } catch (err) {
      setError(err.response?.data?.note || err.response?.data?.message || 'Database compaction failed. Ensure no other maintenance tasks are running.');
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button variant="ghost" onClick={() => dispatch(closeCompactDatabaseModal())} disabled={loading}>Discard</Button>
      <Button variant="primary" onClick={handleCompact} loading={loading} icon="compress">Run Compact</Button>
    </div>
  );

  return (
    <Modal
      isOpen={isCompactDatabaseModalOpen}
      onClose={() => dispatch(closeCompactDatabaseModal())}
      title="Compact database"
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="compress"
      footer={footer}
      maxWidth="max-w-[440px]"
    >
      <div className="space-y-6">
        {error && <Alert variant="error" title="Action failed" onClose={() => setError(null)}>{error}</Alert>}

        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Maintenance Scope</Typography>
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
                <Typography variant="caption" className="font-bold block tracking-tight uppercase">Storage Optimization</Typography>
                <Typography variant="p" className="opacity-70 leading-relaxed text-[12px]">
                   The compaction utility reclaims storage by purging OIDs of deleted objects and consolidating fragmented table representations.
                </Typography>
             </div>
          </Card>

          <div className="p-4 border border-border rounded-xl flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-all" onClick={() => setVerbose(!verbose)}>
             <div className="flex flex-col">
                <Typography variant="span" className="font-bold block tracking-tight">Verbose reporting</Typography>
                <Typography variant="caption" className="opacity-50 block leading-tight">Enable highly detailed operational telemetry.</Typography>
             </div>
             <Checkbox checked={verbose} onChange={setVerbose} />
          </div>
        </section>
      </div>
    </Modal>
  );
}
