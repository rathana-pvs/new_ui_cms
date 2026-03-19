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
    if (error) {
      setError(null);
      setPassword('');
      return;
    }

    if (step === 1) {
      setStep(2);
      return;
    }

    setProcessing(true);
    try {
      const loginRes = await databaseApi.loginDatabase(selectedHostUid, selectedDatabase, {
        id: dbId,
        password: password,
      });

      if (loginRes.success || loginRes.status === 'success' || (!loginRes.error && !loginRes.code)) {
        await dispatch(deleteDatabase({
          hostUid: selectedHostUid,
          dbname: selectedDatabase,
          payload: { delbackup: deleteBackup ? 'y' : 'n' }
        })).unwrap();

        dispatch(showStatusModal({
          type: 'success',
          title: 'Success',
          message: `Delete Database - ${selectedDatabase}@${selectedDatabase} has been completed successfully`
        }));

        dispatch(fetchDatabaseStartInfo(selectedHostUid));
        handleClose();
      } else {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-bk-main/40 backdrop-blur-sm animate-in fade-in duration-200 font-sans text-left">
      <div className={`bg-white dark:bg-bk-side w-full ${step === 1 ? 'max-w-5xl' : (error ? 'max-w-[480px]' : 'max-w-[400px]')} rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col relative text-left transition-all`}>
        
        {/* Subtle Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-rose-500/60"></div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-bk-main/50 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
              <span className="material-symbols-outlined text-rose-500 text-xl">delete_forever</span>
            </div>
            <div>
              <h3 className="text-[12px] font-medium text-slate-900 dark:text-white leading-none tracking-wide">
                {step === 1 ? 'Delete database' : (error ? 'Operation failed' : 'Security verification')}
              </h3>
            </div>
          </div>
          <button 
            disabled={processing}
            onClick={handleClose}
            className="w-7 h-7 rounded-md hover:bg-slate-200 dark:hover:bg-white/5 transition-all text-slate-400 dark:text-slate-500 flex items-center justify-center group"
          >
            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform">close</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-200">
               <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500 uppercase">Target information</span>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Database identifier</label>
                  <div className="w-full h-9 px-3 flex items-center bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded text-[12px] font-medium text-slate-700 dark:text-slate-200">
                    {selectedDatabase}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium tracking-wide text-slate-400 dark:text-slate-500 uppercase">Volume information</span>
                  <div className="flex-1 h-[1px] bg-slate-100 dark:bg-slate-800/50"></div>
                </div>
                
                <div className="border border-slate-100 dark:border-white/5 rounded-lg overflow-hidden bg-white dark:bg-bk-main/10 shadow-sm">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left text-[11px] border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-50/80 dark:bg-bk-main/50 text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-white/5">
                          <th className="px-4 py-2.5 font-medium border-r border-slate-100 dark:border-white/5 whitespace-nowrap">Volume Name</th>
                          <th className="px-4 py-2.5 font-medium border-r border-slate-100 dark:border-white/5 whitespace-nowrap">Volume Path</th>
                          <th className="px-4 py-2.5 font-medium border-r border-slate-100 dark:border-white/5 whitespace-nowrap">Change Date</th>
                          <th className="px-4 py-2.5 font-medium border-r border-slate-100 dark:border-white/5 whitespace-nowrap">Volume Type</th>
                          <th className="px-4 py-2.5 font-medium border-r border-slate-100 dark:border-white/5 whitespace-nowrap text-right">Total Pages</th>
                          <th className="px-4 py-2.5 font-medium border-r border-slate-100 dark:border-white/5 whitespace-nowrap text-right">Free Pages</th>
                          <th className="px-4 py-2.5 font-medium whitespace-nowrap text-right font-sans">Size (MB)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50 dark:divide-white/5 font-mono text-[10px]">
                        {loading ? (
                          <tr><td colSpan="7" className="px-4 py-8 text-center text-slate-400">Loading volumes...</td></tr>
                        ) : (
                          volumeInfo.map((vol, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] text-slate-600 dark:text-slate-400 transition-colors">
                              <td className="px-4 py-2 border-r border-slate-100 dark:border-white/5">{vol.spacename}</td>
                              <td className="px-4 py-2 border-r border-slate-100 dark:border-white/5 truncate max-w-[200px]" title={vol.location}>{vol.location}</td>
                              <td className="px-4 py-2 border-r border-slate-100 dark:border-white/5">{vol.date}</td>
                              <td className="px-4 py-2 border-r border-slate-100 dark:border-white/5">{vol.type}</td>
                              <td className="px-4 py-2 border-r border-slate-100 dark:border-white/5 text-right">{vol.totalpage}</td>
                              <td className="px-4 py-2 border-r border-slate-100 dark:border-white/5 text-right">{vol.freepage}</td>
                              <td className="px-4 py-2 text-right">{vol.volumeSizeMB}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-3 p-3 bg-slate-50/50 dark:bg-bk-main/20 border border-slate-100 dark:border-white/5 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-all group active:scale-[0.99]">
                <input 
                  type="checkbox" 
                  checked={deleteBackup}
                  onChange={(e) => setDeleteBackup(e.target.checked)}
                  className="w-4 h-4 cursor-pointer rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-bk-main text-rose-500 focus:ring-rose-500/50 accent-rose-500 transition-all"
                />
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-rose-500 transition-colors tracking-tight">Delete backup volumes</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Remove all backup data associated with this database</span>
                </div>
              </label>
            </div>
          )}

          {step === 2 && !error && !processing && (
            <div className="flex flex-col items-center justify-center py-4 space-y-6 animate-in fade-in duration-200">
              <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20 shadow-xl shadow-rose-500/5">
                <span className="material-symbols-outlined text-3xl text-rose-500">lock</span>
              </div>

              <div className="w-full space-y-5">
                <div className="text-center">
                  <h4 className="text-[13px] font-medium text-slate-900 dark:text-white">Authorization required</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Please enter database credentials to confirm removal of <span className="text-rose-500 font-bold">{selectedDatabase}</span>.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Administrator username</label>
                    <input 
                      type="text" 
                      value={dbId} 
                      onChange={(e) => setDbId(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-50/50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-rose-500/50 transition-all text-[12px] text-slate-900 dark:text-white font-medium" 
                      placeholder="dba" 
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-medium text-slate-500 dark:text-slate-400 ml-0.5">Password</label>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      onKeyDown={(e) => e.key === 'Enter' && handleConfirmAction()}
                      className="w-full h-9 px-3 bg-slate-50/50 dark:bg-bk-main/30 border border-slate-200 dark:border-slate-800 rounded outline-none focus:border-rose-500/50 transition-all text-[12px] text-slate-900 dark:text-white font-medium" 
                      placeholder="••••••••" 
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && processing && !error && (
            <div className="flex flex-col items-center justify-center py-12 space-y-5 animate-in fade-in duration-200 min-h-[250px]">
              <div className="relative">
                <div className="w-20 h-20 border-[3px] border-rose-500/10 border-t-rose-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-2xl text-rose-500 animate-pulse">delete_sweep</span>
                </div>
              </div>
              <div className="text-center space-y-1.5 text-sans">
                <h4 className="text-[13px] font-medium text-slate-900 dark:text-white">Deleting database...</h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Removing volumes and data assets</p>
              </div>
            </div>
          )}

          {error && <div className="animate-in fade-in duration-200"><ModalErrorView error={error} /></div>}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-bk-main/80 backdrop-blur-sm flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 flex-shrink-0">
          {step === 2 && !error && !processing && (
            <button
              onClick={() => setStep(1)}
              className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-bk-yellow border border-bk-yellow/30 rounded hover:bg-bk-yellow/5 transition-all mr-auto"
            >
              Back
            </button>
          )}

          <button 
            disabled={processing || loading}
            className={`px-6 py-1.5 ${error ? 'bg-slate-800 hover:bg-slate-900' : (step === 1 ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600')} active:scale-[0.98] text-white text-[11px] font-medium tracking-wide rounded shadow-sm transition-all flex items-center justify-center gap-2 min-w-[130px] disabled:opacity-50`}
            onClick={handleConfirmAction}
          >
            {processing ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">{error ? 'refresh' : (step === 1 ? 'arrow_forward' : 'check_circle')}</span>
                <span>{error ? 'Try again' : (step === 1 ? 'Proceed' : 'Delete database')}</span>
              </>
            )}
          </button>

          {(step === 1 || error) && (
            <button 
              className="px-5 py-1.5 text-[11px] font-medium tracking-wide text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700/50 rounded hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              onClick={handleClose}
            >
              Discard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
