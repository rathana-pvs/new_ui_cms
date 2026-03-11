import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { databaseApi } from '../../database/databaseApi';

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
  let totalPage = 0;
  let freePage = 0;
  let pageSize = parseInt(dbSpace.pagesize);
  for (const space of dbSpace.spaceinfo) {
    if (space.type === type) {
      totalPage += parseInt(space.totalpage);
      freePage += parseInt(space.freepage);
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
  const { activeDatabases } = useSelector((state) => state.database);
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchVolumes = useCallback(async () => {
    if (!hostUid || activeDatabases.length === 0) {
      setVolumeData([]);
      return;
    }

    setLoading(true);
    try {
      const allRequest = activeDatabases.map(dbname => 
        databaseApi.getVolumeInfo(hostUid, dbname)
      );

      const responses = await Promise.all(allRequest);
      const tempData = responses.map((res) => {
        const result = res;
        let permanent = { display: '-', pct: 0 };
        let temporary = { display: '-', pct: 0 };
        let activeLog = '-';
        let archiveLog = '-';

        if (result && result.spaceinfo) {
          permanent = getVolumeColumn(result, 'PERMANENT');
          temporary = getVolumeColumn(result, 'TEMPORARY');
          activeLog = getLogColumn(result, 'Active_log');
          archiveLog = getLogColumn(result, 'Archive_log');
        }

        return {
          db: result.dbname,
          permanent,
          temporary,
          activeLog,
          archiveLog,
        };
      });

      setVolumeData(tempData);
    } catch (err) {
      console.error('Failed to fetch volume info:', err);
    } finally {
      setLoading(false);
    }
  }, [hostUid, activeDatabases]);

  useEffect(() => {
    fetchVolumes();
  }, [fetchVolumes]);

  return (
    <details className="group border border-slate-200 dark:border-slate-800 rounded-sm bg-white dark:bg-[#1a1d27] overflow-hidden" open>
      <summary className="flex items-center gap-2 px-4 py-2 cursor-pointer list-none hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors bg-blue-50/50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30 text-sm font-semibold text-slate-800 dark:text-slate-200">
        <span className="material-symbols-outlined text-[16px] text-blue-500 dark:text-blue-400 leading-none transition-transform group-open:rotate-180">expand_more</span>
        <span>Database Volumes</span>
        {loading && (
          <svg className="animate-spin h-3 w-3 text-blue-500 ml-auto" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
      </summary>
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead>
            <tr className="text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-transparent border-b border-slate-100 dark:border-slate-800/50">
              <th className="px-4 py-2 font-medium">Database</th>
              <th className="px-4 py-2 font-medium">Permanent (U/T/F)</th>
              <th className="px-4 py-2 font-medium">Temporary (U/T/F)</th>
              <th className="px-4 py-2 font-medium">Active Log</th>
              <th className="px-4 py-2 font-medium">Archive Log</th>
            </tr>
          </thead>
          <tbody>
            {volumeData.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-400 italic">
                  {loading ? 'Loading volume data...' : 'No active databases found or information unavailable'}
                </td>
              </tr>
            ) : (
              volumeData.map((row, i) => (
                <tr key={i} className="text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white transition-colors">
                  <td className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/30 font-medium">{row.db}</td>
                  <td className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/30">
                    <div className="flex flex-col gap-1 w-full max-w-[160px]">
                      <div className="flex justify-between items-center text-[10px] mb-0.5">
                        <span className="font-mono">{row.permanent.display}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-sm h-1 overflow-hidden">
                        <div className={`h-full rounded-sm transition-all duration-500 ${row.permanent.pct > 80 ? 'bg-red-500' : row.permanent.pct > 60 ? 'bg-amber-500' : 'bg-primary'}`} style={{ width: `${row.permanent.pct}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/30">
                    <div className="flex flex-col gap-1 w-full max-w-[160px]">
                      <div className="flex justify-between items-center text-[10px] mb-0.5">
                        <span className="font-mono">{row.temporary.display}</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700/50 rounded-sm h-1 overflow-hidden">
                        <div className={`h-full rounded-sm transition-all duration-500 ${row.temporary.pct > 80 ? 'bg-red-500' : 'bg-primary'}`} style={{ width: `${row.temporary.pct}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/30 font-mono">{row.activeLog}</td>
                  <td className="px-6 py-3 border-b border-slate-100 dark:border-slate-800/30 font-mono">{row.archiveLog}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </details>
  );
}
