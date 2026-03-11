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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[22px]">account_circle</span>
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">User Profile</h2>
              <p className="text-xs text-slate-400">{profile.role}</p>
            </div>
          </div>
          <button
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Fields */}
        <div className="px-6 py-5 space-y-4 max-h-[380px] overflow-y-auto">
          {fields.map(({ key, label, icon, color }) => (
            <div key={key} className="group">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                <span className={`material-symbols-outlined text-[15px] ${color}`}>{icon}</span>
                {label}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editProfile[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              ) : (
                <p className="text-sm text-slate-700 dark:text-slate-200 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-transparent">
                  {profile[key]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3 justify-end">
          {isEditing ? (
            <>
              <button
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                onClick={handleSave}
              >
                <span className="material-symbols-outlined text-[16px]">check</span>
                Save
              </button>
            </>
          ) : (
            <>
              <button
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-1.5"
                onClick={() => {
                  setEditProfile({ ...profile });
                  setIsEditing(true);
                }}
              >
                <span className="material-symbols-outlined text-[16px]">edit</span>
                Edit
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
