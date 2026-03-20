import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeDeleteDBModal, deleteDatabase, fetchDatabaseStartInfo } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';
import { databaseApi } from '../databaseApi';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Input from '../../../components/ui/Forms/Input';
import Alert from '../../../components/ui/Feedback/Alert';
import Table from '../../../components/ui/Layout/Table';
import Checkbox from '../../../components/ui/Forms/Checkbox';

export default function DeleteDatabaseModal() {
  const dispatch = useDispatch();
  const { isDeleteDBModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);

  const [step, setStep] = useState(1); // 1: Info, 2: Password
  const [deleteBackup, setDeleteBackup] = useState(false);
  const [volumeInfo, setVolumeInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dbId, setDbId] = useState('dba');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDeleteDBModalOpen && selectedDatabase && selectedHostUid) {
      setStep(1);
      setDbId('dba');
      setPassword('');
      setError(null);
      setLoading(true);
      databaseApi.getVolumeInfo(selectedHostUid, selectedDatabase)
        .then(res => {
          if (res && res.spaceinfo) {
            const pageSize = parseInt(res.pagesize || 0);
            const data = res.spaceinfo.map(item => ({
              spacename: item?.name || item?.spacename || '-',
              location: item?.path || item?.location || '-',
              date: item?.date || '-',
              type: item?.type || '-',
              totalpage: item?.totalpage || '-',
              freepage: item?.freepage || '-',
              volumeSizeMB: item?.totalpage ? (((parseInt(item.totalpage) * pageSize) / (1024 * 1024)).toFixed(1)) : '-'
            }));
            setVolumeInfo(data);
          }
        })
        .catch(err => console.error('Failed to fetch volume info:', err))
        .finally(() => setLoading(false));
    }
  }, [isDeleteDBModalOpen, selectedDatabase, selectedHostUid]);

  const handleConfirmAction = async () => {
    if (error) {
      setError(null);
      setPassword('');
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    setProcessing(true);
    try {
      const loginRes = await databaseApi.loginDatabase(selectedHostUid, selectedDatabase, {
        id: dbId,
        password: password,
      });

      if (loginRes.success || loginRes.status === 'success' || (!loginRes.error && !loginRes.code)) {
        await dispatch(deleteDatabase({
          hostUid: selectedHostUid,
          dbname: selectedDatabase,
          payload: { delbackup: deleteBackup ? 'y' : 'n' }
        })).unwrap();

        dispatch(showStatusModal({
          type: 'success',
          title: 'Success',
          message: `Delete Database - ${selectedDatabase}@${selectedDatabase} has been completed successfully`
        }));

        dispatch(fetchDatabaseStartInfo(selectedHostUid));
        handleClose();
      } else {
        throw loginRes;
      }
    } catch (err) {
      setError(err?.message || 'Authentication failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => dispatch(closeDeleteDBModal());

  const columns = [
    { key: 'spacename', title: 'Volume Name' },
    { key: 'location', title: 'Volume Path', className: 'truncate max-w-[200px]' },
    { key: 'type', title: 'Type' },
    { key: 'volumeSizeMB', title: 'Size (MB)', className: 'text-right font-mono' }
  ];

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      {step === 2 && !error && !processing && (
        <Button variant="ghost" onClick={() => setStep(1)} className="mr-auto">Back</Button>
      )}
      <Button variant="ghost" onClick={handleClose} disabled={processing}>Discard</Button>
      <Button 
        variant={step === 1 ? "primary" : "destructive"} 
        onClick={handleConfirmAction} 
        loading={processing}
        icon={error ? 'refresh' : (step === 1 ? 'arrow_forward' : 'delete_forever')}
      >
        {error ? 'Try again' : (step === 1 ? 'Proceed' : 'Delete database')}
      </Button>
    </div>
  );

  if (!isDeleteDBModalOpen) return null;

  return (
    <Modal
      isOpen={isDeleteDBModalOpen}
      onClose={handleClose}
      title={step === 1 ? 'Delete database' : 'Security verification'}
      subtitle={`${selectedDatabase} @ ${selectedHostUid}`}
      icon="delete_forever"
      footer={footer}
      maxWidth={step === 1 ? "max-w-4xl" : "max-w-md"}
    >
      <div className="space-y-6">
        {error && <Alert variant="error" title="Action failed" onClose={() => setError(null)}>{error}</Alert>}

        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            <section className="space-y-4">
               <div className="flex items-center gap-3">
                  <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Target Summary</Typography>
                  <div className="flex-1 h-[1px] bg-border/50"></div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/10 border border-border/50">
                     <Typography variant="caption" className="block opacity-50 uppercase font-black tracking-tighter mb-1">Database Name</Typography>
                     <Typography variant="h4" className="text-secondary">{selectedDatabase}</Typography>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/10 border border-border/50">
                     <Typography variant="caption" className="block opacity-50 uppercase font-black tracking-tighter mb-1">Host UID</Typography>
                     <Typography variant="h4" className="text-primary italic">{selectedHostUid}</Typography>
                  </div>
               </div>
            </section>

            <section className="space-y-4">
               <div className="flex items-center gap-3">
                  <Typography variant="caption" className="font-bold uppercase tracking-widest text-primary/60">Storage Footprint</Typography>
                  <div className="flex-1 h-[1px] bg-border/50"></div>
               </div>
               <div className="border border-border rounded-xl overflow-hidden">
                  <Table columns={columns} data={volumeInfo} loading={loading} />
               </div>
            </section>

            <section className="space-y-4 pb-2">
               <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-xl flex items-center justify-between group cursor-pointer" onClick={() => setDeleteBackup(!deleteBackup)}>
                  <div className="flex items-center gap-4">
                     <div className={`p-2 rounded-lg transition-all ${deleteBackup ? 'bg-destructive text-white shadow-lg' : 'bg-muted text-muted-foreground opacity-40'}`}>
                        <Icon name="auto_delete" />
                     </div>
                     <div>
                        <Typography variant="span" className="font-bold block">Delete backup volumes</Typography>
                        <Typography variant="caption" className="opacity-60 block">Erase all recovery points and historical snapshots.</Typography>
                     </div>
                  </div>
                  <Checkbox checked={deleteBackup} onChange={setDeleteBackup} />
               </div>
            </section>
          </div>
        ) : (
          <div className="space-y-8 py-4 animate-in fade-in zoom-in-95 duration-300">
             <div className="flex flex-col items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center shadow-2xl shadow-destructive/20">
                   <Icon name="security" className="text-3xl text-destructive" />
                </div>
                <div className="text-center space-y-1">
                   <Typography variant="h4" className="uppercase tracking-widest text-destructive">Final Confirmation</Typography>
                   <Typography variant="p" className="opacity-60 text-[13px] leading-relaxed px-4">
                      Please enter administrative credentials to permanently destroy <span className="text-foreground font-black underline underline-offset-4">{selectedDatabase}</span>.
                   </Typography>
                </div>
             </div>

             <div className="space-y-4 px-2">
                <Input label="Administrator ID" value={dbId} onChange={(e) => setDbId(e.target.value)} icon="admin_panel_settings" />
                <Input type="password" label="Authorization Password" value={password} onChange={(e) => setPassword(e.target.value)} icon="key" placeholder="••••••••" />
             </div>

             <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex gap-3 mx-2">
                <Icon name="warning" className="text-amber-500" />
                <Typography variant="caption" className="text-amber-600 font-bold leading-relaxed">
                   CRITICAL: This operation is irreversible. All data, schemas, and configurations will be purged.
                </Typography>
             </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
