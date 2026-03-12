import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { editHost, closeEditHostModal } from '../hostSlice';

export default function EditHostModal() {
  const dispatch = useDispatch();
  const { isEditHostModalOpen, hostToEditUid, hosts, loading, error: apiError } = useSelector((state) => state.host);

  const [formData, setFormData] = useState({
    id: '',
    address: '',
    port: '8001',
    password: '',
    alias: '',
  });
  const [errors, setErrors] = useState({});

  // Find the host details based on the selected hostToEditUid to prepopulate the form
  useEffect(() => {
    if (isEditHostModalOpen && hostToEditUid) {
      const hostToEdit = hosts.find((h) => h.uid === hostToEditUid);
      if (hostToEdit) {
        setFormData({
          id: hostToEdit.id || '',
          address: hostToEdit.address || '',
          port: hostToEdit.port ? String(hostToEdit.port) : '8001',
          password: '', // Should be empty by default, only provide if changing
          alias: hostToEdit.alias || '',
        });
      }
      setErrors({});
    }
  }, [isEditHostModalOpen, hostToEditUid, hosts]);

  if (!isEditHostModalOpen) return null;

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
    // Password might be optional on edit depending on backend, let's assume it's required if they are changing credentials, 
    // but if not required, you could skip this. Assuming required for now as it's typically required to perform this action.
    // if (!formData.password) errs.password = 'Password is required to confirm changes';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    
    // Construct payload. Include password only if provided
    const payload = {
      id: formData.id,
      address: formData.address,
      port: Number(formData.port),
      alias: formData.alias,
    };
    
    if (formData.password) {
      payload.password = formData.password;
    }
    
    // Dispatch editHost thunk
    dispatch(editHost({ hostUid: hostToEditUid, payload }));
  };
  
  const handleClose = () => {
    dispatch(closeEditHostModal());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#1e2230] w-full max-w-lg rounded shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
        
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-[110] flex items-center justify-center bg-white/80 dark:bg-[#1e2230]/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-orange-500/20 border-t-orange-500 rounded-full animate-spin"></div>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">Saving Changes...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-[#1e2230] flex-shrink-0">
          <h3 className="text-[13px] font-normal text-slate-900 dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500 text-[18px]">edit_square</span>
            Edit Host Configuration
          </h3>
          <button 
            disabled={loading}
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-400 dark:text-slate-500"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        {/* Body */}
        <div className="p-4 space-y-4 bg-white dark:bg-[#1e2230]">
          {apiError && (
            <div className="flex items-center gap-2 px-3 py-2 text-[12px] text-rose-500 bg-rose-500/5 border border-rose-500/10 rounded-lg font-normal">
              <span className="material-symbols-outlined text-[16px]">error</span>
              {apiError}
            </div>
          )}

          {/* Connection Details Section */}
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl p-3 pt-4">
            <div className="absolute top-0 -translate-y-[55%] left-4 px-2 bg-white dark:bg-[#1e2230]">
              <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-none">
                Connection Details
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <label className="w-32 shrink-0 text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">Host Name :</label>
                <div className="flex-1">
                  <input 
                    type="text" 
                    name="alias"
                    value={formData.alias}
                    onChange={handleChange}
                    className={`w-full h-8 px-2 bg-white dark:bg-[#1a1d27] border ${errors.alias ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-normal`} 
                    placeholder="e.g. Production DB" 
                    disabled={loading}
                  />
                  {errors.alias && <p className="mt-0.5 text-[10px] text-rose-500">{errors.alias}</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="w-32 shrink-0 text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">Address / Port :</label>
                <div className="flex-1 flex gap-2">
                  <div className="flex-[2]">
                    <input 
                      type="text" 
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full h-8 px-2 bg-white dark:bg-[#1a1d27] border ${errors.address ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-normal`} 
                      placeholder="IP or Hostname" 
                      disabled={loading}
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="text" 
                      name="port"
                      value={formData.port}
                      onChange={handleChange}
                      className={`w-full h-8 px-2 bg-white dark:bg-[#1a1d27] border ${errors.port ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-normal`} 
                      placeholder="8001" 
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
              {(errors.address || errors.port) && (
                <div className="flex gap-2 pl-36">
                  <div className="flex-[2]">{errors.address && <p className="text-[10px] text-rose-500">{errors.address}</p>}</div>
                  <div className="flex-1">{errors.port && <p className="text-[10px] text-rose-500">{errors.port}</p>}</div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <label className="w-32 shrink-0 text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left">User :</label>
                <div className="flex-1">
                  <input 
                    type="text" 
                    name="id"
                    value={formData.id}
                    onChange={handleChange}
                    className={`w-full h-8 px-2 bg-white dark:bg-[#1a1d27] border ${errors.id ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-normal`} 
                    placeholder="e.g. admin" 
                    disabled={loading}
                  />
                  {errors.id && <p className="mt-0.5 text-[10px] text-rose-500">{errors.id}</p>}
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <label className="w-32 shrink-0 text-[11px] font-normal text-slate-500 dark:text-slate-400 text-left leading-tight">New Password :<br/><span className="text-[9px] text-slate-400 font-normal italic">(Optional)</span></label>
                <div className="flex-1">
                  <input 
                    type="password" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full h-8 px-2 bg-white dark:bg-[#1a1d27] border ${errors.password ? 'border-rose-500' : 'border-slate-200 dark:border-slate-700'} rounded-lg focus:outline-none focus:border-orange-500/50 focus:ring-4 focus:ring-orange-500/5 text-[12px] text-slate-900 dark:text-slate-100 transition-all font-normal`} 
                    placeholder="••••••••" 
                    disabled={loading}
                  />
                  {errors.password && <p className="mt-0.5 text-[10px] text-rose-500">{errors.password}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-2 bg-slate-50 dark:bg-[#1e2230] flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          <button 
            disabled={loading}
            className="px-6 py-1.5 text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded border border-slate-200 dark:border-slate-700 transition-all font-normal"
            onClick={handleClose}
          >
            Cancel
          </button>
          <button 
            disabled={loading}
            className="px-6 py-1.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs rounded shadow transition-all flex items-center justify-center gap-2 min-w-[120px] font-normal disabled:opacity-50"
            onClick={handleSubmit}
          >
            {loading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-sm">save_as</span>
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
