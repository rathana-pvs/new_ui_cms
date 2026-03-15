import { useDispatch, useSelector } from 'react-redux';
import { DropdownMenu, SubMenu, MenuItem, MenuDivider } from '../../../components/common/DropdownMenu';
import { openTab, showStatusModal } from '../layoutSlice';
import { openAddHostModal, openEditHostModal, startService, stopService, openServerVersionModal, openImportExportModal } from '../../host/hostSlice';
import { startDatabase, stopDatabase, openOptimizeDatabaseModal } from '../../database/databaseSlice';
import { startBroker, stopBroker } from '../../broker/brokerSlice';
import { setAboutCubrid } from '../appBarSlice';

export default function HeaderMenu() {
  const dispatch = useDispatch();
  const { hosts, selectedHostUid } = useSelector((state) => state.host);
  const { selectedDatabase, activeDatabases } = useSelector((state) => state.database);
  const { brokers, selectedBroker } = useSelector((state) => state.broker);

  const handleExport = () => {
    dispatch(openImportExportModal('export'));
  };

  const handleImport = () => {
    dispatch(openImportExportModal('import'));
  };

  return (
    <nav className="flex items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400 font-sans">
      <DropdownMenu label="File">
        <MenuItem
          icon="add_box"
          label="Add Host"
          onClick={() => dispatch(openAddHostModal())}
        />
        <MenuItem
          icon="edit"
          label="Change Host"
          disabled={!selectedHostUid}
          onClick={() => dispatch(openEditHostModal(selectedHostUid))}
        />
        <MenuItem
          icon="file_upload"
          label="Export Host"
          onClick={handleExport}
        />
        <MenuItem
          icon="file_download"
          label="Import Host"
          onClick={handleImport}
        />
      </DropdownMenu>

      <DropdownMenu label="Tool" width="w-48">
        <MenuItem
          icon="play_arrow"
          label="Start Service"
          disabled={!selectedHostUid}
          onClick={() => dispatch(startService(selectedHostUid))}
        />
        <MenuItem
          icon="stop"
          label="Stop Service"
          disabled={!selectedHostUid}
          onClick={() => dispatch(stopService(selectedHostUid))}
        />
        <MenuDivider />
        <MenuItem
          icon="database"
          label="Start Database"
          disabled={!selectedDatabase || activeDatabases.includes(selectedDatabase)}
          onClick={() => {
            dispatch(startDatabase({ hostUid: selectedHostUid, dbname: selectedDatabase }))
              .unwrap()
              .then(() => {
                dispatch(fetchDatabaseStartInfo(selectedHostUid));
              })
              .catch((err) => {
                dispatch(showStatusModal({ type: 'error', title: 'Action Failed', message: err }));
              });
          }}
        />
        <MenuItem
          icon="database_off"
          label="Stop Database"
          disabled={!selectedDatabase || !activeDatabases.includes(selectedDatabase)}
          onClick={() => {
            dispatch(stopDatabase({ hostUid: selectedHostUid, dbname: selectedDatabase }))
              .unwrap()
              .then(() => {
                dispatch(fetchDatabaseStartInfo(selectedHostUid));
              })
              .catch((err) => {
                dispatch(showStatusModal({ type: 'error', title: 'Action Failed', message: err }));
              });
          }}
        />
        <MenuItem
          icon="auto_fix_high"
          label="Optimize Database"
          disabled={!selectedDatabase}
          onClick={() => dispatch(openOptimizeDatabaseModal())}
        />
        <MenuDivider />
        <MenuItem
          icon="hub"
          label="Start Broker"
          disabled={!selectedBroker || brokers.find(b => b.name === selectedBroker)?.state === 'ON'}
          onClick={() => {
            dispatch(startBroker({ hostUid: selectedHostUid, brokerName: selectedBroker }))
              .unwrap()
              .then(() => {
                dispatch(fetchBrokerList(selectedHostUid));
              })
              .catch((err) => {
                dispatch(showStatusModal({ type: 'error', title: 'Action Failed', message: err }));
              });
          }}
        />
        <MenuItem
          icon="hub"
          label="Stop Broker"
          disabled={!selectedBroker || brokers.find(b => b.name === selectedBroker)?.state !== 'ON'}
          onClick={() => {
            dispatch(stopBroker({ hostUid: selectedHostUid, brokerName: selectedBroker }))
              .unwrap()
              .then(() => {
                dispatch(fetchBrokerList(selectedHostUid));
              })
              .catch((err) => {
                dispatch(showStatusModal({ type: 'error', title: 'Action Failed', message: err }));
              });
          }}
        />
      </DropdownMenu>

      <DropdownMenu label="Action" width="w-48">
        <MenuItem icon="tune" label="Properties" href="#" />
        <SubMenu icon="settings" label="Config Param" width="w-56" gap="ml-3">
          <MenuItem
            icon="edit_document"
            label="Edit Cubrid Config"
            onClick={() => {
              if (selectedHostUid) {
                dispatch(openTab(`edit_config:${selectedHostUid}:cubridconf`));
              } else {
                dispatch(showStatusModal({ type: 'info', title: 'No host selected', message: 'Please select a host from the sidebar first.' }));
              }
            }}
          />
          <MenuItem
            icon="edit_note"
            label="Edit Broker Config"
            onClick={() => {
              if (selectedHostUid) {
                dispatch(openTab(`broker_config:${selectedHostUid}`));
              } else {
                dispatch(showStatusModal({ type: 'info', title: 'No host selected', message: 'Please select a host from the sidebar first.' }));
              }
            }}
          />
          <MenuItem
            icon="manage_accounts"
            label="Edit CM Config"
            onClick={() => {
              if (selectedHostUid) {
                dispatch(openTab(`edit_config:${selectedHostUid}:cmconf`));
              } else {
                dispatch(showStatusModal({ type: 'info', title: 'No host selected', message: 'Please select a host from the sidebar first.' }));
              }
            }}
          />
        </SubMenu>
      </DropdownMenu>

      <DropdownMenu label="Help" width="w-56">
        <MenuItem
          icon="help"
          label="Help"
          onClick={() => window.open('https://www.cubrid.org/', '_blank')}
        />
        <MenuItem
          icon="bug_report"
          label="Report Bug"
          onClick={() => window.open('http://jira.cubrid.org/secure/Dashboard.jspa', '_blank')}
        />
        <MenuItem
          icon="forum"
          label="CUBRID Online Forum"
          onClick={() => window.open('https://www.reddit.com/r/CUBRID/', '_blank')}
        />
        <MenuItem
          icon="code"
          label="CUBRID tools developments"
          onClick={() => window.open('https://github.com/CUBRID/cubrid-manager', '_blank')}
        />
        <MenuDivider />
        <MenuItem
          icon="update"
          label="Check for Updates"
          disabled={true}
          onClick={() => {}}
        />
        <MenuItem
          icon="info"
          label="Server Version"
          disabled={!selectedHostUid}
          onClick={() => dispatch(openServerVersionModal(selectedHostUid))}
        />
        <MenuItem
          icon="admin_panel_settings"
          label="About CUBRID Admin"
          onClick={() => dispatch(setAboutCubrid(true))}
        />
      </DropdownMenu>
    </nav>
  );
}
