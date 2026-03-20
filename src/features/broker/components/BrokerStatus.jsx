import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchDetailedBrokerStatus } from '../brokerSlice';

// Import New Design System Components
import Card from '../../../components/ui/Layout/Card';
import Table from '../../../components/ui/Layout/Table';
import Button from '../../../components/ui/Foundation/Button';
import Typography from '../../../components/ui/Foundation/Typography';
import Icon from '../../../components/ui/Foundation/Icon';
import Alert from '../../../components/ui/Feedback/Alert';

export default function BrokerStatus({ hostUid, brokerName }) {
  const dispatch = useDispatch();
  const { detailedStatus } = useSelector((state) => state.broker);
  const status = detailedStatus[brokerName] || { data: {}, loading: false, error: null };

  const [collapsed, setCollapsed] = useState({ basic: false, as: false, job: false });

  const toggleSection = (section) => setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));

  useEffect(() => {
    if (hostUid && brokerName) dispatch(fetchDetailedBrokerStatus({ hostUid, brokerName }));
  }, [hostUid, brokerName, dispatch]);

  if (status.loading && !status.data?.asinfo) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 bg-background animate-in fade-in">
        <Icon name="sync" className="text-4xl text-primary animate-spin mb-4" />
        <Typography variant="caption" className="font-black uppercase tracking-[0.3em] opacity-30">Hydrating Telemetry...</Typography>
      </div>
    );
  }

  if (status.error) {
    return (
      <div className="flex-1 p-8 bg-background animate-in fade-in">
        <Alert variant="error" title="Telemetry Isolation Failure" icon="report" className="max-w-2xl mx-auto">
          {status.error}
        </Alert>
      </div>
    );
  }

  const asInfo = status.data?.asinfo || [];
  const jobInfo = status.data?.jobinfo || [];
  const basicInfo = status.data?.binfo?.[0] || {};

  const basicColumns = [
    { key: 'pid', title: 'PID', className: 'font-mono text-primary font-bold' },
    { key: 'port', title: 'Port', className: 'font-mono' },
    { key: 'job_queue', title: 'Queue', className: 'font-mono' },
    { key: 'auto_add_as', title: 'Auto AS', className: 'font-mono' },
    { 
      key: 'sql_log_mode', title: 'SQL Log', 
      render: (val) => <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black ${val === 'ON' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-muted/10 text-foreground/40'}`}>{val || 'OFF'}</span>
    },
    { key: 'long_transaction_time', title: 'L.Trans', render: (val) => `${val || 0}s` },
    { key: 'long_query_time', title: 'L.Query', render: (val) => `${val || 0}s` },
  ];

  const asColumns = [
    { key: 'as_id', title: 'ID', className: 'font-black text-secondary' },
    { key: 'as_pid', title: 'PID', className: 'font-mono opacity-60' },
    { key: 'as_num_query', title: 'QPS', className: 'font-mono font-bold' },
    { key: 'as_num_tran', title: 'TPS', className: 'font-mono' },
    { key: 'as_port', title: 'Port', className: 'font-mono opacity-60' },
    { key: 'as_psize', title: 'Size', render: (val) => `${(parseInt(val) / 1024).toFixed(1)}KB` },
    { 
      key: 'as_status', title: 'Status',
      render: (val) => <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-widest ${val === 'IDLE' ? 'bg-muted/10 text-foreground/40' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>{val}</span>
    },
    { key: 'as_dbname', title: 'Database', className: 'font-black text-primary' },
    { key: 'as_last_access_time', title: 'Last Access', className: 'text-[10px] opacity-40' },
    { key: 'as_client_ip', title: 'Client IP', className: 'text-[10px] opacity-40' },
  ];

  const jobColumns = [
    { key: 'job_id', title: 'Job ID', className: 'font-mono' },
    { key: 'job_priority', title: 'Priority', className: 'font-mono' },
    { key: 'job_ip', title: 'Client IP', className: 'font-bold text-secondary' },
    { key: 'job_time', title: 'Elapsed', render: (val) => <span className="text-rose-500 font-mono font-bold">{val}s</span> },
    { key: 'job_request', title: 'Request Context', className: 'opacity-50 max-w-xs truncate' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-background custom-scrollbar">
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <Icon name="hub" className="text-primary" />
           </div>
           <div>
              <Typography variant="h3" className="uppercase tracking-widest text-[14px]">Broker Telemetry</Typography>
              <Typography variant="caption" className="font-bold opacity-40">{brokerName} @ {hostUid}</Typography>
           </div>
        </div>
        <Button variant="ghost" size="sm" icon="refresh" onClick={() => dispatch(fetchDetailedBrokerStatus({ hostUid, brokerName }))} loading={status.loading}>Refresh</Button>
      </div>

      <div className="p-8 space-y-10 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4">
        {/* Basic Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-primary/60">Node Integrity</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
          </div>
          <Card className="overflow-hidden border-border/50 shadow-sm">
             <Table columns={basicColumns} data={[basicInfo]} hideHeader={false} />
          </Card>
        </section>

        {/* AS Info */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-secondary/60">Application Runtime</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
             <Typography variant="caption" className="bg-secondary/10 text-secondary px-2 py-0.5 rounded-lg font-black text-[10px]">{asInfo.length} ACTIVE</Typography>
          </div>
          <Card className="overflow-hidden border-border/50 shadow-sm">
             <Table columns={asColumns} data={asInfo} emptyMessage="No application servers currently synchronized." />
          </Card>
        </section>

        {/* Job Queue */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
             <Typography variant="caption" className="font-black uppercase tracking-[0.2em] text-foreground/20">Job Manifest</Typography>
             <div className="flex-1 h-[1px] bg-border/50"></div>
             <Typography variant="caption" className="bg-muted px-2 py-0.5 rounded-lg font-black text-[10px]">{jobInfo.length} QUEUED</Typography>
          </div>
          <Card className="overflow-hidden border-border/50 shadow-sm">
             <Table columns={jobColumns} data={jobInfo} emptyMessage="Job pipeline is currently clear." />
          </Card>
        </section>
      </div>
    </div>
  );
}
