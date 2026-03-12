import { useState } from 'react';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

export default function UserProfileModal({ isOpen, onClose }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'Admin User',
    email: 'admin@cubrid.org',
    role: 'Database Administrator',
    phone: '+82-10-1234-5678',
    department: 'Engineering',
    timezone: 'Asia/Seoul',
  });
  const [editProfile, setEditProfile] = useState({ ...profile });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!editProfile.fullName || !editProfile.email) {
      setError("Full name and email are mandatory fields.");
      return;
    }
    setLoading(true);
    setError(null);
    setTimeout(() => {
      if (editProfile.email.includes('error')) {
        setLoading(false);
        setError("Network connection lost. Please verify your internet settings and try again.");
      } else {
        setProfile({ ...editProfile });
        setIsEditing(false);
        setLoading(false);
      }
    }, 1500);
  };

  const handleCancel = () => {
    setEditProfile({ ...profile });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
      <div className="bg-white dark:bg-bk-side w-full max-w-[480px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col relative">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        {/* Standard Overlays */}
        <LoadingOverlay 
            isVisible={loading} 
            title="Updating profile" 
            subtitle="Saving preference changes..." 
        />
        <ErrorOverlay 
          isVisible={!!error} 
          error={error} 
          onRetry={handleSave}
          onClose={() => setError(null)}
        />

        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-bk-yellow text-xl">account_circle</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">User profile</h3>
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

        {/* Body - Technical Grid */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Identity & Role</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Full name</label>
              {isEditing ? (
                <input 
                  type="text" 
                  value={editProfile.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[13px] text-slate-900 dark:text-slate-100 transition-all font-medium placeholder:text-slate-400"
                  placeholder="e.g. John Doe"
                />
              ) : (
                <p className="text-[13px] text-slate-700 dark:text-slate-200 px-3 py-1.5 bg-slate-50/50 dark:bg-bk-main/30 rounded border border-transparent dark:border-slate-800/50 font-medium">
                  {profile.fullName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Role</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editProfile.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[13px] text-slate-900 dark:text-slate-100 transition-all font-medium"
                  />
                ) : (
                  <p className="text-[13px] text-slate-700 dark:text-slate-200 px-3 py-1.5 bg-slate-50/50 dark:bg-bk-main/30 rounded border border-transparent dark:border-slate-800/50 font-medium">
                    {profile.role}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Department</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editProfile.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[13px] text-slate-900 dark:text-slate-100 transition-all font-medium"
                  />
                ) : (
                  <p className="text-[13px] text-slate-700 dark:text-slate-200 px-3 py-1.5 bg-slate-50/50 dark:bg-bk-main/30 rounded border border-transparent dark:border-slate-800/50 font-medium">
                    {profile.department}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Regional */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Contact & regional</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Email address</label>
              {isEditing ? (
                <input 
                  type="email" 
                  value={editProfile.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[13px] text-slate-900 dark:text-slate-100 transition-all font-medium"
                />
              ) : (
                <p className="text-[13px] text-slate-700 dark:text-slate-200 px-3 py-1.5 bg-slate-50/50 dark:bg-bk-main/30 rounded border border-transparent dark:border-slate-800/50 font-medium">
                  {profile.email}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Phone number</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editProfile.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[13px] text-slate-900 dark:text-slate-100 transition-all font-medium"
                  />
                ) : (
                  <p className="text-[13px] text-slate-700 dark:text-slate-200 px-3 py-1.5 bg-slate-50/50 dark:bg-bk-main/30 rounded border border-transparent dark:border-slate-800/50 font-medium">
                    {profile.phone}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5 flex items-center h-4">Timezone</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={editProfile.timezone}
                    onChange={(e) => handleChange('timezone', e.target.value)}
                    className="w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded focus:outline-none focus:border-bk-yellow/50 text-[13px] text-slate-900 dark:text-slate-100 transition-all font-medium"
                  />
                ) : (
                  <p className="text-[13px] text-slate-700 dark:text-slate-200 px-3 py-1.5 bg-slate-50/50 dark:bg-bk-main/30 rounded border border-transparent dark:border-slate-800/50 font-medium">
                    {profile.timezone}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer - Compressed */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          {isEditing ? (
            <>
              <button 
                disabled={loading}
                className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                onClick={handleCancel}
              >
                Discard
              </button>
              <button 
                disabled={loading}
                className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50"
                onClick={handleSave}
              >
                {loading ? (
                  <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[16px]">save_as</span>
                    <span>Save changes</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <button 
                className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                onClick={onClose}
              >
                Close
              </button>
              <button 
                className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[120px]"
                onClick={() => {
                  setEditProfile({ ...profile });
                  setIsEditing(true);
                }}
              >
                <span className="material-symbols-outlined text-[16px]">edit_note</span>
                <span>Modify profile</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
