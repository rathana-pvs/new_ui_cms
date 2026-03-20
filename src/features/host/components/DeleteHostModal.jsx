import { useDispatch, useSelector } from 'react-redux';
import { closeDeleteHostModal, deleteHost } from '../hostSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Alert from '../../../components/ui/Feedback/Alert';

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

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      <Button 
        variant="ghost" 
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
    </div>
  );

  return (
    <Modal
      isOpen={isDeleteHostModalOpen}
      onClose={handleClose}
      title="Delete host connection"
      icon="delete_forever"
      iconVariant="danger"
      footer={footer}
      maxWidth="max-w-[400px]"
    >
      <div className="space-y-6">
        {apiError && (
          <Alert variant="error" title="Action failed">
            {apiError}
          </Alert>
        )}

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Typography variant="caption" className="font-bold uppercase tracking-widest text-destructive/60">
              Warning
            </Typography>
            <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          
          <div className="space-y-3">
            <Typography variant="p" className="font-medium leading-relaxed">
              Are you sure you want to permanently delete the connection for <span className="text-destructive font-black underline decoration-2 underline-offset-4">{hostToDeleteAlias || hostToDeleteUid}</span>?
            </Typography>
            <Alert variant="warning">
              This action is irreversible. All saved credentials and configuration for this host will be removed from your local manager.
            </Alert>
          </div>
        </div>
      </div>
    </Modal>
  );
}
