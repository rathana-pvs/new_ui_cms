import { useState } from 'react';

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

  if (!isOpen) return null;

  const handleSave = () => {
    setProfile({ ...editProfile });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditProfile({ ...profile });
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setEditProfile(prev => ({ ...prev, [field]: value }));
  };

  const fields = [
    { key: 'fullName', label: 'Full Name', icon: 'person', color: 'text-accent-blue' },
    { key: 'email', label: 'Email', icon: 'mail', color: 'text-accent-orange' },
    { key: 'role', label: 'Role', icon: 'badge', color: 'text-accent-purple' },
    { key: 'phone', label: 'Phone', icon: 'phone', color: 'text-accent-green' },
    { key: 'department', label: 'Department', icon: 'business', color: 'text-primary' },
    { key: 'timezone', label: 'Timezone', icon: 'schedule', color: 'text-accent-yellow' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1e2230] w-full max-w-md rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[24px]">account_circle</span>
            </div>
            <div>
              <h2 className="text-[15px] font-bold text-slate-700 dark:text-white">User Profile</h2>
              <p className="text-[11px] text-slate-400 font-bold tracking-widest">{profile.role}</p>
            </div>
          </div>
          <button
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          {fields.map(({ key, label, icon, color }) => (
            <div key={key} className="space-y-1.5">
              <label className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 pl-1">
                <span className={`material-symbols-outlined text-[16px]`}>{icon}</span>
                {label}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editProfile[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full h-[34px] px-3 text-[13px] rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1e2230] text-slate-700 dark:text-slate-200 focus:border-blue-500 outline-none transition-all shadow-sm"
                />
              ) : (
                <div className="w-full px-4 py-2 text-[13.5px] text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-900/40 rounded-lg border border-slate-100/50 dark:border-slate-800/60 font-medium">
                  {profile[key]}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 flex items-center gap-2.5 justify-end bg-slate-50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50">
          {isEditing ? (
            <>
              <button
                className="h-[34px] px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[13px] rounded-md transition-all font-bold"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="h-[34px] px-6 bg-blue-600 hover:bg-blue-700 text-white text-[13px] rounded-md shadow-sm transition-all font-bold flex items-center justify-center gap-2"
                onClick={handleSave}
              >
                <span className="material-symbols-outlined text-[18px]">check</span>
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                className="h-[34px] px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[13px] rounded-md transition-all font-bold"
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="h-[34px] px-6 bg-blue-600 hover:bg-blue-700 text-white text-[13px] rounded-md shadow-sm transition-all font-bold flex items-center justify-center gap-2"
                onClick={() => {
                  setEditProfile({ ...profile });
                  setIsEditing(true);
                }}
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
