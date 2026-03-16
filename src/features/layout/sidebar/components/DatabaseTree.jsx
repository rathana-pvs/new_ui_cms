import { useDispatch, useSelector } from 'react-redux';
import { setSelectedDatabase, setSelectedDatabaseSubItem, fetchBackupSchedule, fetchQueryPlan } from '../../../database/databaseSlice';
import { fetchDatabaseUsers } from '../../../user/userSlice';
import { setActiveMainTab } from '../../layoutSlice';

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
    queryPlansLoading
  } = useSelector((state) => state.database);
  const { selectedHostUid } = useSelector((state) => state.host);
  const { databaseUsers, databaseUsersLoading } = useSelector((state) => state.user);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <svg className="animate-spin h-5 w-5 text-primary" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (databases.length === 0) {
    return <div className="px-3 py-2 text-xs text-slate-400">No databases found</div>;
  }

  return (
    <div className="space-y-1">
      {databases.map((db) => {
        const isActive = activeDatabases.includes(db.dbname);
        return (
          <details key={db.dbname} className="group">
            <summary
              className={`flex items-center gap-1 px-3 py-1.5 cursor-pointer list-none rounded-lg transition-all duration-200 select-none mb-1.5 group/sum border relative ${db.dbname === selectedDatabase && !selectedDatabaseSubItem ? 'bg-bk-yellow/5 text-amber-600 dark:text-bk-yellow border-bk-yellow/40 dark:border-bk-yellow/20' : 'bg-white/40 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 hover:border-bk-yellow/30 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
              onClick={() => {
                dispatch(setSelectedDatabase(db.dbname));
                dispatch(setSelectedDatabaseSubItem(null));
              }}
              onDoubleClick={() => dispatch(setActiveMainTab('db:' + db.dbname))}
              onContextMenu={(e) => onContextMenu(e, db.dbname, isActive)}
            >
              <span className={`material-symbols-outlined text-[16px] group-open:rotate-90 transition-transform ${db.dbname === selectedDatabase && !selectedDatabaseSubItem ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500'}`} style={{ fontVariationSettings: "'wght' 300" }}>chevron_right</span>
              <span className={`material-symbols-outlined text-[16px] ${db.dbname === selectedDatabase && !selectedDatabaseSubItem ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500'}`} style={{ fontVariationSettings: "'wght' 300" }}>
                database
              </span>
              <span className={`text-[11.5px] font-medium transition-colors flex-1 ${db.dbname === selectedDatabase && !selectedDatabaseSubItem ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-700 dark:text-slate-200 group-hover/sum:text-amber-600 dark:group-hover/sum:text-bk-yellow'}`}>{db.dbname}</span>
              {db.dbname === selectedDatabase && !selectedDatabaseSubItem && (
                <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600 dark:bg-bk-yellow rounded-full"></div>
              )}

              {isActive ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500/20 rounded-full tracking-tighter">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  On
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-medium bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-500/20 rounded-full tracking-tighter">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
                  Off
                </span>
              )}
            </summary>
            <div className="ml-[22px] border-l border-slate-200 dark:border-slate-800 space-y-0.5 py-1">
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
                  children: [
                    { id: 'Permanent_PermanentData', icon: 'data_usage' },
                    { id: 'Permanent_TemporaryData', icon: 'layers' },
                    { id: 'Temporary_TemporaryData', icon: 'auto_delete' }
                  ]
                },
                { 
                  id: 'Log', 
                  icon: 'history',
                  children: [
                    { id: 'Active', icon: 'radio_button_checked' },
                    { id: 'Archive', icon: 'inventory_2' }
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
                        if (e.target.open && item.id === 'Users' && selectedHostUid) {
                          dispatch(fetchDatabaseUsers({ hostUid: selectedHostUid, dbname: db.dbname }));
                        }
                      }}
                    >
                      <summary 
                        className={`flex items-center gap-2 px-3.5 py-1.5 w-full text-left transition-all group/item cursor-pointer list-none rounded-r-md relative select-none border border-transparent
                          ${isItemSelected ? 'text-amber-600 dark:text-bk-yellow font-medium' : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
                        onClick={() => {
                          dispatch(setSelectedDatabase(db.dbname));
                          dispatch(setSelectedDatabaseSubItem(item.id));
                        }}
                        onContextMenu={(e) => {
                          if (item.id === 'Users') {
                            onUsersContextMenu(e, db.dbname);
                          } else if (item.id === 'Space') {
                            onSpaceContextMenu(e, db.dbname);
                          }
                        }}
                      >
                        <span className={`material-symbols-outlined text-[14px] group-open/nested:rotate-90 transition-transform ${isItemSelected ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500'}`}>chevron_right</span>
                        <span className={`material-symbols-outlined text-[16px] transition-colors
                          ${isItemSelected ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500 group-hover/item:text-amber-600 dark:group-hover/item:text-bk-yellow'}`} 
                          style={{ fontVariationSettings: "'wght' 300" }}>
                          {item.icon}
                        </span>
                        <span className="text-[11px] tracking-wide whitespace-nowrap">{item.id}</span>
                        {isItemSelected && (
                          <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600 dark:bg-bk-yellow rounded-full"></div>
                        )}
                      </summary>
                      <div className="ml-4 border-l border-slate-100 dark:border-slate-800/50 mt-0.5 space-y-0.5">
                        {isLoading ? (
                          <div className="px-4 py-2 flex items-center gap-2 text-[10px] text-slate-500">
                            <svg className="animate-spin h-3 w-3 text-amber-500" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>Loading users...</span>
                          </div>
                        ) : item.children.length === 0 ? (
                          <div className="px-4 py-1.5 text-[10px] text-slate-400 italic">No users found</div>
                        ) : (
                          item.children.map(child => {
                            const isChildSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === child.id;
                            const isBackupPlan = child.id === 'Backup Plan';
                            const isQueryPlan = child.id === 'Query Plan';
                            const isLoadingBackup = isBackupPlan && backupSchedulesLoading[db.dbname];
                            const isLoadingQuery = isQueryPlan && queryPlansLoading[db.dbname];
                            const schedules = backupSchedules[db.dbname] || [];
                            const queryP = queryPlans[db.dbname] || [];

                            if (isBackupPlan) {
                              return (
                                <details 
                                  key={child.id} 
                                  className="group/backup"
                                  onToggle={(e) => {
                                    if (e.target.open && selectedHostUid) {
                                      dispatch(fetchBackupSchedule({ hostUid: selectedHostUid, dbname: db.dbname }));
                                    }
                                  }}
                                >
                                  <summary
                                    className={`flex items-center gap-3 px-4 py-1.5 w-full text-left transition-all duration-200 group/child relative rounded-r-md select-none border border-transparent cursor-pointer list-none
                                      ${isChildSelected ? 'text-amber-600 dark:text-bk-yellow font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dispatch(setSelectedDatabase(db.dbname));
                                      dispatch(setSelectedDatabaseSubItem(child.id));
                                    }}
                                    onContextMenu={(e) => onBackupPlanContextMenu(e, db.dbname)}
                                  >
                                    <span className={`material-symbols-outlined text-[14px] group-open/backup:rotate-90 transition-transform ${isChildSelected ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500'}`}>chevron_right</span>
                                    <span className={`material-symbols-outlined text-[15px]
                                      ${isChildSelected ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500 group-hover/child:text-amber-600 dark:group-hover/child:text-bk-yellow'}`}>
                                      {child.icon}
                                    </span>
                                    <span className="text-[10.5px] tracking-wide">{child.id}</span>
                                    {isChildSelected && (
                                      <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600 dark:bg-bk-yellow rounded-full"></div>
                                    )}
                                  </summary>
                                  <div className="ml-4 border-l border-slate-100 dark:border-slate-800/50 mt-0.5 space-y-0.5">
                                    {isLoadingBackup ? (
                                      <div className="px-4 py-2 flex items-center gap-2 text-[10px] text-slate-500">
                                        <div className="animate-spin h-3 w-3 border border-amber-500 border-t-transparent rounded-full"></div>
                                        <span>Loading plans...</span>
                                      </div>
                                    ) : schedules.length === 0 ? (
                                      <div className="px-4 py-1.5 text-[10px] text-slate-400 italic">No plans found</div>
                                    ) : (
                                      schedules.map(plan => {
                                        const planId = plan.backupid;
                                        const isPlanSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === `backup:${planId}`;
                                        return (
                                          <button
                                            key={planId}
                                            className={`flex items-center gap-3 px-4 py-1.5 w-full text-left transition-all duration-200 group/plan relative rounded-r-md select-none border border-transparent
                                              ${isPlanSelected ? 'text-amber-600 dark:text-bk-yellow bg-bk-yellow/5 dark:bg-bk-yellow/5 font-medium' : 'text-slate-500 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              dispatch(setSelectedDatabase(db.dbname));
                                              dispatch(setSelectedDatabaseSubItem(`backup:${planId}`));
                                            }}
                                            onContextMenu={(e) => onBackupItemContextMenu(e, db.dbname, planId)}
                                          >
                                            <span className={`material-symbols-outlined text-[14px]
                                              ${isPlanSelected ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-600 group-hover/plan:text-amber-600 dark:group-hover/plan:text-bk-yellow'}`}>
                                              event_note
                                            </span>
                                            <span className="text-[10px] tracking-wide truncate">{planId}</span>
                                            {isPlanSelected && (
                                              <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600 dark:bg-bk-yellow rounded-full"></div>
                                            )}
                                          </button>
                                        );
                                      })
                                    )}
                                  </div>
                                </details>
                              );
                            }

                            if (isQueryPlan) {
                              return (
                                <details 
                                  key={child.id} 
                                  className="group/query"
                                  onToggle={(e) => {
                                    if (e.target.open && selectedHostUid) {
                                      dispatch(fetchQueryPlan({ hostUid: selectedHostUid, dbname: db.dbname }));
                                    }
                                  }}
                                >
                                  <summary
                                    className={`flex items-center gap-3 px-4 py-1.5 w-full text-left transition-all duration-200 group/child relative rounded-r-md select-none border border-transparent cursor-pointer list-none
                                      ${isChildSelected ? 'text-amber-600 dark:text-bk-yellow font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      dispatch(setSelectedDatabase(db.dbname));
                                      dispatch(setSelectedDatabaseSubItem(child.id));
                                    }}
                                    onContextMenu={(e) => onQueryPlanContextMenu(e, db.dbname)}
                                  >
                                    <span className={`material-symbols-outlined text-[14px] group-open/query:rotate-90 transition-transform ${isChildSelected ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500'}`}>chevron_right</span>
                                    <span className={`material-symbols-outlined text-[15px]
                                      ${isChildSelected ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500 group-hover/child:text-amber-600 dark:group-hover/child:text-bk-yellow'}`}>
                                      {child.icon}
                                    </span>
                                    <span className="text-[10.5px] tracking-wide">{child.id}</span>
                                    {isChildSelected && (
                                      <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600 dark:bg-bk-yellow rounded-full"></div>
                                    )}
                                  </summary>
                                  <div className="ml-4 border-l border-slate-100 dark:border-slate-800/50 mt-0.5 space-y-0.5">
                                    {isLoadingQuery ? (
                                      <div className="px-4 py-2 flex items-center gap-2 text-[10px] text-slate-500">
                                        <div className="animate-spin h-3 w-3 border border-amber-500 border-t-transparent rounded-full"></div>
                                        <span>Loading plans...</span>
                                      </div>
                                    ) : queryP.length === 0 ? (
                                      <div className="px-4 py-1.5 text-[10px] text-slate-400 italic">No plans found</div>
                                    ) : (
                                      queryP.map(plan => {
                                        const qId = plan.query_id;
                                        const isQSelected = selectedDatabase === db.dbname && selectedDatabaseSubItem === `query:${qId}`;
                                        return (
                                          <button
                                            key={qId}
                                            className={`flex items-center gap-3 px-4 py-1.5 w-full text-left transition-all duration-200 group/plan relative rounded-r-md select-none border border-transparent
                                              ${isQSelected ? 'text-amber-600 dark:text-bk-yellow bg-bk-yellow/5 dark:bg-bk-yellow/5 font-medium' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              dispatch(setSelectedDatabase(db.dbname));
                                              dispatch(setSelectedDatabaseSubItem(`query:${qId}`));
                                            }}
                                          >
                                            <span className={`material-symbols-outlined text-[14px]
                                              ${isQSelected ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-600 group-hover/plan:text-amber-600 dark:group-hover/plan:text-bk-yellow'}`}>
                                              sticky_note_2
                                            </span>
                                            <span className="text-[10px] tracking-wide truncate">{qId}</span>
                                            {isQSelected && (
                                              <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600 dark:bg-bk-yellow rounded-full"></div>
                                            )}
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
                                key={child.id}
                                className={`flex items-center gap-3 px-4 py-1.5 w-full text-left transition-all duration-200 group/child relative rounded-r-md select-none border border-transparent
                                  ${isChildSelected ? 'text-amber-600 dark:text-bk-yellow bg-bk-yellow/5 dark:bg-bk-yellow/5 font-medium' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  dispatch(setSelectedDatabase(db.dbname));
                                  dispatch(setSelectedDatabaseSubItem(child.id));
                                }}
                                onContextMenu={(e) => {
                                  if (item.id === 'Users') {
                                    onUserContextMenu(e, db.dbname, child.id);
                                  } else if (child.id === 'Backup Plan') {
                                    onBackupPlanContextMenu(e, db.dbname);
                                  } else if (child.id === 'Query Plan') {
                                    onQueryPlanContextMenu(e, db.dbname);
                                  }
                                }}
                              >
                                <span className={`material-symbols-outlined text-[15px]
                                  ${isChildSelected ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500 group-hover/child:text-amber-600 dark:group-hover/child:text-bk-yellow'}`}>
                                  {child.icon}
                                </span>
                                <span className="text-[10.5px] tracking-wide">{child.id}</span>
                                {isChildSelected && (
                                  <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600 dark:bg-bk-yellow rounded-full"></div>
                                )}
                              </button>
                            )
                          })
                        )}
                      </div>
                    </details>
                  );
                }

                return (
                    <button
                      key={item.id}
                      className={`flex items-center gap-3 px-3.5 py-1.5 w-full text-left transition-all group/item relative rounded-r-md select-none border border-transparent
                        ${isItemSelected 
                          ? 'text-amber-600 dark:text-bk-yellow bg-bk-yellow/5 dark:bg-bk-yellow/5 font-medium' 
                          : 'text-slate-700 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-amber-600 dark:hover:text-bk-yellow'}`}
                      onClick={(e) => {
                      e.stopPropagation();
                      dispatch(setSelectedDatabase(db.dbname));
                      dispatch(setSelectedDatabaseSubItem(item.id));
                    }}
                  >
                    <span className={`material-symbols-outlined text-[16px] transition-colors
                      ${isItemSelected ? 'text-amber-600 dark:text-bk-yellow' : 'text-slate-400 dark:text-slate-500 group-hover/item:text-amber-600 dark:group-hover/item:text-bk-yellow'}`} 
                      style={{ fontVariationSettings: "'wght' 300" }}>
                      {item.icon}
                    </span>
                    <span className="text-[11px] tracking-wide whitespace-nowrap">{item.id}</span>
                    {isItemSelected && (
                      <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-amber-600 dark:bg-bk-yellow rounded-full shadow-[0_0_8px_rgba(217,119,6,0.2)] dark:shadow-[0_0_8px_rgba(255,215,0,0.3)]"></div>
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
