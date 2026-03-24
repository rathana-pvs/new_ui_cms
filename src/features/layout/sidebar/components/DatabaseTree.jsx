import { useDispatch, useSelector } from 'react-redux';
import { 
  setSelectedDatabase, 
  setSelectedDatabaseSubItem, 
  fetchBackupSchedule, 
  fetchQueryPlan,
  openLoginDatabaseModal,
  loginDatabase,
  fetchDatabaseSpaceInfo
} from '../../../database/databaseSlice';
import { fetchDatabaseUsers } from '../../../user/userSlice';
import { setActiveMainTab } from '../../layoutSlice';
import { TreeNode } from '../../../../components/domain/tree/TreeNode';
import { Skeleton } from '../../../../components/ds/layout/Skeleton';
import { Icon } from '../../../../components/ds/foundation/Icon';
import { Typography } from '../../../../components/ds/foundation/Typography';
import { Spinner } from '../../../../components/ds/foundation/Spinner';

export default function DatabaseTree({ 
  onContextMenu, 
  onRootContextMenu, 
  onUsersContextMenu, 
  onUserContextMenu, 
  onBackupPlanContextMenu, 
  onSpaceContextMenu, 
  onQueryPlanContextMenu,
  onJobAutomationContextMenu,
  onBackupItemContextMenu
}) {
  const dispatch = useDispatch();
  const { 
    databases, 
    activeDatabases, 
    loading, 
    selectedDatabase, 
    selectedDatabaseSubItem,
    backupSchedules,
    backupSchedulesLoading,
    queryPlans,
    queryPlansLoading,
    loggedInDatabases,
    spaceInfo,
    spaceInfoLoading
  } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  const { databaseUsers, databaseUsersLoading } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-5 animate-in fade-in duration-500">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
               <Skeleton variant="circular" width="16px" height="16px" className="opacity-40" />
               <Skeleton variant="text" width="85%" height="18px" className="rounded-md" />
            </div>
            <div className="flex items-center gap-2 ml-6 opacity-30">
               <Skeleton variant="text" width="60%" height="14px" className="rounded-md" />
            </div>
          </div>
        ))}
        <div className="flex items-center justify-center py-6 gap-3">
          <Spinner size="xs" color="bk-yellow" />
          <Typography variant="caption" className="text-slate-500 font-bold uppercase tracking-[0.2em] text-[9px] opacity-60">Initializing Engine...</Typography>
        </div>
      </div>
    );
  }

  if (!databases || databases.length === 0) {
    return (
      <div className="px-6 py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-40 animate-in zoom-in-95 duration-500">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-2">
          <Icon name="database" size="md" className="text-slate-400" weight={300} />
        </div>
        <Typography variant="caption" className="text-slate-500 font-black uppercase tracking-widest text-[10px]">
          No databases found
        </Typography>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 px-2 py-2" onContextMenu={(e) => onRootContextMenu(e)}>
      {databases.map((db) => {
        const isActive = activeDatabases.includes(db.dbname);
        const isLoggedIn = loggedInDatabases.includes(db.dbname);
        const isDbSelected = db.dbname === selectedDatabase && !selectedDatabaseSubItem;

        return (
          <TreeNode
            key={db.dbname}
            id={db.dbname}
            label={db.dbname}
            icon="database"
            level={1}
            isActive={isDbSelected}
            hasChildren={true}
            status={isActive ? 'on' : 'off'}
            onToggle={() => {
              if (isActive) {
                if (!isLoggedIn) {
                  if (db.isProfileExists) {
                    dispatch(loginDatabase({ hostUid: selectedHostUid, dbname: db.dbname })).unwrap()
                      .then(() => {
                        dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname: db.dbname }));
                        dispatch(fetchBackupSchedule({ hostUid: selectedHostUid, dbname: db.dbname }));
                        dispatch(fetchQueryPlan({ hostUid: selectedHostUid, dbname: db.dbname }));
                      });
                  } else {
                    dispatch(openLoginDatabaseModal(db.dbname));
                  }
                } else {
                  if (!databaseUsers[db.dbname] && !databaseUsersLoading[db.dbname]) {
                    dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname: db.dbname }));
                  }
                  if (!backupSchedules[db.dbname] && !backupSchedulesLoading[db.dbname]) {
                    dispatch(fetchBackupSchedule({ hostUid: selectedHostUid, dbname: db.dbname }));
                  }
                  if (!queryPlans[db.dbname] && !queryPlansLoading[db.dbname]) {
                    dispatch(fetchQueryPlan({ hostUid: selectedHostUid, dbname: db.dbname }));
                  }
                }
              }
            }}
            onSelect={() => {
              dispatch(setSelectedDatabase(db.dbname));
              dispatch(setSelectedDatabaseSubItem(null));
            }}
            onDoubleClick={() => dispatch(setActiveMainTab('db:' + db.dbname))}
            onContextMenu={(e) => onContextMenu(e, db.dbname, isActive)}
          >
            {/* Level 2 items */}
            {[
              { 
                id: 'Users', 
                icon: 'group',
                hasChildren: true,
                isLoading: databaseUsersLoading[db.dbname],
                children: (databaseUsers[db.dbname] || []).map(u => ({
                  id: typeof u === 'string' ? u : u.name,
                  icon: 'person'
                }))
              },
              { 
                id: 'Job automation', 
                icon: 'bolt',
                hasChildren: true,
                children: [
                   { id: 'Backup Plan', icon: 'backup' },
                   { id: 'Query Plan', icon: 'schema' }
                ]
              },
              { 
                id: 'Space', 
                icon: 'donut_small',
                onClick: () => dispatch(setActiveMainTab(`db_space:${selectedHostUid}:${db.dbname}`)),
                hasChildren: true,
                children: [
                  { id: 'Permanent_PermanentData', icon: 'data_usage' },
                  { id: 'Permanent_TemporaryData', icon: 'layers' },
                  { id: 'Temporary_TemporaryData', icon: 'auto_delete' },
                  { 
                    id: 'Log', 
                    icon: 'history',
                    hasChildren: true,
                    children: [
                      { id: 'Active', icon: 'radio_button_checked' },
                      { id: 'Archive', icon: 'inventory_2' }
                    ]
                  }
                ]
              }
            ].map((item) => {
              const isItemSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === item.id;
              
              if (item.hasChildren) {
                return (
                  <TreeNode
                    key={item.id}
                    id={item.id}
                    label={item.id}
                    icon={item.icon}
                    level={2}
                    isActive={isItemSelected}
                    hasChildren={true}
                    onToggle={() => {
                      if (selectedHostUid) {
                        if (item.id === 'Users') {
                          if (!databaseUsers[db.dbname] && !databaseUsersLoading[db.dbname]) {
                            dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname: db.dbname }));
                          }
                        } else if (item.id === 'Job automation') {
                          if (!backupSchedules[db.dbname] && !backupSchedulesLoading[db.dbname]) {
                            dispatch(fetchBackupSchedule({ hostUid: selectedHostUid, dbname: db.dbname }));
                          }
                          if (!queryPlans[db.dbname] && !queryPlansLoading[db.dbname]) {
                            dispatch(fetchQueryPlan({ hostUid: selectedHostUid, dbname: db.dbname }));
                          }
                        } else if (item.id === 'Space') {
                          if (!spaceInfo[db.dbname] && !spaceInfoLoading[db.dbname]) {
                            dispatch(fetchDatabaseSpaceInfo({ hostUid: selectedHostUid, dbname: db.dbname }));
                          }
                        }
                      }
                    }}
                    onSelect={() => {
                      dispatch(setSelectedDatabase(db.dbname));
                      dispatch(setSelectedDatabaseSubItem(item.id));
                      if (item.onClick) item.onClick();
                    }}
                    onContextMenu={(e) => {
                      if (item.id === 'Users') {
                        onUsersContextMenu(e, db.dbname);
                      } else if (item.id === 'Space') {
                        dispatch(setSelectedDatabaseSubItem('Space'));
                        if (!spaceInfo[db.dbname] && !spaceInfoLoading[db.dbname]) {
                          dispatch(fetchDatabaseSpaceInfo({ hostUid: selectedHostUid, dbname: db.dbname }));
                        }
                        onSpaceContextMenu(e, db.dbname);
                      } else if (item.id === 'Job automation') {
                        if (onJobAutomationContextMenu) onJobAutomationContextMenu(e, db.dbname);
                      }
                    }}
                  >
                    {/* Render level 3 items */}
                    {item.isLoading ? (
                      <div className="px-6 py-3 flex items-center gap-3">
                         <Spinner size="xs" color="bk-yellow" />
                         <Typography variant="caption" className="text-slate-500 font-bold uppercase tracking-widest text-[8px] animate-pulse">Synchronizing...</Typography>
                      </div>
                    ) : item.children?.length === 0 && item.id === 'Users' ? (
                       <div className="px-10 py-3 opacity-30 flex items-center gap-2">
                          <Icon name="block" size="xs"  weight={300} />
                          <Typography variant="caption" className="italic font-bold uppercase tracking-widest text-[8px]">Index Empty</Typography>
                       </div>
                    ) : (
                      item.children?.map(child => {
                        const isChildSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === child.id;
                        
                        // Handle special Backup Plan folder
                        if (child.id === 'Backup Plan') {
                          const schedules = backupSchedules[db.dbname] || [];
                          return (
                            <TreeNode
                              key={child.id}
                              id={child.id}
                              label="Backup Plan"
                              icon={child.icon}
                              level={3}
                              isActive={isChildSelected}
                              hasChildren={true}
                              isLoading={backupSchedulesLoading[db.dbname]}
                              onToggle={() => {
                                if (selectedHostUid && !backupSchedules[db.dbname] && !backupSchedulesLoading[db.dbname]) {
                                  dispatch(fetchBackupSchedule({ hostUid: selectedHostUid, dbname: db.dbname }));
                                }
                              }}
                              onSelect={() => {
                                dispatch(setSelectedDatabase(db.dbname));
                                dispatch(setSelectedDatabaseSubItem(child.id));
                              }}
                              onContextMenu={(e) => onBackupPlanContextMenu(e, db.dbname)}
                            >
                              {schedules.length === 0 && !backupSchedulesLoading[db.dbname] ? (
                                <div className="px-10 py-3 opacity-30 flex items-center gap-2">
                                   <Icon name="block" size="xs"  weight={300} />
                                   <Typography variant="caption" className="italic font-bold uppercase tracking-widest text-[8px]">No Policy Found</Typography>
                                </div>
                              ) : (
                                schedules.map(plan => {
                                  const planId = plan.backupid;
                                  const isPlanSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === `backup:${planId}`;
                                  return (
                                    <TreeNode
                                      key={planId}
                                      id={planId}
                                      label={planId}
                                      icon="event_note"
                                      level={4}
                                      isActive={isPlanSelected}
                                      hasChildren={false}
                                      onSelect={() => {
                                        dispatch(setSelectedDatabase(db.dbname));
                                        dispatch(setSelectedDatabaseSubItem(`backup:${planId}`));
                                      }}
                                      onContextMenu={(e) => onBackupItemContextMenu(e, db.dbname, planId)}
                                    />
                                  );
                                })
                              )}
                            </TreeNode>
                          );
                        }

                        // Handle special Query Plan folder
                        if (child.id === 'Query Plan') {
                          const queryP = queryPlans[db.dbname] || [];
                          return (
                            <TreeNode
                              key={child.id}
                              id={child.id}
                              label="Query Plan"
                              icon={child.icon}
                              level={3}
                              isActive={isChildSelected}
                              hasChildren={true}
                              isLoading={queryPlansLoading[db.dbname]}
                              onToggle={() => {
                                if (selectedHostUid && !queryPlans[db.dbname] && !queryPlansLoading[db.dbname]) {
                                  dispatch(fetchQueryPlan({ hostUid: selectedHostUid, dbname: db.dbname }));
                                }
                              }}
                              onSelect={() => {
                                dispatch(setSelectedDatabase(db.dbname));
                                dispatch(setSelectedDatabaseSubItem(child.id));
                              }}
                              onContextMenu={(e) => onQueryPlanContextMenu(e, db.dbname)}
                            >
                              {queryP.length === 0 && !queryPlansLoading[db.dbname] ? (
                                <div className="px-10 py-3 opacity-30 flex items-center gap-2">
                                   <Icon name="block" size="xs"  weight={300} />
                                   <Typography variant="caption" className="italic font-bold uppercase tracking-widest text-[8px]">No Optimizer Plan</Typography>
                                </div>
                              ) : (
                                queryP.map(plan => {
                                  const qId = plan.query_id;
                                  const isQSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === `query:${qId}`;
                                  return (
                                    <TreeNode
                                      key={qId}
                                      id={qId}
                                      label={qId}
                                      icon="sticky_note_2"
                                      level={4}
                                      isActive={isQSelected}
                                      hasChildren={false}
                                      onSelect={() => {
                                        dispatch(setSelectedDatabase(db.dbname));
                                        dispatch(setSelectedDatabaseSubItem(`query:${qId}`));
                                      }}
                                    />
                                  );
                                })
                              )}
                            </TreeNode>
                          );
                        }

                        // Space Volumes
                        const isCategoryFolder = ['Permanent_PermanentData', 'Permanent_TemporaryData', 'Temporary_TemporaryData', 'Log', 'Active', 'Archive'].includes(child.id);
                        let volumes = [];
                        if (spaceInfo[db.dbname] && isCategoryFolder) {
                          const allVolumes = spaceInfo[db.dbname].volumes || [];
                          if (child.id === 'Permanent_PermanentData') {
                            volumes = allVolumes.filter(v => v.type === 'PERMANENT' && (v.purpose === 'PERMANENT' || !v.purpose));
                          } else if (child.id === 'Permanent_TemporaryData') {
                            volumes = allVolumes.filter(v => v.type === 'PERMANENT' && v.purpose === 'TEMPORARY');
                          } else if (child.id === 'Temporary_TemporaryData') {
                            volumes = allVolumes.filter(v => v.type === 'TEMPORARY');
                          } else if (child.id === 'Active') {
                            volumes = allVolumes.filter(v => v.type === 'Active_log');
                          } else if (child.id === 'Archive') {
                            volumes = allVolumes.filter(v => v.type === 'Archive_log');
                          }
                        }

                        if (child.hasChildren || isCategoryFolder) {
                          return (
                            <TreeNode
                              key={child.id}
                              id={child.id}
                              label={child.id}
                              icon={child.icon}
                              level={3}
                              isActive={isChildSelected}
                              hasChildren={true}
                              isLoading={isCategoryFolder && spaceInfoLoading[db.dbname] && !spaceInfo[db.dbname]}
                              onToggle={() => {
                                if (isCategoryFolder && !spaceInfo[db.dbname] && !spaceInfoLoading[db.dbname]) {
                                  dispatch(fetchDatabaseSpaceInfo({ hostUid: selectedHostUid, dbname: db.dbname }));
                                }
                              }}
                              onSelect={() => {
                                dispatch(setSelectedDatabase(db.dbname));
                                dispatch(setSelectedDatabaseSubItem(child.id));
                                if (child.onClick) child.onClick();
                              }}
                              onDoubleClick={() => {
                                if (isCategoryFolder) dispatch(setActiveMainTab(`vol_category:${selectedHostUid}:${db.dbname}:${child.id}`));
                              }}
                            >
                              {child.children?.map(sub => {
                                const isSubSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === sub.id;
                                let subVolumes = [];
                                if (spaceInfo[db.dbname]) {
                                  const allVolumes = spaceInfo[db.dbname].volumes || [];
                                  if (sub.id === 'Active') subVolumes = allVolumes.filter(v => v.type === 'Active_log');
                                  else if (sub.id === 'Archive') subVolumes = allVolumes.filter(v => v.type === 'Archive_log');
                                }
                                
                                const isSubCategory = ['Active', 'Archive'].includes(sub.id);
                                if (isSubCategory) {
                                  return (
                                    <TreeNode
                                      key={sub.id}
                                      id={sub.id}
                                      label={sub.id}
                                      icon={sub.icon}
                                      level={4}
                                      isActive={isSubSelected}
                                      hasChildren={true}
                                      onSelect={() => {
                                        dispatch(setSelectedDatabase(db.dbname));
                                        dispatch(setSelectedDatabaseSubItem(sub.id));
                                      }}
                                      onDoubleClick={() => dispatch(setActiveMainTab(`vol_category:${selectedHostUid}:${db.dbname}:${sub.id}`))}
                                    >
                                      {subVolumes.length === 0 && !spaceInfoLoading[db.dbname] ? (
                                        <div className="px-10 py-3 opacity-30 flex items-center gap-2">
                                            <Icon name="block" size="xs"  weight={300} />
                                            <Typography variant="caption" className="italic font-bold uppercase tracking-widest text-[8px]">Storage Empty</Typography>
                                        </div>
                                      ) : (
                                        subVolumes.map(vol => {
                                          const fileName = vol.spacename.split(/[\\/]/).pop();
                                          const subItemId = `vol:${vol.spacename}`;
                                          const isVolSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === subItemId;
                                          return (
                                            <TreeNode
                                              key={vol.spacename}
                                              id={vol.spacename}
                                              label={fileName}
                                              icon="description"
                                              level={5}
                                              isActive={isVolSelected}
                                              hasChildren={false}
                                              onSelect={() => {
                                                dispatch(setSelectedDatabase(db.dbname));
                                                dispatch(setSelectedDatabaseSubItem(subItemId));
                                              }}
                                              onDoubleClick={() => dispatch(setActiveMainTab(`vol_info:${selectedHostUid}:${db.dbname}:${vol.spacename}`))}
                                            />
                                          );
                                        })
                                      )}
                                    </TreeNode>
                                  );
                                }
                                
                                return (
                                  <TreeNode
                                    key={sub.id}
                                    id={sub.id}
                                    label={sub.id}
                                    icon={sub.icon}
                                    level={4}
                                    isActive={isSubSelected}
                                    hasChildren={false}
                                    onSelect={() => {
                                      dispatch(setSelectedDatabase(db.dbname));
                                      dispatch(setSelectedDatabaseSubItem(sub.id));
                                    }}
                                  />
                                );
                              })}

                              {/* Direct Volumes in Category Folder */}
                              {volumes.length === 0 && !child.children && spaceInfo[db.dbname] && (
                                <div className="px-10 py-3 opacity-30 flex items-center gap-2">
                                    <Icon name="block" size="xs"  weight={300} />
                                    <Typography variant="caption" className="italic font-bold uppercase tracking-widest text-[8px]">No volumes</Typography>
                                </div>
                              )}
                              {volumes.map(vol => {
                                const fileName = vol.spacename.split(/[\\/]/).pop();
                                const subItemId = `vol:${vol.spacename}`;
                                const isVolSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === subItemId;
                                return (
                                  <TreeNode
                                    key={vol.spacename}
                                    id={vol.spacename}
                                    label={fileName}
                                    icon="description"
                                    level={4}
                                    isActive={isVolSelected}
                                    hasChildren={false}
                                    onSelect={() => {
                                      dispatch(setSelectedDatabase(db.dbname));
                                      dispatch(setSelectedDatabaseSubItem(subItemId));
                                    }}
                                    onDoubleClick={() => dispatch(setActiveMainTab(`vol_info:${selectedHostUid}:${db.dbname}:${vol.spacename}`))}
                                  />
                                );
                              })}
                            </TreeNode>
                          );
                        }

                        // Users leaf nodes (since Users children are populated here)
                        if (item.id === 'Users') {
                          return (
                            <TreeNode
                              key={child.id}
                              id={child.id}
                              label={child.id}
                              icon={child.icon}
                              level={3}
                              isActive={isChildSelected}
                              hasChildren={false}
                              onSelect={() => {
                                dispatch(setSelectedDatabase(db.dbname));
                                dispatch(setSelectedDatabaseSubItem(child.id));
                              }}
                              onContextMenu={(e) => onUserContextMenu(e, db.dbname, child.id)}
                            />
                          );
                        }

                        return (
                          <TreeNode
                            key={child.id}
                            id={child.id}
                            label={child.id}
                            icon={child.icon}
                            level={3}
                            isActive={isChildSelected}
                            hasChildren={false}
                            onSelect={() => {
                              dispatch(setSelectedDatabase(db.dbname));
                              dispatch(setSelectedDatabaseSubItem(child.id));
                            }}
                          />
                        );
                      })
                    )}
                  </TreeNode>
                );
              }

              // Normal flat level 2 nodes without children
              return (
                <TreeNode
                  key={item.id}
                  id={item.id}
                  label={item.id}
                  icon={item.icon}
                  level={2}
                  isActive={isItemSelected}
                  hasChildren={false}
                  onSelect={() => {
                    dispatch(setSelectedDatabase(db.dbname));
                    dispatch(setSelectedDatabaseSubItem(item.id));
                    if(item.onClick) item.onClick();
                  }}
                />
              );
            })}
          </TreeNode>
        );
      })}
    </div>
  );
}
