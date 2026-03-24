import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchBrokerList } from '../../broker/brokerSlice';
import { openTab } from '../../layout/layoutSlice';
import { Card } from '../../../components/ds/layout/Card';
import { Table } from '../../../components/ds/layout/Table';
import { Icon } from '../../../components/ds/foundation/Icon';
import { Spinner } from '../../../components/ds/foundation/Spinner';

export default function Brokers({ hostUid }) {
  const dispatch = useDispatch();
  const { brokers, loading } = useSelector((state) => state.broker);
  const { authorizedHosts } = useSelector((state) => state.host);

  useEffect(() => {
    if (hostUid && authorizedHosts.includes(hostUid)) {
      dispatch(fetchBrokerList(hostUid));
    }
  }, [hostUid, authorizedHosts, dispatch]);

  const columns = [
    { header: 'Name', accessor: 'name', className: 'font-bold text-slate-900 dark:text-slate-100' },
    { 
      header: 'Status', 
      accessor: 'state',
      render: (val) => (
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border
          ${val === 'ON' 
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' 
            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
          <span className={`size-1.5 rounded-full ${val === 'ON' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
          {val}
        </span>
      )
    },
    { header: 'PID', accessor: 'pid' },
    { header: 'Port', accessor: 'port' },
    { header: 'AS', accessor: 'as' },
    { header: 'JQ', accessor: 'jq' },
    { header: 'REQ', accessor: 'req' },
    { header: 'TPS', accessor: 'tps' },
    { header: 'QPS', accessor: 'qps' },
    { 
      header: 'Long-T', 
      accessor: 'long_tran',
      render: (_, row) => `${row.long_tran || '0'} / ${parseFloat(row.long_tran_time || 0) * 1000}`
    },
    { 
      header: 'Long-Q', 
      accessor: 'long_query',
      render: (_, row) => `${row.long_query || '0'} / ${parseFloat(row.long_query_time || 0) * 1000}`
    },
    { header: 'Err-Q', accessor: 'error_query' }
  ];

  const cardTitle = (
    <div className="flex items-center gap-2">
      <Icon name="hub" size="sm" className="text-bk-yellow" weight={300} />
      <span>Brokers</span>
      {loading && <Spinner size="xs" className="ml-2" />}
    </div>
  );

  return (
    <Card 
      title={cardTitle} 
      className="bg-white dark:bg-bk-side" 
      bodyClassName="p-0"
    >
      <Table 
        columns={columns} 
        data={brokers} 
        loading={loading}
        onRowClick={(row) => dispatch(openTab(`broker_status:${hostUid}:${row.name}`))}
        className="font-mono text-[12px]"
      />
    </Card>
  );
}
