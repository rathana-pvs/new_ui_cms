import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addHost, clearHostError } from '../hostSlice';
import LoadingOverlay from '../../../components/common/LoadingOverlay';
import ErrorOverlay from '../../../components/common/ErrorOverlay';

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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
      <div className="bg-white dark:bg-bk-side w-full max-w-[480px] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative">
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-bk-yellow/60"></div>

        {/* Standard Overlays */}
        <LoadingOverlay isVisible={loading} title="Connecting" subtitle="Verifying host..." />
        
        <ErrorOverlay 
          isVisible={!!apiError} 
          error={apiError} 
          onRetry={handleSubmit} 
          onClose={() => dispatch(clearHostError())} 
        />

        {/* Header - Compact */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-bk-yellow/10 flex items-center justify-center border border-bk-yellow/20">
              <span className="material-symbols-outlined text-xl">add_link</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">New connection</h3>
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

        {/* Body - Denser Grid */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Section 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Credentials</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Host friendly name</label>
              <div className="relative group/field">
                <input 
                  type="text" 
                  name="alias"
                  value={formData.alias}
                  onChange={handleChange}
                  className={`w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border ${errors.alias ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-800'} rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600`} 
                  placeholder="My server" 
                  disabled={loading}
                />
                {errors.alias && <p className="mt-1 text-[9px] text-rose-500 font-medium tracking-tight">{errors.alias}</p>}
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Host identity</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3 space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">IP address / domain</label>
                <div className="relative group/field">
                  <input 
                    type="text" 
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border ${errors.address ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-800'} rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 tracking-tight`} 
                    placeholder="localhost" 
                    disabled={loading}
                  />
                  {errors.address && <p className="mt-1 text-[9px] text-rose-500 font-medium tracking-tight whitespace-nowrap">{errors.address}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Port</label>
                <div className="relative group/field">
                  <input 
                    type="text" 
                    name="port"
                    value={formData.port}
                    onChange={handleChange}
                    className={`w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border ${errors.port ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-800'} rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium text-left placeholder:text-slate-400 dark:placeholder:text-slate-600`} 
                    placeholder="8001" 
                    disabled={loading}
                  />
                  {errors.port && <p className="mt-1 text-[9px] text-rose-500 font-medium tracking-tight whitespace-nowrap">{errors.port}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500">Manager access</span>
              <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-0.5">
                  <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Admin username</label>
                </div>
                <div className="relative group/field">
                  <input 
                    type="text" 
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    className={`w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border ${errors.id ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-800'} rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600 tracking-tight`} 
                    placeholder="admin" 
                    disabled={loading}
                  />
                  {errors.id && <p className="mt-1 text-[9px] text-rose-500 font-medium tracking-tight whitespace-nowrap">{errors.id}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between ml-0.5">
                  <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Passcode</label>
                </div>
                <div className="relative group/field">
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full h-9 px-3 bg-slate-50 dark:bg-bk-main/30 border ${errors.password ? 'border-rose-500/50' : 'border-slate-200 dark:border-slate-800'} rounded focus:outline-none focus:border-bk-yellow/50 text-[12px] text-slate-900 dark:text-slate-100 font-medium placeholder:text-slate-400 dark:placeholder:text-slate-600`} 
                    placeholder="••••••••" 
                    disabled={loading}
                  />
                  {errors.password && <p className="mt-1 text-[9px] text-rose-500 font-medium tracking-tight whitespace-nowrap">{errors.password}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer - Compressed */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            disabled={loading}
            className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            onClick={onClose}
          >
            Discard
          </button>
          <button 
            disabled={loading}
            className="px-6 py-1.5 bg-bk-yellow hover:bg-[#ffd700] active:scale-[0.98] text-bk-side text-[11px] font-medium tracking-wide rounded border border-bk-yellow/50 shadow-sm transition-all flex items-center justify-center gap-2 min-w-[120px] disabled:opacity-50"
            onClick={handleSubmit}
          >
            {loading ? (
              <div className="w-3 h-3 border-2 border-bk-side/30 border-t-bk-side rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                <span>Connect</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
