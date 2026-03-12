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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl w-full max-w-md mx-4 animate-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[18px]">account_circle</span>
            </div>
            <div>
              <h2 className="text-[13px] font-normal text-slate-900 dark:text-white leading-none">User Profile</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">{profile.role}</p>
            </div>
          </div>
          <button
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-4 space-y-3 max-h-[420px] overflow-y-auto custom-scrollbar bg-white dark:bg-[#1e2230]">
          {fields.map(({ key, label, icon, color }) => (
            <div key={key} className="flex items-center gap-4">
              <label className="w-24 shrink-0 flex items-center gap-2 text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">
                <span className={`material-symbols-outlined text-[14px] ${color}`}>{icon}</span>
                {label}
              </label>
              <div className="flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editProfile[key]}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full h-8 px-2 text-[12px] rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1d27] text-slate-900 dark:text-white focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all font-normal"
                  />
                ) : (
                  <p className="text-[12px] text-slate-700 dark:text-slate-200 px-2 py-1 bg-slate-50/50 dark:bg-slate-800/20 rounded border border-transparent font-normal">
                    {profile[key]}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 py-2 bg-slate-50 dark:bg-[#1e2230] border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 justify-end flex-shrink-0">
          {isEditing ? (
            <>
              <button
                className="px-6 py-1.5 text-xs font-normal text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="px-6 py-1.5 text-xs font-normal text-white bg-primary rounded hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                onClick={handleSave}
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                Save Changes
              </button>
            </>
          ) : (
            <>
              <button
                className="px-6 py-1.5 text-xs font-normal text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="px-6 py-1.5 text-xs font-normal text-white bg-primary rounded hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                onClick={() => {
                  setEditProfile({ ...profile });
                  setIsEditing(true);
                }}
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit Profile
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
