import React from 'react';
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
import Typography from '../../../../components/ui/Foundation/Typography';
import Icon from '../../../../components/ui/Foundation/Icon';
import Spinner from '../../../../components/ui/Feedback/Spinner';

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
      <div className="flex items-center justify-center py-6">
        <Spinner size="sm" />
      </div>
    );
  }

  if (databases.length === 0) {
    return (
      <div className="px-5 py-4 text-center">
        <Typography variant="caption" className="opacity-40 italic font-bold">No databases found</Typography>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-1">
      {databases.map((db) => {
        const isActive = activeDatabases.includes(db.dbname);
        const isLoggedIn = loggedInDatabases.includes(db.dbname);
        const isDbSelected = db.dbname === selectedDatabase && !selectedDatabaseSubItem;

        return (
          <details 
            key={db.dbname} 
            className="group/db"
            onToggle={(e) => {
              if (e.target.open && isActive) {
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
          >
            <summary
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer list-none rounded-lg transition-all duration-300 select-none border relative group/sum
                ${isDbSelected 
                  ? 'bg-primary/5 border-primary/40 text-primary shadow-premium-sm' 
                  : 'bg-transparent border-transparent text-foreground/60 hover:bg-muted/5 hover:text-primary hover:border-border/50'}`}
              onClick={() => {
                dispatch(setSelectedDatabase(db.dbname));
                dispatch(setSelectedDatabaseSubItem(null));
              }}
              onDoubleClick={() => dispatch(setActiveMainTab('db:' + db.dbname))}
              onContextMenu={(e) => onContextMenu(e, db.dbname, isActive)}
            >
              <Icon 
                 name="chevron_right" 
                 size="xs" 
                 className={`transition-transform duration-300 group-open/db:rotate-90 ${isDbSelected ? 'text-primary' : 'opacity-20'}`} 
              />
              <Icon 
                 name="database" 
                 size="xs" 
                 className={`transition-all duration-300 ${isDbSelected ? 'text-primary scale-110 shadow-premium' : 'opacity-40 group-hover/sum:opacity-100 group-hover/sum:text-primary'}`} 
              />
              <Typography 
                 variant="span" 
                 className={`text-[13px] font-medium tracking-tight flex-1 truncate transition-colors ${isDbSelected ? 'text-primary font-bold' : ''}`}
              >
                {db.dbname}
              </Typography>
              
              {isDbSelected && (
                <div className="absolute left-[-1px] top-2 bottom-2 w-[3px] bg-primary rounded-full shadow-premium animate-in fade-in duration-500"></div>
              )}

              {isActive ? (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="h-1 w-1 rounded-full bg-emerald-500 shadow-premium animate-pulse" />
                  <Typography variant="caption" className="text-emerald-500 font-bold text-[7px] uppercase tracking-widest">ON</Typography>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-muted/10 border border-border/20 rounded-full opacity-40">
                  <div className="h-1 w-1 rounded-full bg-foreground/40" />
                  <Typography variant="caption" className="text-foreground/60 font-bold text-[7px] uppercase tracking-widest">OFF</Typography>
                </div>
              )}
            </summary>

            <div className="ml-5 mt-1 border-l border-border/30 pl-1 space-y-0.5 animate-in slide-in-from-left-2 duration-300">
              {[
                { 
                  id: 'Users', 
                  icon: 'group',
                  children: (databaseUsers[db.dbname] || []).map(u => ({
                    id: typeof u === 'string' ? u : u.name,
                    icon: 'person'
                  }))
                },
                { 
                  id: 'Job automation', 
                  icon: 'bolt',
                  children: [
                    { id: 'Backup Plan', icon: 'backup' },
                    { id: 'Query Plan', icon: 'schema' }
                  ]
                },
                { 
                  id: 'Space', 
                  icon: 'donut_small',
                  onClick: () => dispatch(setActiveMainTab(`db_space:${selectedHostUid}:${db.dbname}`)),
                  children: [
                    { id: 'Permanent_PermanentData', icon: 'data_usage' },
                    { id: 'Permanent_TemporaryData', icon: 'layers' },
                    { id: 'Temporary_TemporaryData', icon: 'auto_delete' },
                    { 
                      id: 'Log', 
                      icon: 'history',
                      children: [
                        { id: 'Active', icon: 'radio_button_checked' },
                        { id: 'Archive', icon: 'inventory_2' }
                      ]
                    }
                  ]
                }
              ].map((item) => {
                const isItemSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === item.id;
                const isExpandable = (item.children && (item.children.length > 0 || item.id === 'Users'));
                const isLoading = item.id === 'Users' && databaseUsersLoading[db.dbname];
                
                if (isExpandable) {
                  return (
                    <details 
                      key={item.id} 
                      className="group/nested"
                      onToggle={(e) => {
                        if (e.target.open && selectedHostUid) {
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
                          }
                        }
                      }}
                    >
                      <summary 
                        className={`flex items-center gap-2 px-3 py-1.5 w-full text-left transition-all group/item-sum cursor-pointer list-none rounded-lg relative border border-transparent
                          ${isItemSelected 
                            ? 'bg-primary/5 text-primary border-primary/20' 
                            : 'text-foreground/50 hover:bg-muted/5 hover:text-primary'}`}
                        onClick={() => {
                          dispatch(setSelectedDatabase(db.dbname));
                          dispatch(setSelectedDatabaseSubItem(item.id));
                        }}
                        onContextMenu={(e) => {
                          if (item.id === 'Users') onUsersContextMenu(e, db.dbname);
                          else if (item.id === 'Space') {
                            dispatch(setSelectedDatabaseSubItem('Space'));
                            if (!spaceInfo[db.dbname] && !spaceInfoLoading[db.dbname]) {
                              dispatch(fetchDatabaseSpaceInfo({ hostUid: selectedHostUid, dbname: db.dbname }));
                            }
                            onSpaceContextMenu(e, db.dbname);
                          }
                        }}
                      >
                        <Icon 
                           name="chevron_right" 
                           size="xs" 
                           className={`scale-[0.7] transition-transform duration-300 group-open/nested:rotate-90 ${isItemSelected ? 'text-primary' : 'opacity-20'}`} 
                        />
                        <Icon 
                           name={item.icon} 
                           size="xs" 
                           className={`transition-colors ${isItemSelected ? 'text-primary' : 'opacity-40 group-hover/item-sum:opacity-100 group-hover/item-sum:text-primary'}`} 
                        />
                        <Typography variant="span" className="text-[12px] font-medium tracking-tight">{item.id}</Typography>
                        {isItemSelected && (
                          <div className="absolute left-[-1px] top-1.5 bottom-1.5 w-[2.5px] bg-primary rounded-full shadow-premium"></div>
                        )}
                      </summary>
                      
                      <div className="ml-4 border-l border-border/20 pl-1 mt-0.5 space-y-0.5">
                        {isLoading ? (
                          <div className="px-4 py-2 flex items-center gap-2">
                             <Spinner size="xs" />
                             <Typography variant="caption" className="opacity-40 font-bold">Loading users...</Typography>
                          </div>
                        ) : item.children.length === 0 ? (
                          <div className="px-4 py-1.5 opacity-30 italic text-[11px] font-bold">No items found</div>
                        ) : (
                          item.children.map(child => {
                            const isChildSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === child.id;
                            const isBackupPlan = child.id === 'Backup Plan';
                            const isQueryPlan = child.id === 'Query Plan';
                            const isLoadingBackup = isBackupPlan && backupSchedulesLoading[db.dbname];
                            const isLoadingQuery = isQueryPlan && queryPlansLoading[db.dbname];
                            const schedules = backupSchedules[db.dbname] || [];
                            const queryP = queryPlans[db.dbname] || [];

                            if (isBackupPlan || isQueryPlan) {
                               const type = isBackupPlan ? 'backup' : 'query';
                               const data = isBackupPlan ? schedules : queryP;
                               const loadingSub = isBackupPlan ? isLoadingBackup : isLoadingQuery;
                               const icon = isBackupPlan ? 'backup' : 'schema';

                               return (
                                 <details 
                                   key={child.id} 
                                   className={`group/${type}`}
                                   onToggle={(e) => {
                                      if (e.target.open && selectedHostUid && !data.length && !loadingSub) {
                                        dispatch(isBackupPlan ? fetchBackupSchedule({ hostUid: selectedHostUid, dbname: db.dbname }) : fetchQueryPlan({ hostUid: selectedHostUid, dbname: db.dbname }));
                                      }
                                   }}
                                 >
                                   <summary
                                     className={`flex items-center gap-2 px-3 py-1.5 w-full text-left transition-all duration-200 group/child-sum relative rounded-lg border border-transparent
                                       ${isChildSelected ? 'bg-primary/5 text-primary border-primary/20' : 'text-foreground/40 hover:bg-muted/5 hover:text-primary'}`}
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       dispatch(setSelectedDatabase(db.dbname));
                                       dispatch(setSelectedDatabaseSubItem(child.id));
                                     }}
                                     onContextMenu={(e) => isBackupPlan ? onBackupPlanContextMenu(e, db.dbname) : onQueryPlanContextMenu(e, db.dbname)}
                                   >
                                     <Icon 
                                        name="chevron_right" 
                                        size="xs" 
                                        className={`scale-[0.6] transition-transform duration-300 group-open/${type}:rotate-90 ${isChildSelected ? 'text-primary' : 'opacity-20'}`} 
                                     />
                                     <Icon 
                                        name={icon} 
                                        size="xs" 
                                        className={`transition-colors ${isChildSelected ? 'text-primary' : 'opacity-40 group-hover/child-sum:opacity-100 group-hover/child-sum:text-primary'}`} 
                                     />
                                     <Typography variant="span" className="text-[12px] font-medium tracking-tight">{child.id}</Typography>
                                   </summary>
                                   <div className="ml-4 border-l border-border/10 pl-1 mt-0.5 space-y-0.5">
                                      {loadingSub ? (
                                        <div className="px-4 py-2 flex items-center gap-2">
                                           <Spinner size="xs" />
                                           <Typography variant="caption" className="opacity-40 font-bold">Loading...</Typography>
                                        </div>
                                      ) : data.length === 0 ? (
                                        <div className="px-4 py-1.5 opacity-20 italic text-[10px] font-bold uppercase tracking-wider">Empty</div>
                                      ) : (
                                        data.map(plan => {
                                           const id = isBackupPlan ? plan.backupid : plan.query_id;
                                           const selectId = `${type}:${id}`;
                                           const isPlanSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === selectId;
                                           return (
                                             <button
                                               key={id}
                                               className={`flex items-center gap-2.5 px-3 py-1.5 w-full text-left transition-all duration-200 group/plan relative rounded-lg
                                                 ${isPlanSelected 
                                                    ? 'bg-primary/10 text-primary shadow-premium-sm border border-primary/20' 
                                                    : 'text-foreground/40 hover:bg-muted/3 hover:text-primary'}`}
                                               onClick={(e) => {
                                                 e.stopPropagation();
                                                 dispatch(setSelectedDatabase(db.dbname));
                                                 dispatch(setSelectedDatabaseSubItem(selectId));
                                               }}
                                               onContextMenu={(e) => isBackupPlan && onBackupItemContextMenu(e, db.dbname, id)}
                                             >
                                               <Icon 
                                                  name={isBackupPlan ? 'event_note' : 'sticky_note_2'} 
                                                  size="xs" 
                                                  className={`opacity-30 transition-all ${isPlanSelected ? 'opacity-100 scale-110 text-primary' : 'group-hover/plan:opacity-100 group-hover/plan:text-primary'}`} 
                                               />
                                               <Typography variant="caption" className={`truncate font-mono tracking-tighter text-[11px] ${isPlanSelected ? 'font-bold' : 'font-medium'}`}>{id}</Typography>
                                             </button>
                                           );
                                        })
                                      )}
                                   </div>
                                 </details>
                               );
                            }

                            // Handling Space / Volume nodes
                            let volumes = [];
                            if (spaceInfo[db.dbname]) {
                              const allVolumes = spaceInfo[db.dbname].volumes || [];
                              if (child.id === 'Permanent_PermanentData') volumes = allVolumes.filter(v => v.type === 'PERMANENT' && (v.purpose === 'PERMANENT' || !v.purpose));
                              else if (child.id === 'Permanent_TemporaryData') volumes = allVolumes.filter(v => v.type === 'PERMANENT' && v.purpose === 'TEMPORARY');
                              else if (child.id === 'Temporary_TemporaryData') volumes = allVolumes.filter(v => v.type === 'TEMPORARY');
                              else if (child.id === 'Active') volumes = allVolumes.filter(v => v.type === 'Active_log');
                              else if (child.id === 'Archive') volumes = allVolumes.filter(v => v.type === 'Archive_log');
                            }

                            const isCategoryFolder = ['Permanent_PermanentData', 'Permanent_TemporaryData', 'Temporary_TemporaryData', 'Log', 'Active', 'Archive'].includes(child.id);
                            if (child.children?.length > 0 || volumes.length > 0 || isCategoryFolder) {
                               return (
                                 <details 
                                   key={child.id} 
                                   className="group/child"
                                   onToggle={(e) => {
                                      if (e.target.open && !spaceInfo[db.dbname] && !spaceInfoLoading[db.dbname]) {
                                        dispatch(fetchDatabaseSpaceInfo({ hostUid: selectedHostUid, dbname: db.dbname }));
                                      }
                                   }}
                                 >
                                   <summary
                                     className={`flex items-center gap-2 px-3 py-1.5 w-full text-left transition-all duration-200 group/child-sum relative rounded-lg
                                       ${isChildSelected ? 'bg-primary/5 text-primary border-primary/20' : 'text-foreground/40 hover:bg-muted/5'}`}
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       dispatch(setSelectedDatabase(db.dbname));
                                       dispatch(setSelectedDatabaseSubItem(child.id));
                                       if (child.onClick) child.onClick();
                                     }}
                                     onDoubleClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(setActiveMainTab(`vol_category:${selectedHostUid}:${db.dbname}:${child.id}`));
                                     }}
                                   >
                                     <Icon 
                                        name="chevron_right" 
                                        size="xs" 
                                        className={`scale-[0.6] transition-transform duration-300 group-open/child:rotate-90 ${isChildSelected ? 'text-primary' : 'opacity-20'}`} 
                                     />
                                     <Icon 
                                        name={child.icon} 
                                        size="xs" 
                                        className={`transition-colors ${isChildSelected ? 'text-primary' : 'opacity-40 group-hover/child-sum:opacity-100 group-hover/child-sum:text-primary'}`} 
                                     />
                                     <Typography variant="span" className="text-[12px] font-medium tracking-tight truncate">{child.id}</Typography>
                                   </summary>
                                   <div className="ml-4 border-l border-border/10 pl-1 mt-0.5 space-y-0.5">
                                      {child.children?.map(sub => {
                                         const isSubSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === sub.id;
                                         // Nested children handling (simplified for recursion depth)
                                         return (
                                           <button
                                             key={sub.id}
                                             className={`flex items-center gap-2 px-3 py-1.5 w-full text-left transition-all rounded-lg
                                               ${isSubSelected ? 'bg-primary/10 text-primary font-black' : 'text-foreground/40 hover:bg-muted/5'}`}
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               dispatch(setSelectedDatabase(db.dbname));
                                               dispatch(setSelectedDatabaseSubItem(sub.id));
                                             }}
                                           >
                                             <Icon name={sub.icon} size="xs" className="opacity-30" />
                                             <Typography variant="caption" className="font-bold tracking-tight">{sub.id}</Typography>
                                           </button>
                                         );
                                      })}
                                      {volumes.map(vol => {
                                         const fileName = vol.spacename.split(/[\\/]/).pop();
                                         const subItemId = `vol:${vol.spacename}`;
                                         const isVolSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === subItemId;
                                         return (
                                           <button
                                             key={vol.spacename}
                                             className={`flex items-center gap-2 px-4 py-1.5 w-full text-left transition-all rounded-lg group/vol
                                               ${isVolSelected ? 'bg-primary/10 text-primary shadow-premium-sm border border-primary/20' : 'text-foreground/40 hover:bg-muted/5'}`}
                                             onClick={(e) => {
                                               e.stopPropagation();
                                               dispatch(setSelectedDatabase(db.dbname));
                                               dispatch(setSelectedDatabaseSubItem(subItemId));
                                             }}
                                             onDoubleClick={(e) => {
                                               e.stopPropagation();
                                               dispatch(setActiveMainTab(`vol_info:${selectedHostUid}:${db.dbname}:${vol.spacename}`));
                                             }}
                                           >
                                             <Icon 
                                                name="description" 
                                                size="xs" 
                                                className={`opacity-30 transition-all ${isVolSelected ? 'opacity-100 text-primary' : 'group-hover/vol:opacity-60'}`} 
                                             />
                                             <Typography variant="caption" className={`text-[11px] font-mono tracking-tighter truncate ${isVolSelected ? 'font-bold' : 'font-medium'}`}>{fileName}</Typography>
                                           </button>
                                         );
                                      })}
                                   </div>
                                 </details>
                               );
                            }

                            return (
                              <button
                                key={child.id}
                                className={`flex items-center gap-2.5 px-3 py-1.5 w-full text-left transition-all duration-200 group/child relative rounded-lg border border-transparent
                                  ${isChildSelected ? 'bg-primary/5 text-primary border-primary/20' : 'text-foreground/50 hover:bg-muted/5 hover:text-primary'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch(setSelectedDatabase(db.dbname));
                                  dispatch(setSelectedDatabaseSubItem(child.id));
                                }}
                                onContextMenu={(e) => {
                                  if (item.id === 'Users') onUserContextMenu(e, db.dbname, child.id);
                                  else if (child.id === 'Backup Plan') onBackupPlanContextMenu(e, db.dbname);
                                  else if (child.id === 'Query Plan') onQueryPlanContextMenu(e, db.dbname);
                                }}
                              >
                                <Icon 
                                   name={child.icon} 
                                   size="xs" 
                                   className={`transition-colors ${isChildSelected ? 'text-primary shadow-premium' : 'opacity-40 group-hover/child:opacity-100 group-hover/child:text-primary'}`} 
                                />
                                <Typography variant="span" className={`text-[12px] tracking-tight ${isChildSelected ? 'font-black' : 'font-bold'}`}>{child.id}</Typography>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </details>
                  );
                }

                return (
                  <button
                    key={item.id}
                    className={`flex items-center gap-2.5 px-3.5 py-1.5 w-full text-left transition-all group/item relative rounded-lg border border-transparent mb-0.5
                      ${isItemSelected 
                        ? 'bg-primary/5 text-primary border-primary/20 shadow-premium-sm font-black' 
                        : 'text-foreground/50 hover:bg-muted/5 hover:text-primary'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(setSelectedDatabase(db.dbname));
                      dispatch(setSelectedDatabaseSubItem(item.id));
                      if (item.onClick) item.onClick();
                    }}
                  >
                    <Icon 
                       name={item.icon} 
                       size="xs" 
                       className={`transition-all duration-300 ${isItemSelected ? 'text-primary scale-110 shadow-premium' : 'opacity-40 group-hover/item:opacity-100 group-hover/item:text-primary'}`} 
                    />
                    <Typography variant="span" className="text-[12px] font-medium tracking-tight whitespace-nowrap">{item.id}</Typography>
                    {isItemSelected && (
                      <div className="absolute left-[-1px] top-1.5 bottom-1.5 w-[2.5px] bg-primary rounded-full shadow-premium"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
