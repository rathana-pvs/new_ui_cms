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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      
      {/* Modal */}
      <div className="relative bg-white dark:bg-[#1e2230] w-full max-w-xl rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white dark:bg-[#1e2230]/80">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-sm animate-spin"></div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-sans">Connecting to Host...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-50 dark:border-slate-800/50">
          <h3 className="text-[15px] font-bold text-slate-700 dark:text-white">
            Add New Host
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="px-5 py-4 space-y-5 overflow-y-auto custom-scrollbar flex-1 bg-white dark:bg-[#1e2230]">
          {apiError && (
            <div className="flex items-center gap-3 px-3 py-2 text-[13px] text-rose-600 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-md">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span className="font-medium">{apiError}</span>
            </div>
          )}

          <fieldset className="border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-3.5">
            <legend className="text-[12px] font-bold text-slate-500 dark:text-slate-400 px-2 mx-2 font-sans">Host Configuration</legend>
            
            <div className="flex items-center gap-4">
              <label className="w-[120px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right">Host Name * :</label>
              <div className="flex-1">
                <input 
                  type="text" 
                  name="alias"
                  value={formData.alias}
                  onChange={handleChange}
                  className={`w-full h-[34px] px-3 rounded-md text-[13px] border ${errors.alias ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'} bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none transition-all shadow-sm`} 
                  placeholder="e.g. Production DB" 
                  disabled={loading}
                />
                {errors.alias && <p className="mt-1 text-[11px] text-rose-500 font-medium pl-1">{errors.alias}</p>}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="w-[120px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right">Address * :</label>
              <div className="flex-1 flex gap-3">
                <div className="flex-[3]">
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full h-[34px] px-3 rounded-md text-[13px] border ${errors.address ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'} bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none transition-all shadow-sm`} 
                    placeholder="192.168.1.102" 
                    disabled={loading}
                  />
                  {errors.address && <p className="mt-1 text-[11px] text-rose-500 font-medium pl-1">{errors.address}</p>}
                </div>
                <div className="flex-1 min-w-[70px]">
                  <input 
                    type="text" 
                    name="port"
                    value={formData.port}
                    onChange={handleChange}
                    className={`w-full h-[34px] px-3 rounded-md text-[13px] border ${errors.port ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'} bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none transition-all shadow-sm text-center`} 
                    placeholder="8001" 
                    disabled={loading}
                  />
                  {errors.port && <p className="mt-1 text-[11px] text-rose-500 font-medium pl-1 text-center">{errors.port}</p>}
                </div>
              </div>
            </div>
          </fieldset>

          <fieldset className="border border-slate-200 dark:border-slate-800 rounded-md p-3 space-y-3.5">
            <legend className="text-[12px] font-bold text-slate-500 dark:text-slate-400 px-2 mx-2 font-sans">Authentication</legend>
            
            <div className="flex items-center gap-4">
              <label className="w-[120px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right">User * :</label>
              <div className="flex-1">
                <input 
                  type="text" 
                  name="id"
                  value={formData.id}
                  onChange={handleChange}
                  className={`w-full h-[34px] px-3 rounded-md text-[13px] border ${errors.id ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'} bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none transition-all shadow-sm`} 
                  placeholder="e.g. admin" 
                  disabled={loading}
                />
                {errors.id && <p className="mt-1 text-[11px] text-rose-500 font-medium pl-1">{errors.id}</p>}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <label className="w-[120px] text-[12px] font-bold text-slate-600 dark:text-slate-400 text-right">Password * :</label>
              <div className="flex-1">
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full h-[34px] px-3 rounded-md text-[13px] border ${errors.password ? 'border-rose-500 focus:border-rose-500' : 'border-slate-300 dark:border-slate-800 focus:border-blue-500'} bg-white dark:bg-[#1e2230] text-slate-900 dark:text-slate-200 outline-none transition-all shadow-sm`} 
                  placeholder="••••••••" 
                  disabled={loading}
                />
                {errors.password && <p className="mt-1 text-[11px] text-rose-500 font-medium pl-1">{errors.password}</p>}
              </div>
            </div>
          </fieldset>
        </div>
        
        {/* Footer */}
        <div className="px-5 py-4 flex justify-end gap-2.5 font-sans bg-slate-50 dark:bg-slate-800/20 border-t border-slate-50 dark:border-slate-800/50">
          <button 
            disabled={loading}
            className="h-[34px] px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-[13px] rounded-md transition-all font-bold disabled:opacity-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            disabled={loading}
            className="h-[34px] px-6 bg-blue-600 hover:bg-blue-700 text-white text-[13px] rounded-md shadow-sm transition-all font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            onClick={handleSubmit}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-sm animate-spin"></div>
            ) : (
              'Create Connection'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
