import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';
import { updateAccount, fetchUser } from '../../auth/authSlice';
import { authApi } from '../../auth/authApi';

export default function UserProfileModal({ isOpen, onClose }) {
  const { user } = useSelector((state) => state.auth);
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

  useEffect(() => {
    if (user) {
      const newProfile = {
        id: user.id || '',
        department: user.department || ''
      };
      setProfile(newProfile);
      if (!editMode) {
        setEditProfile(newProfile);
      }
    }
  }, [user]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const globalLoading = useSelector(state => state.auth.loading);
  const globalError = useSelector(state => state.auth.error);

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
          await dispatch(fetchUser()); // Refresh data from server
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

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className="bg-white dark:bg-bk-side w-full max-w-[400px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        {/* Standard Overlays */}
        <LoadingOverlay 
            isVisible={loading || globalLoading} 
            title={editMode === 'password' ? "Updating password" : (loading ? "Saving changes" : "Loading profile")} 
            subtitle="Processing request..." 
        />
        <ErrorOverlay 
          isVisible={!!error || !!globalError} 
          error={error || globalError} 
          onRetry={error ? handleSave : () => dispatch(fetchUser())}
          onClose={() => {
            if (error) setError(null);
          }}
        />

        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0 text-left">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">
                {editMode === 'password' ? 'key' : 'account_circle'}
              </span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide text-left">
                {editMode === 'password' ? 'Change password' : 'Account info'}
              </h3>
            </div>
          </div>
          <button 
            disabled={loading}
            onClick={onClose}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 flex-1">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">User ID</label>
              <div className="w-full h-9 px-3 flex items-center bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-400 select-none cursor-not-allowed">
                {profile.id}
              </div>
            </div>

            {editMode === 'profile' ? (
              <div className="space-y-1.5 animate-in slide-in-from-top-1">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Department</label>
                <input 
                  type="text" 
                  value={editProfile.department}
                  onChange={(e) => handleProfileChange('department', e.target.value)}
                  className="w-full h-9 px-3 bg-white dark:bg-bk-main/20 border border-slate-200 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-bk-yellow/50 transition-all placeholder:text-slate-400"
                />
              </div>
            ) : editMode === 'password' ? (
              <div className="space-y-4 animate-in slide-in-from-top-1">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Old password</label>
                  <input 
                    type="password" 
                    value={passwords.oldPassword}
                    onChange={(e) => handlePasswordChange('oldPassword', e.target.value)}
                    className="w-full h-9 px-3 bg-white dark:bg-bk-main/20 border border-slate-200 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-bk-yellow/50 transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">New password</label>
                  <input 
                    type="password" 
                    value={passwords.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    className="w-full h-9 px-3 bg-white dark:bg-bk-main/20 border border-slate-200 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-bk-yellow/50 transition-all placeholder:text-slate-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Confirm password</label>
                  <input 
                    type="password" 
                    value={passwords.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    className="w-full h-9 px-3 bg-white dark:bg-bk-main/20 border border-slate-200 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:border-bk-yellow/50 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Department</label>
                <div className="w-full h-9 px-3 flex items-center bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-200 font-sans">
                  {profile.department || 'Not assigned'}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          {editMode ? (
            <>
              <button 
                disabled={loading}
                className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all font-sans"
                onClick={handleCancel}
              >
                Discard
              </button>
              <button 
                disabled={loading}
                className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[120px]"
                onClick={handleSave}
              >
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>{editMode === 'password' ? 'Update' : 'Save'}</span>
              </button>
            </>
          ) : (
            <div className="flex gap-3 w-full">
              <button 
                className="flex-1 px-4 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                onClick={() => setEditMode('profile')}
              >
                <span className="material-symbols-outlined text-[16px]">edit_square</span>
                <span>Modify</span>
              </button>
              <button 
                className="flex-1 px-4 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
                onClick={() => setEditMode('password')}
              >
                <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                <span>Security</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
