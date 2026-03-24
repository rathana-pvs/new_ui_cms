import { useDispatch, useSelector } from 'react-redux';
import { closeDeleteHostModal, deleteHost } from '../hostSlice';
import { Modal } from '../../../components/ds/layout/Modal';
import { Button } from '../../../components/ds/foundation/Button';
import { Typography } from '../../../components/ds/foundation/Typography';
import { Divider } from '../../../components/ds/layout/Divider';

export default function DeleteHostModal() {
  const dispatch = useDispatch();
  const { isDeleteHostModalOpen, hostToDeleteUid, hostToDeleteAlias, loading, error: apiError } = useSelector((state) => state.host);

  if (!isDeleteHostModalOpen) return null;

  const handleDelete = async () => {
    if (hostToDeleteUid) {
      dispatch(deleteHost(hostToDeleteUid));
    }
  };

  const handleClose = () => {
    dispatch(closeDeleteHostModal());
  };

  return (
    <Modal
      isOpen={isDeleteHostModalOpen}
      onClose={handleClose}
      title="Delete host connection"
      icon="delete_forever"
      loading={loading}
      maxWidth="max-w-[400px]"
      accentColor="rose-500"
      footer={
        <>
          <Button 
            variant="secondary" 
            onClick={handleClose}
            disabled={loading}
          >
            Discard
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDelete}
            loading={loading}
            icon="delete"
            className="min-w-[120px]"
          >
            Delete
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {apiError && (
          <div className="flex items-center gap-2 px-3 py-2 bg-rose-500/5 border border-rose-500/10 rounded animate-in fade-in slide-in-from-top-1 duration-200">
            <span className="material-symbols-outlined text-[16px] text-rose-500">error</span>
            <Typography variant="caption" className="text-rose-500 font-medium">{apiError}</Typography>
          </div>
        )}

        <div className="space-y-4">
          <Divider label="Warning" />
          
          <div className="space-y-2.5">
            <Typography variant="p" className="text-[13px] font-medium leading-relaxed">
              Are you sure you want to permanently delete the connection for <span className="text-rose-500 underline underline-offset-4 decoration-rose-500/30">{hostToDeleteAlias || hostToDeleteUid}</span>?
            </Typography>
            <Typography variant="p" className="text-[11px] text-slate-500 dark:text-slate-400 italic leading-relaxed">
              This action is irreversible. All saved credentials and configuration for this host will be removed from your local manager.
            </Typography>
          </div>
        </div>
      </div>
    </Modal>
  );
}
