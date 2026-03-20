import { useDispatch, useSelector } from 'react-redux';
import { closeDropUserModal, dropDatabaseUser } from '../userSlice';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';

export default function DropUserModal() {
  const dispatch = useDispatch();
  const { isDropUserModalOpen, dropUserData, actionLoading, error } = useSelector((state) => state.user);
  const { selectedHostUid } = useSelector((state) => state.host);

  if (!isDropUserModalOpen || !dropUserData) return null;

  const handleDrop = () => {
    dispatch(dropDatabaseUser({ 
      hostUid: selectedHostUid, 
      dbname: dropUserData.dbname, 
      userName: dropUserData.userName 
    }));
  };

  const footer = (
    <div className="flex gap-3 w-full">
      <Button 
        variant="ghost" 
        className="flex-1"
        onClick={() => dispatch(closeDropUserModal())}
        disabled={actionLoading}
      >
        Cancel
      </Button>
      <Button 
        variant="destructive" 
        className="flex-1"
        onClick={handleDrop}
        loading={actionLoading}
        icon="person_remove"
      >
        Drop User
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isDropUserModalOpen}
      onClose={() => dispatch(closeDropUserModal())}
      title="Drop Database User"
      subtitle={`Permanently remove user from ${dropUserData.dbname}`}
      icon="person_remove"
      footer={footer}
      maxWidth="max-w-[400px]"
    >
      <div className="space-y-4">
        {error && <Alert variant="error" title="Drop Failed">{error}</Alert>}
        
        <div className="p-4 bg-destructive/5 border border-destructive/10 rounded-xl space-y-3">
          <Typography variant="p" className="text-[13px] leading-relaxed">
            Are you sure you want to drop user <span className="font-bold text-foreground">"{dropUserData.userName}"</span>?
          </Typography>
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-lg">
             <Icon name="warning" size="sm" className="text-destructive" />
             <Typography variant="caption" className="font-bold text-destructive uppercase tracking-tighter">This action cannot be undone</Typography>
          </div>
        </div>

        <Typography variant="caption" className="block px-1 opacity-50 italic">
          All associated privileges and object authorizations for this user will be purged from the system.
        </Typography>
      </div>
    </Modal>
  );
}
