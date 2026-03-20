import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateAccount, fetchUser } from '../../auth/authSlice';
import { authApi } from '../../auth/authApi';

// Import New Design System Components
import Modal from '../../../components/ui/Layout/Modal';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Input from '../../../components/ui/Forms/Input';
import Card from '../../../components/ui/Layout/Card';
import Alert from '../../../components/ui/Feedback/Alert';

export default function UserProfileModal({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const { user, loading: globalLoading, error: globalError } = useSelector((state) => state.auth);
  const [editMode, setEditMode] = useState(null); // 'profile' | 'password' | null
  
  const [profile, setProfile] = useState({
    id: user?.id || '',
    department: user?.department || '',
  });

  const [editProfile, setEditProfile] = useState({ ...profile });
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      const newProfile = { id: user.id || '', department: user.department || '' };
      setProfile(newProfile);
      if (!editMode) setEditProfile(newProfile);
    }
  }, [user, editMode]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError(null);
    try {
      if (editMode === 'password') {
        if (!passwords.oldPassword || !passwords.newPassword || !passwords.confirmPassword) {
          setError("Please fill in all password fields.");
          return;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
          setError("New passwords do not match.");
          return;
        }

        setLoading(true);
        await authApi.updatePassword(passwords.oldPassword, passwords.newPassword);
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setEditMode(null);
        setLoading(false);
      } else if (editMode === 'profile') {
        setLoading(true);
        const resultAction = await dispatch(updateAccount({ department: editProfile.department }));
        if (updateAccount.fulfilled.match(resultAction)) {
          await dispatch(fetchUser());
          setEditMode(null);
        } else {
          setError(resultAction.payload || "Failed to update profile");
        }
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditProfile({ ...profile });
    setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setEditMode(null);
    setError(null);
  };

  const handleProfileChange = (field, value) => {
    setEditProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswords(prev => ({ ...prev, [field]: value }));
  };

  const footer = (
    <div className="flex justify-end gap-3 w-full">
      {editMode ? (
        <>
          <Button variant="ghost" onClick={handleCancel} disabled={loading}>Discard</Button>
          <Button variant="primary" onClick={handleSave} loading={loading} icon="check_circle">
            {editMode === 'password' ? 'Update Password' : 'Save Changes'}
          </Button>
        </>
      ) : (
        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1" icon="edit_square" onClick={() => setEditMode('profile')}>Modify</Button>
          <Button variant="outline" className="flex-1" icon="lock_reset" onClick={() => setEditMode('password')}>Security</Button>
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editMode === 'password' ? 'Change Password' : 'Account Information'}
      subtitle={user?.username || 'User Profile'}
      icon={editMode === 'password' ? 'key' : 'account_circle'}
      footer={footer}
      maxWidth="max-w-[420px]"
    >
      <div className="space-y-6">
        {(error || globalError) && <Alert variant="error" title="Error" onClose={() => setError(null)}>{error || globalError}</Alert>}

        <section className="space-y-4">
          <div className="space-y-1.5">
            <Typography variant="label" className="opacity-50 ml-1">Account ID</Typography>
            <Card className="bg-muted/10 border-border/50 py-2.5 px-4">
              <Typography variant="span" className="font-mono text-primary font-bold">{profile.id}</Typography>
            </Card>
          </div>

          {editMode === 'profile' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
               <Input 
                 label="Department" 
                 value={editProfile.department} 
                 onChange={(e) => handleProfileChange('department', e.target.value)} 
                 placeholder="e.g. Engineering"
                 icon="corporate_fare"
               />
            </div>
          ) : editMode === 'password' ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
               <Input 
                 type="password" 
                 label="Current password" 
                 value={passwords.oldPassword} 
                 onChange={(e) => handlePasswordChange('oldPassword', e.target.value)} 
                 placeholder="••••••••"
                 icon="lock_open"
               />
               <div className="h-[1px] bg-border/50 my-2"></div>
               <Input 
                 type="password" 
                 label="New password" 
                 value={passwords.newPassword} 
                 onChange={(e) => handlePasswordChange('newPassword', e.target.value)} 
                 placeholder="••••••••"
                 icon="key"
               />
               <Input 
                 type="password" 
                 label="Confirm new password" 
                 value={passwords.confirmPassword} 
                 onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)} 
                 placeholder="••••••••"
                 error={passwords.confirmPassword && passwords.newPassword !== passwords.confirmPassword ? "Passwords don't match" : null}
                 icon="verified_user"
               />
            </div>
          ) : (
            <div className="space-y-1.5 animate-in fade-in">
              <Typography variant="label" className="opacity-50 ml-1">Department</Typography>
              <Card className="bg-muted/5 border-border/30 py-2.5 px-4 flex items-center justify-between">
                <Typography variant="span" className="font-medium">{profile.department || 'Not assigned'}</Typography>
                <Icon name="corporate_fare" size="sm" className="opacity-20" />
              </Card>
            </div>
          )}
        </section>

        {!editMode && (
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex gap-3">
             <Icon name="info" className="text-primary" />
             <Typography variant="caption" className="opacity-70 leading-relaxed">
               Your account information is used for identification and auditing purposes within the CUBRID Manager ecosystem.
             </Typography>
          </div>
        )}
      </div>
    </Modal>
  );
}
