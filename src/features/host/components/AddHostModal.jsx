import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addHost } from '../hostSlice';

export default function AddHostModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    id: '',
    address: '',
    port: '8001',
    password: '',
    alias: '',
  });
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();
  const { loading, error: apiError } = useSelector((state) => state.host);

  // Clear form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({ id: '', address: '', port: '8001', password: '', alias: '' });
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!formData.alias.trim()) errs.alias = 'Host Name is required';
    if (!formData.address.trim()) errs.address = 'Address is required';
    if (!formData.port.trim()) errs.port = 'Port is required';
    if (!formData.id.trim()) errs.id = 'User is required';
    if (!formData.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    // Convert port to number
    const payload = {
      ...formData,
      port: Number(formData.port)
    };
    
    // dispatch addHost thunk
    dispatch(addHost(payload));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={loading ? undefined : onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all z-10">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-3 bg-white dark:bg-slate-800 px-6 py-4 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
              <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Connecting to Host...</span>
            </div>
          </div>
        )}
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">add_box</span>
            Add New Host
          </h3>
          <button 
            disabled={loading}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors rounded-lg p-1 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center disabled:opacity-50"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-4">
          {apiError && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-accent-red bg-accent-red/10 border border-accent-red/20 rounded-xl">
              <span className="material-symbols-outlined text-[18px]">error</span>
              {apiError}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Host Name *</label>
            <input 
              type="text" 
              name="alias"
              value={formData.alias}
              onChange={handleChange}
              className={`w-full px-3 py-1.5 bg-white dark:bg-slate-950 border ${errors.alias ? 'border-accent-red focus:ring-accent-red/50' : 'border-slate-300 dark:border-slate-700 focus:ring-primary/50'} rounded focus:outline-none focus:ring-2 text-[13px] text-slate-900 dark:text-slate-100 transition-shadow`} 
              placeholder="e.g. Production DB" 
              disabled={loading}
            />
            {errors.alias && <p className="mt-1 text-xs text-accent-red">{errors.alias}</p>}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Host Address *</label>
              <input 
                type="text" 
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border ${errors.address ? 'border-accent-red focus:ring-accent-red/50' : 'border-slate-300 dark:border-slate-700 focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 text-sm text-slate-900 dark:text-slate-100 transition-shadow`} 
                placeholder="192.168.1.102" 
                disabled={loading}
              />
              {errors.address && <p className="mt-1 text-xs text-accent-red">{errors.address}</p>}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Port *</label>
              <input 
                type="text" 
                name="port"
                value={formData.port}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border ${errors.port ? 'border-accent-red focus:ring-accent-red/50' : 'border-slate-300 dark:border-slate-700 focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 text-sm text-slate-900 dark:text-slate-100 transition-shadow`} 
                placeholder="8001" 
                disabled={loading}
              />
              {errors.port && <p className="mt-1 text-xs text-accent-red">{errors.port}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">User *</label>
            <input 
              type="text" 
              name="id"
              value={formData.id}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border ${errors.id ? 'border-accent-red focus:ring-accent-red/50' : 'border-slate-300 dark:border-slate-700 focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 text-sm text-slate-900 dark:text-slate-100 transition-shadow`} 
              placeholder="e.g. admin" 
              disabled={loading}
            />
            {errors.id && <p className="mt-1 text-xs text-accent-red">{errors.id}</p>}
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password *</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border ${errors.password ? 'border-accent-red focus:ring-accent-red/50' : 'border-slate-300 dark:border-slate-700 focus:ring-primary/50'} rounded-lg focus:outline-none focus:ring-2 text-sm text-slate-900 dark:text-slate-100 transition-shadow`} 
              placeholder="••••••••" 
              disabled={loading}
            />
            {errors.password && <p className="mt-1 text-xs text-accent-red">{errors.password}</p>}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
          <button 
            disabled={loading}
            className="px-4 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors disabled:opacity-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            disabled={loading}
            className="px-4 py-1.5 text-sm font-medium bg-primary text-white hover:bg-primary/90 rounded transition-colors shadow-sm flex items-center justify-center gap-2 min-w-[140px] disabled:opacity-50"
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Adding...
              </>
            ) : (
              'Create Connection'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
