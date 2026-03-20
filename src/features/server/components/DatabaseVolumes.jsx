import { useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDatabaseVolumes } from '../../database/databaseSlice';

const getSizeFormat = (size) => {
  if (size >= 1024 ** 3) {
    return `${(size / 1024 ** 3).toFixed(0)}GB`;
  } else if (size >= 1024 ** 2) {
    return `${(size / 1024 ** 2).toFixed(0)}MB`;
  } else if (size >= 1024) {
    return `${(size / 1024).toFixed(0)}KB`;
  } else {
    return `${size}B`;
  }
};

const getVolumeColumn = (dbSpace, type) => {
  if (!dbSpace || !dbSpace.spaceinfo) return { display: '-', pct: 0 };
  let totalPage = 0;
  let freePage = 0;
  let pageSize = parseInt(dbSpace.pagesize || 0);
  if (pageSize === 0) return { display: '-', pct: 0 };

  for (const space of dbSpace.spaceinfo) {
    if (space.type === type) {
      totalPage += parseInt(space.totalpage || 0);
      freePage += parseInt(space.freepage || 0);
    }
  }
  if (totalPage > 0) {
    const used = (totalPage - freePage) * pageSize;
    const total = totalPage * pageSize;
    const pct = ((freePage * 100) / totalPage).toFixed(0);
    return {
      display: `${getSizeFormat(used)} / ${getSizeFormat(total)} / ${pct}%`,
      pct: 100 - parseInt(pct) // Percentage used
    };
  }
  return { display: '-', pct: 0 };
};

const getLogColumn = (dbSpace, type) => {
  let totalPage = 0;
  let pageSize = parseInt(dbSpace.pagesize);
  for (const space of dbSpace.spaceinfo) {
    if (space.type === type) {
      totalPage += parseInt(space.totalpage);
    }
  }
  if (totalPage > 0) {
    return getSizeFormat(totalPage * pageSize);
  }
  return '-';
};

export default function DatabaseVolumes({ hostUid }) {
  const dispatch = useDispatch();
  const { authorizedHosts } = useSelector((state) => state.host);
  const { activeDatabases, volumes, volumesLoading: loading } = useSelector((state) => state.database);

  const fetchVolumes = useCallback(async () => {
    if (!hostUid || !authorizedHosts.includes(hostUid) || activeDatabases.length === 0) {
      return;
    }
    dispatch(fetchDatabaseVolumes({ hostUid, activeDatabases }));
  }, [hostUid, authorizedHosts, activeDatabases, dispatch]);

  useEffect(() => {
    fetchVolumes();
  }, [fetchVolumes]);
  const volumeData = volumes?.map((result) => {
    let permanent = { display: '-', pct: 0 };
    let temporary = { display: '-', pct: 0 };
    let activeLog = '-';
    let archiveLog = '-';
    let storageFree = '-';

    if (result && result.spaceinfo) {
      permanent = getVolumeColumn(result, 'PERMANENT');
      temporary = getVolumeColumn(result, 'TEMPORARY');
      activeLog = getLogColumn(result, 'Active_log');
      archiveLog = getLogColumn(result, 'Archive_log');
      storageFree = result.freespace ? getSizeFormat(parseInt(result.freespace) * 1024) : '-';
    }

    return {
      db: result.dbname,
      permanent,
      temporary,
      activeLog,
      archiveLog,
      storageFree
    };
  }) || [];

  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-[6px] shadow-sm bg-white dark:bg-bk-side overflow-hidden" open>
      <summary className="flex items-center gap-2 px-3 py-2.5 cursor-pointer list-none hover:bg-slate-50 dark:hover:bg-white/5 transition-colors bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-800 dark:text-slate-200">
        <span className="material-symbols-outlined text-[16px] text-bk-yellow leading-none transition-transform group-open:rotate-180">expand_more</span>
        <span className="material-symbols-outlined text-[16px] text-slate-400">storage</span>
        <span>Database volumes</span>
        {loading && (
          <svg className="animate-spin h-3 w-3 text-bk-yellow ml-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </summary>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-[13px] whitespace-nowrap font-sans">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 bg-slate-50/20 dark:bg-transparent border-b border-slate-200 dark:border-slate-800">
               <th className="px-4 py-3 font-medium text-[11px] tracking-wide">Database</th>
              <th className="px-4 py-3 font-medium text-[11px] tracking-wide">Permanent (U/T/F%)</th>
              <th className="px-4 py-3 font-medium text-[11px] tracking-wide">Temporary (U/T/F%)</th>
              <th className="px-4 py-3 font-medium text-[11px] tracking-wide">Active Log</th>
              <th className="px-4 py-3 font-medium text-[11px] tracking-wide">Archive Log</th>
              <th className="px-4 py-3 font-medium text-[11px] tracking-wide">Storage Free</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {volumeData.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-4 py-8 text-center text-slate-400 italic">
                  {loading ? 'Loading volume data...' : 'No active databases found or information unavailable'}
                </td>
              </tr>
            ) : (
              volumeData.map((row, i) => (
                <tr key={i} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-slate-800">
                  <td className="px-4 py-3 font-sans font-medium">{row.db}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 w-full max-w-[160px]">
                      <div className="flex justify-between items-center text-[11px] mb-0.5">
                        <span className="font-mono opacity-80">{row.permanent.display}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${row.permanent.pct > 80 ? 'bg-rose-500' : row.permanent.pct > 60 ? 'bg-amber-500' : 'bg-bk-yellow'}`} style={{ width: `${row.permanent.pct}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1 w-full max-w-[160px]">
                      <div className="flex justify-between items-center text-[11px] mb-0.5">
                        <span className="font-mono opacity-80">{row.temporary.display}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-full h-1 overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${row.temporary.pct > 80 ? 'bg-rose-500' : 'bg-bk-yellow'}`} style={{ width: `${row.temporary.pct}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.activeLog}</td>
                  <td className="px-4 py-3">{row.archiveLog}</td>
                  <td className="px-4 py-3 opacity-80">{row.storageFree}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </details>

  );
}
