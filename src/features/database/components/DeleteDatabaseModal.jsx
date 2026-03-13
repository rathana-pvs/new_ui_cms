import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeDeleteDBModal, deleteDatabase, fetchDatabaseStartInfo } from '../databaseSlice';
import { showStatusModal } from '../../layout/layoutSlice';
import { databaseApi } from '../databaseApi';
import ModalErrorView from '../../../components/common/ModalErrorView';

export default function DeleteDatabaseModal() {
  const dispatch = useDispatch();
  const { isDeleteDBModalOpen, selectedDatabase } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);

  const [step, setStep] = useState(1); // 1: Info, 2: Password
  const [deleteBackup, setDeleteBackup] = useState(false);
  const [volumeInfo, setVolumeInfo] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [dbId, setDbId] = useState('dba');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isDeleteDBModalOpen && selectedDatabase && selectedHostUid) {
      setStep(1);
      setDbId('dba');
      setPassword('');
      setError(null);
      setLoading(true);
      databaseApi.getVolumeInfo(selectedHostUid, selectedDatabase)
        .then(res => {
          if (res && res.spaceinfo) {
            const pageSize = parseInt(res.pagesize || 0);
            let activeLog = res.spaceinfo.find(s => s.type === 'Active_log');

            const mapRow = (item) => ({
              spacename: item?.name || item?.spacename || '-',
              location: item?.path || item?.location || '-',
              date: item?.date || '-',
              type: item?.type || '-',
              totalpage: item?.totalpage || '-',
              freepage: item?.freepage || '-',
              volumeSizeMB: item?.totalpage ? (((parseInt(item.totalpage) * pageSize) / (1024 * 1024)).toFixed(1)) : '-'
            });

            const newRow = {
              spacename: '\u00A0',
              location: '\u00A0',
              date: '\u00A0',
              type: '\u00A0',
              totalpage: '\u00A0',
              freepage: '\u00A0',
              volumeSizeMB: '\u00A0'
            };

            if (activeLog) {
              setVolumeInfo([mapRow(activeLog), newRow]);
            } else {
              setVolumeInfo([newRow, newRow]);
            }
          }
        })
        .catch(err => {
          console.error('Failed to fetch volume info:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isDeleteDBModalOpen, selectedDatabase, selectedHostUid]);

  const handleConfirmAction = async () => {
    // If we're already showing an error, the primary button is "Try Again"
    if (error) {
      setError(null);
      setPassword('');
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    // Proceed to login even if password is empty (some environments may not have a password)
    setProcessing(true);
    try {
      const loginRes = await databaseApi.loginDatabase(selectedHostUid, selectedDatabase, {
        id: dbId,
        password: password,
      });

      // Handle success
      if (loginRes.success || loginRes.status === 'success' || (!loginRes.error && !loginRes.code)) {
        await dispatch(deleteDatabase({
          hostUid: selectedHostUid,
          dbname: selectedDatabase,
          payload: { delbackup: deleteBackup ? 'y' : 'n' }
        })).unwrap();

        // Successful deletion - show global success modal and close
        dispatch(showStatusModal({
          type: 'success',
          title: 'Success',
          message: `Delete Database - ${selectedDatabase}@${selectedDatabase} has been completed successfully`
        }));

        dispatch(fetchDatabaseStartInfo(selectedHostUid));
        handleClose();
      } else {
        // Handle specific API error format
        throw loginRes;
      }
    } catch (err) {
      setError(err);
    } finally {
      setProcessing(false);
    }
  };

  const handleClose = () => {
    dispatch(closeDeleteDBModal());
  };

  if (!isDeleteDBModalOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-[2px] animate-in fade-in duration-150 p-4">
      <div className={`bg-white dark:bg-bk-side w-full ${step === 1 ? 'max-w-5xl' : (error ? 'max-w-xl' : 'max-w-md')} rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150 transition-all`}>
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500 text-[20px]">delete_forever</span>
            {step === 1 ? 'Delete DB' : (error ? 'Operation Failed' : 'Security Verification')}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Stable Content Area */}
        <div className={`p-6 space-y-6 overflow-y-auto ${step === 1 ? 'min-h-[400px]' : (error ? 'min-h-[300px]' : 'min-h-[250px]')} relative transition-all duration-150`}>

          {step === 1 && (
            <div className="animate-in fade-in duration-150">
              <div className="p-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-100 dark:border-white/5 shadow-inner mb-6">
                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <span className="text-slate-400">Database Name:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{selectedDatabase}</span>
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-[11px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest pl-1">Volume Information of Database</h3>
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-black/20 shadow-sm transition-none">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50/80 dark:bg-white/[0.03] text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                          <th className="px-4 py-3 font-bold border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">Volume Name</th>
                          <th className="px-4 py-3 font-bold border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">Volume Path</th>
                          <th className="px-4 py-3 font-bold border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">Change Date</th>
                          <th className="px-4 py-3 font-bold border-r border-slate-200 dark:border-slate-800 whitespace-nowrap">Volume Type</th>
                          <th className="px-4 py-3 font-bold border-r border-slate-200 dark:border-slate-800 whitespace-nowrap text-right">Total Size (pages)</th>
                          <th className="px-4 py-3 font-bold border-r border-slate-200 dark:border-slate-800 whitespace-nowrap text-right">Remained Size (pages)</th>
                          <th className="px-4 py-3 font-bold whitespace-nowrap text-right">Volume Size (MB)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono text-[10px]">
                        {loading ? (
                          <tr><td colSpan="7" className="px-4 py-10 text-center"><div className="flex flex-col items-center gap-2"><div className="w-6 h-6 border-2 border-bk-yellow/20 border-t-bk-yellow rounded-full animate-spin"></div><span className="text-slate-400 font-sans tracking-wide">Fetching data records...</span></div></td></tr>
                        ) : (
                          volumeInfo.map((vol, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] text-slate-600 dark:text-slate-400 transition-colors">
                              <td className="px-4 py-2.5 border-r border-slate-200 dark:border-slate-800 h-9">{vol.spacename}</td>
                              <td className="px-4 py-2.5 border-r border-slate-200 dark:border-slate-800 h-9 max-w-[200px] truncate" title={vol.location}>{vol.location}</td>
                              <td className="px-4 py-2.5 border-r border-slate-200 dark:border-slate-800 h-9">{vol.date}</td>
                              <td className="px-4 py-2.5 border-r border-slate-200 dark:border-slate-800 h-9">{vol.type}</td>
                              <td className="px-4 py-2.5 border-r border-slate-200 dark:border-slate-800 h-9 text-right">{vol.totalpage}</td>
                              <td className="px-4 py-2.5 border-r border-slate-200 dark:border-slate-800 h-9 text-right">{vol.freepage}</td>
                              <td className="px-4 py-2.5 text-right h-9">{vol.volumeSizeMB}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group select-none mt-6">
                <div className="relative flex items-center">
                  <input type="checkbox" checked={deleteBackup} onChange={(e) => setDeleteBackup(e.target.checked)} className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-slate-300 dark:border-slate-700 rounded-md transition-all peer-checked:bg-rose-500 peer-checked:border-rose-500 group-hover:border-rose-400 shadow-sm"></div>
                  <span className="material-symbols-outlined absolute text-white text-[14px] opacity-0 peer-checked:opacity-100 transition-opacity left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none font-bold">check</span>
                </div>
                <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">Delete Backup Volumes</span>
              </label>
            </div>
          )}

          {step === 2 && !error && !processing && (
            <div className="flex flex-col items-center justify-center py-6 space-y-6 animate-in fade-in duration-150">
              <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 shadow-xl shadow-rose-500/5">
                <span className="material-symbols-outlined text-4xl text-rose-500">lock</span>
              </div>

              <div className="w-full max-w-sm space-y-3">
                <div className="text-center">
                  <h4 className="text-[15px] font-bold text-slate-900 dark:text-white">Security Verification</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Please enter credentials to authorize the deletion of <span className="text-rose-500 font-bold">{selectedDatabase}</span>.</p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">User ID</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 dark:text-slate-600 group-focus-within:text-rose-500 transition-colors">person</span>
                      <input type="text" value={dbId} onChange={(e) => setDbId(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 transition-all text-sm text-slate-900 dark:text-white font-medium" placeholder="dba" />
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest ml-1">DBA Password</label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400 dark:text-slate-600 group-focus-within:text-rose-500 transition-colors">key</span>
                      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleConfirmAction()} className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:border-rose-500/50 focus:ring-4 focus:ring-rose-500/5 transition-all text-sm text-slate-900 dark:text-white" placeholder="••••••••" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && processing && !error && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in duration-150 min-h-[300px]">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-rose-500/10 border-t-rose-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-3xl text-rose-500 animate-pulse">delete_sweep</span>
                </div>
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-[15px] font-bold text-slate-900 dark:text-white tracking-tight">Deleting Database...</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[200px]">
                  Please wait while we securely remove <span className="text-rose-500 font-bold">{selectedDatabase}</span> and its volumes.
                </p>
              </div>
            </div>
          )}

          {error && <ModalErrorView error={error} />}

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-3">
          {step === 2 && !error && (
            <button
              onClick={() => setStep(1)}
              disabled={processing}
              className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all mr-auto"
            >
              Back
            </button>
          )}

          <button
            onClick={handleConfirmAction}
            disabled={processing || loading}
            className={`px-8 py-2.5 rounded-xl text-[11px] font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale flex items-center gap-2 ${error 
                ? 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 shadow-slate-500/10'
                : step === 1
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
              }`}
          >
            {processing && <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>}
            {error ? 'Try Again' : step === 1 ? 'Proceed to Delete' : 'Confirm & Delete'}
          </button>

          {(step === 1 || error) && (
            <button
              onClick={handleClose}
              className="px-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 rounded-xl text-[11px] font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-sans"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
