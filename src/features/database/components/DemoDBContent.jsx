import DBPerformanceSection from './demodb/DBPerformanceSection';
import DBVolumesSection from './demodb/DBVolumesSection';
import DBSpaceInfoSection from './demodb/DBSpaceInfoSection';
import DBBrokersCASSection from './demodb/DBBrokersCASSection';
import DBLockTransactionSection from './demodb/DBLockTransactionSection';

export default function DemoDBContent() {
  const dbStats = [
    { cpu: "12%", cpuPct: 12, memory: "1.2GB", memPct: 15, qps: "150", hitRatio: "99.8%", hitPct: 99.8, fetch: "834", dirty: "12", ioReads: "51", ioWrites: "8" }
  ];

  const volumes = [
    { name: "demodb", type: "SYS", purpose: "PERMANENT", free: "40MB", total: "128MB", freePct: 31.2,  date: "2026-03-10 12:00:00", path: "/home/cubrid/CUBRID/databases/demodb" },
    { name: "demodb_l01", type: "LOG", purpose: "ACTIVE", free: "508MB", total: "512MB", freePct: 99.2, date: "2026-03-10 12:00:00", path: "/home/cubrid/CUBRID/databases/demodb/log" }
  ];

  const spaceInfo = [
    { type: "DATA", fileCount: "1", usedPages: "12", fileTablePages: "1", reservedPages: "512", totalPages: "525" },
    { type: "INDEX", fileCount: "2", usedPages: "4", fileTablePages: "1", reservedPages: "256", totalPages: "261" }
  ];

  const brokersCAS = [
    { broker: "query_editor", id: "1", pid: "19", qps: "8", lqs: "0", status: "READY", lastConn: "2026-03-10 13:40:02" },
    { broker: "broker1", id: "1", pid: "30", qps: "12", lqs: "2", status: "BUSY", lastConn: "2026-03-10 13:41:05" }
  ];

  const locks = [
    { index: "1", user: "dba", host: "localhost", pid: "1192", obj: "tb_user", mode: "X_LOCK" },
    { index: "2", user: "public", host: "192.168.1.5", pid: "1205", obj: "tb_product", mode: "S_LOCK" }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 dark:bg-bk-main font-sans">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-bk-side/50">
        <span className="font-medium text-slate-900 dark:text-bk-yellow tracking-wide flex items-center gap-1.5 font-sans">
          <span className="material-symbols-outlined text-[14px]">database</span>
          Database - demodb@localhost:8001
        </span>
        <button className="ml-auto text-slate-500 opacity-70 hover:text-bk-yellow dark:hover:text-bk-yellow transition-colors" title="Reload View">
          <span className="material-symbols-outlined text-[16px]">refresh</span>
        </button>
      </div>

      <div className="flex flex-col p-4 space-y-4">
        <DBPerformanceSection dbStats={dbStats} />
        <DBVolumesSection volumes={volumes} />
        <DBSpaceInfoSection spaceInfo={spaceInfo} />
        <DBBrokersCASSection brokersCAS={brokersCAS} />
        <DBLockTransactionSection locks={locks} />
      </div>
    </div>
  );
}
