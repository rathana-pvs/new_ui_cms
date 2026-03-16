import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { databaseApi } from './databaseApi';
import { brokerApi } from '../broker/brokerApi';

export const fetchDatabaseStartInfo = createAsyncThunk(
  'database/fetchDatabaseStartInfo',
  async (arg, { rejectWithValue }) => {
    const hostUid = typeof arg === 'string' ? arg : arg.hostUid;
    try {
      const response = await databaseApi.getStartInfo(hostUid);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || 'Failed to fetch database information');
    }
  }
);

export const startDatabase = createAsyncThunk(
  'database/startDatabase',
  async ({ hostUid, dbname }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.startDatabase(hostUid, dbname);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to start database ${dbname}`);
    }
  }
);

export const stopDatabase = createAsyncThunk(
  'database/stopDatabase',
  async ({ hostUid, dbname }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.stopDatabase(hostUid, dbname);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to stop database ${dbname}`);
    }
  }
);

export const fetchDatabaseVolumes = createAsyncThunk(
  'database/fetchDatabaseVolumes',
  async (arg, { rejectWithValue }) => {
    const { hostUid, activeDatabases } = arg;
    if (!activeDatabases || activeDatabases.length === 0) return [];
    try {
      const allRequest = activeDatabases.map(dbname => 
        databaseApi.getVolumeInfo(hostUid, dbname)
      );
      const responses = await Promise.all(allRequest);
      return responses;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch volume info');
    }
  }
);

export const deleteDatabase = createAsyncThunk(
  'database/deleteDatabase',
  async ({ hostUid, dbname, payload }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.deleteDatabase(hostUid, dbname, payload);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to delete database ${dbname}`);
    }
  }
);

export const optimizeDatabase = createAsyncThunk(
  'database/optimizeDatabase',
  async ({ hostUid, dbname, payload }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.optimizeDatabase(hostUid, dbname, payload);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to optimize database ${dbname}`);
    }
  }
);

export const addBackupSchedule = createAsyncThunk(
  'database/addBackupSchedule',
  async ({ hostUid, dbname, payload }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.addBackupSchedule(hostUid, dbname, payload);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to add backup schedule for ${dbname}`);
    }
  }
);

export const editBackupSchedule = createAsyncThunk(
  'database/editBackupSchedule',
  async ({ hostUid, dbname, payload }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.editBackupSchedule(hostUid, dbname, payload);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to edit backup schedule for ${dbname}`);
    }
  }
);

export const deleteBackupSchedule = createAsyncThunk(
  'database/deleteBackupSchedule',
  async ({ hostUid, dbname, payload }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.deleteBackupSchedule(hostUid, dbname, payload);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to delete backup schedule for ${dbname}`);
    }
  }
);

export const fetchBackupSchedule = createAsyncThunk(
  'database/fetchBackupSchedule',
  async ({ hostUid, dbname }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.getBackupSchedule(hostUid, dbname);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to fetch backup schedule for ${dbname}`);
    }
  }
);

export const renameDatabase = createAsyncThunk(
  'database/renameDatabase',
  async ({ hostUid, dbname, payload }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.renameDatabase(hostUid, dbname, payload);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to rename database ${dbname}`);
    }
  }
);

export const fetchAutoBackupLog = createAsyncThunk(
  'database/fetchAutoBackupLog',
  async ({ hostUid }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.getAutoBackupLog(hostUid);
      return response.error || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch auto backup log');
    }
  }
);

export const fetchQueryPlan = createAsyncThunk(
  'database/fetchQueryPlan',
  async ({ hostUid, dbname }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.getQueryPlan(hostUid, dbname);
      return { dbname, data: response.planlist || [] };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || `Failed to fetch query plan for ${dbname}`);
    }
  }
);

export const setAutoExecQuery = createAsyncThunk(
  'database/setAutoExecQuery',
  async ({ hostUid, dbname, payload }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.setAutoExecQuery(hostUid, dbname, payload);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || `Failed to set query plan for ${dbname}`);
    }
  }
);

export const fetchQueryPlanLog = createAsyncThunk(
  'database/fetchQueryPlanLog',
  async ({ hostUid }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.getQueryPlanLog(hostUid);
      return response.error || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch query plan log');
    }
  }
);

export const fetchDatabaseClasses = createAsyncThunk(
  'database/fetchDatabaseClasses',
  async ({ hostUid, dbname, dbstatus }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.getClassInfo(hostUid, dbname, dbstatus);
      return { dbname, data: response };
    } catch (err) {
      return rejectWithValue({
        dbname,
        error: err.response?.data?.message || `Failed to fetch classes for ${dbname}`
      });
    }
  }
);

export const addVolume = createAsyncThunk(
  'database/addVolume',
  async ({ hostUid, dbname, payload }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.addVolDb(hostUid, dbname, payload);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to add volume to ${dbname}`);
    }
  }
);

export const fetchDashboardData = createAsyncThunk(
  'database/fetchDashboardData',
    async ({ hostUid, dbname }, { rejectWithValue }) => {
    if (!hostUid || !dbname) return rejectWithValue('Missing hostUid or dbname');
    try {
      // 1. Fetch core DB stats
      const [volumeInfo, lockInfo, statDumpRaw, brokerList] = await Promise.all([
        databaseApi.getVolumeInfo(hostUid, dbname),
        databaseApi.getLockInfo(hostUid, dbname),
        databaseApi.getStatDump(hostUid, dbname),
        brokerApi.getBrokerList(hostUid)
      ]);

      // 2. Fetch CAS info for each broker to find processes serving this DB
      const brokersCAS = [];
      const actualBrokerList = brokerList?.[0]?.broker || [];
      
      const brokerDetails = await Promise.all(
        actualBrokerList.map(b => {
          if (!b?.name) return Promise.resolve(null);
          return brokerApi.getBrokerStatus(hostUid, b.name).catch(() => null);
        })
      );

      brokerDetails.forEach((status, idx) => {
        if (!status || !status.asinfo) return;
        const brokerName = actualBrokerList[idx]?.name;
        
        status.asinfo.forEach(cas => {
          if (cas.as_dbname?.toLowerCase() === dbname.toLowerCase()) {
            brokersCAS.push({
              broker: brokerName,
              id: cas.as_id,
              pid: cas.as_pid,
              qps: cas.as_num_query,
              lqs: cas.as_long_query,
              status: cas.as_status,
              lastConn: cas.as_lct
            });
          }
        });
      });

      return { 
        dbname, 
        volumeInfo, 
        lockInfo, 
        statDump: statDumpRaw, // It is already flat properties
        brokersCAS 
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || `Failed to fetch dashboard data for ${dbname}`);
    }
  }
);

export const fetchDatabaseParamDump = createAsyncThunk(
  'database/fetchDatabaseParamDump',
  async ({ hostUid, dbname, both }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.getParamDump(hostUid, dbname, both);
      return { dbname, data: response };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to fetch parameter dump for ${dbname}`);
    }
  }
);

export const fetchDatabasePlanDump = createAsyncThunk(
  'database/fetchDatabasePlanDump',
  async ({ hostUid, dbname, plandrop }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.getPlanDump(hostUid, dbname, plandrop);
      return { dbname, data: response };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.response?.data?.error || `Failed to fetch plan dump for ${dbname}`);
    }
  }
);

export const fetchAutoVolumeLog = createAsyncThunk(
  'database/fetchAutoVolumeLog',
  async ({ hostUid }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.getAutoVolumeLog(hostUid);
      return response.logs || [];
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch auto volume log');
    }
  }
);

export const fetchAutoVolumeConfig = createAsyncThunk(
  'database/fetchAutoVolumeConfig',
  async ({ hostUid, dbname }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.getAutoVolumeConfig(hostUid, dbname);
      return { dbname, data: response };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch auto volume config');
    }
  }
);

export const updateAutoVolumeConfig = createAsyncThunk(
  'database/updateAutoVolumeConfig',
  async ({ hostUid, dbname, payload }, { rejectWithValue }) => {
    try {
      const response = await databaseApi.setAutoVolumeConfig(hostUid, dbname, payload);
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update auto volume config');
    }
  }
);

// Helper to parse the shared response format
const parseDbResponse = (state, payload) => {
  // Only update if the payload actually contains the database info
  // Some APIs might return success without the full list
  const dbsFound = payload.dblist?.dbs;
  const activeFound = payload.activelist?.active;

  if (dbsFound) {
    const newDbs = dbsFound;
    if (JSON.stringify(state.databases) !== JSON.stringify(newDbs)) {
      state.databases = newDbs;
    }
  }

  if (activeFound) {
    const newActive = activeFound.map(d => d.dbname);
    if (JSON.stringify(state.activeDatabases) !== JSON.stringify(newActive)) {
      state.activeDatabases = newActive;
    }
  }

  // Handle selectedDatabase re-validation only if we actually got databases
  if (dbsFound) {
    const exists = state.databases.find(db => db.dbname === state.selectedDatabase);
    if (!exists && state.databases.length > 0) {
      state.selectedDatabase = state.databases[0].dbname;
      state.selectedDatabaseSubItem = null;
    } else if (state.databases.length === 0) {
      state.selectedDatabase = null;
      state.selectedDatabaseSubItem = null;
    }
  }
};

const initialState = {
  databases: [],
  activeDatabases: [],
  selectedDatabase: null,
  selectedDatabaseSubItem: null,
  isUnloadDBModalOpen: false,
  isLoadDBModalOpen: false,
  isCheckDatabaseModalOpen: false,
  isCompactDatabaseModalOpen: false,
  isCopyDatabaseModalOpen: false,
  isBackupDatabaseModalOpen: false,
  isOptimizeDatabaseModalOpen: false,
  isAddBackupPlanModalOpen: false,
  isEditBackupPlanModalOpen: false,
  isDeleteBackupPlanModalOpen: false,
  isAutoBackupLogModalOpen: false,
  isLockInfoModalOpen: false,
  isAddQueryPlanModalOpen: false,
  isAutoQueryLogModalOpen: false,
  isSetAutomationVolumeModalOpen: false,
  isAutoVolumeLogModalOpen: false,
  isDatabaseInfoModalOpen: false,
  databaseInfoData: {}, // { [dbname]: {} }
  databaseInfoLoading: false,
  databaseInfoError: null,
  isPlanDumpModalOpen: false,
  planDumpData: {}, // { [dbname]: [] }
  planDumpLoading: false,
  planDumpError: null,
  
  autoBackupLogs: [],
  queryPlanLogs: [],
  autoVolumeLogs: [],
  autoVolumeConfig: {}, // { [dbname]: {} }
  autoVolumeLoading: false,
  logsLoading: false,
  logsError: null,

  isUnloadResultModalOpen: false,
  isTransactionInfoModalOpen: false,
  isKillTransactionModalOpen: false,
  isDatabasePropertyModalOpen: false,
  isRenameDatabaseModalOpen: false,
  isAddVolumeModalOpen: false,
  killTransactionData: null,
  unloadResultData: null,
  databaseClasses: {}, // { [dbname]: {} }
  databaseClassesLoading: {},
  databaseClassesError: {},
  backupSchedules: {}, // { [dbname]: [] }
  backupSchedulesLoading: {},
  queryPlans: {}, // { [dbname]: [] }
  queryPlansLoading: {},
  selectedBackupId: null,
  selectedQueryPlanId: null,
  dashboardData: {}, // { [dbname]: { volumes: [], spaceInfo: [], locks: [] } }
  dashboardLoading: {},
  dashboardError: {},
  volumes: [],
  isCreateDatabaseModalOpen: false,
  loading: false,
  volumesLoading: false,
  actionLoading: false, // Separate loading for start/stop operations
  error: null,
};

const databaseSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {
    setSelectedDatabase: (state, action) => {
      if (state.selectedDatabase !== action.payload) {
        state.selectedDatabase = action.payload;
        state.selectedDatabaseSubItem = null; // Clear sub-item when switching DBs unless we click the parent
      }
    },
    setSelectedDatabaseSubItem: (state, action) => {
      // payload should be something like 'Users', 'Logs', etc.
      state.selectedDatabaseSubItem = action.payload;
    },
    openUnloadDBModal: (state) => {
      state.isUnloadDBModalOpen = true;
    },
    closeUnloadDBModal: (state) => {
      state.isUnloadDBModalOpen = false;
    },
    openLoadDBModal: (state) => {
      state.isLoadDBModalOpen = true;
    },
    closeLoadDBModal: (state) => {
      state.isLoadDBModalOpen = false;
    },
    openCheckDatabaseModal: (state) => {
      state.isCheckDatabaseModalOpen = true;
    },
    closeCheckDatabaseModal: (state) => {
      state.isCheckDatabaseModalOpen = false;
    },
    openCompactDatabaseModal: (state) => {
      state.isCompactDatabaseModalOpen = true;
    },
    closeCompactDatabaseModal: (state) => {
      state.isCompactDatabaseModalOpen = false;
    },
    openCopyDatabaseModal: (state) => {
      state.isCopyDatabaseModalOpen = true;
    },
    closeCopyDatabaseModal: (state) => {
      state.isCopyDatabaseModalOpen = false;
    },
    openBackupDatabaseModal: (state) => {
      state.isBackupDatabaseModalOpen = true;
    },
    closeBackupDatabaseModal: (state) => {
      state.isBackupDatabaseModalOpen = false;
    },
    openOptimizeDatabaseModal: (state) => {
      state.isOptimizeDatabaseModalOpen = true;
    },
    closeOptimizeDatabaseModal: (state) => {
      state.isOptimizeDatabaseModalOpen = false;
    },
    openAddBackupPlanModal: (state) => {
      state.isAddBackupPlanModalOpen = true;
      state.error = null;
    },
    closeAddBackupPlanModal: (state) => {
      state.isAddBackupPlanModalOpen = false;
      state.error = null;
    },
    openEditBackupPlanModal: (state) => {
      state.isEditBackupPlanModalOpen = true;
      state.error = null;
    },
    closeEditBackupPlanModal: (state) => {
      state.isEditBackupPlanModalOpen = false;
      state.error = null;
    },
    openDeleteBackupPlanModal: (state) => {
      state.isDeleteBackupPlanModalOpen = true;
    },
    closeDeleteBackupPlanModal: (state) => {
      state.isDeleteBackupPlanModalOpen = false;
    },
    openAutoBackupLogModal: (state) => {
      state.isAutoBackupLogModalOpen = true;
    },
    closeAutoBackupLogModal: (state) => {
      state.isAutoBackupLogModalOpen = false;
    },
    openAddQueryPlanModal: (state) => {
      state.isAddQueryPlanModalOpen = true;
      state.error = null;
    },
    closeAddQueryPlanModal: (state) => {
      state.isAddQueryPlanModalOpen = false;
      state.error = null;
    },
    openAutoQueryLogModal: (state) => {
      state.isAutoQueryLogModalOpen = true;
    },
    closeAutoQueryLogModal: (state) => {
      state.isAutoQueryLogModalOpen = false;
    },
    openLockInfoModal: (state) => {
      state.isLockInfoModalOpen = true;
    },
    closeLockInfoModal: (state) => {
      state.isLockInfoModalOpen = false;
    },
    openUnloadResultModal: (state, action) => {
      state.isUnloadResultModalOpen = true;
      state.unloadResultData = action.payload;
    },
    closeUnloadResultModal: (state) => {
      state.isUnloadResultModalOpen = false;
      state.unloadResultData = null;
    },
    openDatabaseInfoModal: (state, action) => {
      state.isDatabaseInfoModalOpen = true;
      if (action.payload) state.selectedDatabase = action.payload;
    },
    closeDatabaseInfoModal: (state) => {
      state.isDatabaseInfoModalOpen = false;
      state.databaseInfoError = null;
    },
    openPlanDumpModal: (state, action) => {
      state.isPlanDumpModalOpen = true;
      state.planDumpError = null;
      if (action.payload) state.selectedDatabase = action.payload;
    },
    closePlanDumpModal: (state) => {
      state.isPlanDumpModalOpen = false;
      state.planDumpError = null;
    },
    openTransactionInfoModal: (state) => {
      state.isTransactionInfoModalOpen = true;
    },
    closeTransactionInfoModal: (state) => {
      state.isTransactionInfoModalOpen = false;
    },
    openKillTransactionModal: (state, action) => {
      state.isKillTransactionModalOpen = true;
      state.killTransactionData = action.payload;
    },
    closeKillTransactionModal: (state) => {
      state.isKillTransactionModalOpen = false;
      state.killTransactionData = null;
    },
    openDeleteDBModal: (state) => {
      state.isDeleteDBModalOpen = true;
    },
    closeDeleteDBModal: (state) => {
      state.isDeleteDBModalOpen = false;
    },
    openDatabasePropertyModal: (state) => {
      state.isDatabasePropertyModalOpen = true;
    },
    closeDatabasePropertyModal: (state) => {
      state.isDatabasePropertyModalOpen = false;
    },
    openRenameDatabaseModal: (state) => {
      state.isRenameDatabaseModalOpen = true;
    },
    closeRenameDatabaseModal: (state) => {
      state.isRenameDatabaseModalOpen = false;
    },
    openAddVolumeModal: (state) => {
      state.isAddVolumeModalOpen = true;
    },
    closeAddVolumeModal: (state) => {
      state.isAddVolumeModalOpen = false;
    },
    setSelectedBackupId: (state, action) => {
      state.selectedBackupId = action.payload;
    },
    clearSelectedBackupId: (state) => {
      state.selectedBackupId = null;
    },
    setSelectedQueryPlanId: (state, action) => {
      state.selectedQueryPlanId = action.payload;
    },
    clearSelectedQueryPlanId: (state) => {
      state.selectedQueryPlanId = null;
    },
    openCreateDatabaseModal: (state) => {
      state.isCreateDatabaseModalOpen = true;
    },
    closeCreateDatabaseModal: (state) => {
      state.isCreateDatabaseModalOpen = false;
    },
    openSetAutomationVolumeModal: (state) => {
      state.isSetAutomationVolumeModalOpen = true;
    },
    closeSetAutomationVolumeModal: (state) => {
      state.isSetAutomationVolumeModalOpen = false;
    },
    openAutoVolumeLogModal: (state) => {
      state.isAutoVolumeLogModalOpen = true;
    },
    closeAutoVolumeLogModal: (state) => {
      state.isAutoVolumeLogModalOpen = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch start-info
      .addCase(fetchDatabaseStartInfo.pending, (state, action) => {
        if (!action.meta.arg?.isBackground) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchDatabaseStartInfo.fulfilled, (state, action) => {
        state.loading = false;
        parseDbResponse(state, action.payload);
      })
      .addCase(fetchDatabaseStartInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.databases = [];
        state.activeDatabases = [];
      })
      // Start database
      .addCase(startDatabase.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(startDatabase.fulfilled, (state, action) => {
        state.actionLoading = false;
        parseDbResponse(state, action.payload);
      })
      .addCase(startDatabase.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Stop database
      .addCase(stopDatabase.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(stopDatabase.fulfilled, (state, action) => {
        state.actionLoading = false;
        parseDbResponse(state, action.payload);
      })
      .addCase(stopDatabase.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Fetch volumes
      .addCase(fetchDatabaseVolumes.pending, (state, action) => {
        if (!action.meta.arg?.isBackground) {
          state.volumesLoading = true;
        }
      })
      .addCase(fetchDatabaseVolumes.fulfilled, (state, action) => {
        state.volumesLoading = false;
        const newVolumes = action.payload;
        if (JSON.stringify(state.volumes) !== JSON.stringify(newVolumes)) {
          state.volumes = newVolumes;
        }
      })
      .addCase(fetchDatabaseVolumes.rejected, (state) => {
        state.volumesLoading = false;
      })
      // Delete database
      .addCase(deleteDatabase.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteDatabase.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.isDeleteDBModalOpen = false;
        parseDbResponse(state, action.payload);
      })
      .addCase(deleteDatabase.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Fetch database classes
      .addCase(fetchDatabaseClasses.pending, (state, action) => {
        const { dbname } = action.meta.arg;
        state.databaseClassesLoading[dbname] = true;
        delete state.databaseClassesError[dbname];
      })
      .addCase(addBackupSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addBackupSchedule.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(addBackupSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(editBackupSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editBackupSchedule.fulfilled, (state) => {
        state.loading = false;
        state.isEditBackupPlanModalOpen = false;
      })
      .addCase(editBackupSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBackupSchedule.pending, (state, action) => {
        const { dbname } = action.meta.arg;
        state.backupSchedulesLoading[dbname] = true;
        state.error = null;
      })
      .addCase(fetchBackupSchedule.fulfilled, (state, action) => {
        const { dbname } = action.meta.arg;
        state.backupSchedulesLoading[dbname] = false;
        const data = action.payload;
        // User provided format uses "backups" field
        if (data && data.backups) {
          state.backupSchedules[dbname] = Array.isArray(data.backups) 
            ? data.backups 
            : [data.backups];
        } else if (data && data.backup_info) {
          // Fallback for previous format just in case
          state.backupSchedules[dbname] = Array.isArray(data.backup_info) 
            ? data.backup_info 
            : [data.backup_info];
        } else {
          state.backupSchedules[dbname] = [];
        }
      })
      .addCase(fetchBackupSchedule.rejected, (state, action) => {
        const { dbname } = action.meta.arg;
        state.backupSchedulesLoading[dbname] = false;
        state.error = action.payload;
      })
      .addCase(deleteBackupSchedule.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteBackupSchedule.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteBackupSchedule.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Optimize database
      .addCase(optimizeDatabase.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(optimizeDatabase.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(optimizeDatabase.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Rename database
      .addCase(renameDatabase.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(renameDatabase.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.isRenameDatabaseModalOpen = false;
        parseDbResponse(state, action.payload);
      })
      .addCase(renameDatabase.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })
      // Add volume
      .addCase(addVolume.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addVolume.fulfilled, (state) => {
        state.loading = false;
        state.isAddVolumeModalOpen = false;
      })
      .addCase(addVolume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchDatabaseClasses.fulfilled, (state, action) => {
        const { dbname, data } = action.payload;
        state.databaseClassesLoading[dbname] = false;
        state.databaseClasses[dbname] = data;
      })
      .addCase(fetchDatabaseClasses.rejected, (state, action) => {
        const { dbname, error } = action.payload || action.meta.arg;
        state.databaseClassesLoading[dbname] = false;
        state.databaseClassesError[dbname] = error;
      })
      .addCase(fetchAutoBackupLog.pending, (state) => {
        state.logsLoading = true;
        state.logsError = null;
      })
      .addCase(fetchAutoBackupLog.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.autoBackupLogs = action.payload;
      })
      .addCase(fetchAutoBackupLog.rejected, (state, action) => {
        state.logsLoading = false;
        state.logsError = action.payload;
      })
      // Fetch Query Plan
      .addCase(fetchQueryPlan.pending, (state, action) => {
        const { dbname } = action.meta.arg;
        state.queryPlansLoading[dbname] = true;
      })
      .addCase(fetchQueryPlan.fulfilled, (state, action) => {
        const { dbname, data } = action.payload;
        state.queryPlansLoading[dbname] = false;
        state.queryPlans[dbname] = data;
      })
      .addCase(fetchQueryPlan.rejected, (state, action) => {
        const { dbname } = action.meta.arg;
        state.queryPlansLoading[dbname] = false;
      })
      // Set Auto Exec Query
      .addCase(setAutoExecQuery.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setAutoExecQuery.fulfilled, (state) => {
        state.loading = false;
        state.isAddQueryPlanModalOpen = false;
      })
      .addCase(setAutoExecQuery.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Query Plan Log
      .addCase(fetchQueryPlanLog.pending, (state) => {
        state.logsLoading = true;
        state.logsError = null;
      })
      .addCase(fetchQueryPlanLog.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.queryPlanLogs = action.payload;
      })
      .addCase(fetchQueryPlanLog.rejected, (state, action) => {
        state.logsLoading = false;
        state.logsError = action.payload;
      })
      // Fetch Dashboard Data
      .addCase(fetchDashboardData.pending, (state, action) => {
        const { dbname } = action.meta.arg;
        state.dashboardLoading[dbname] = true;
        delete state.dashboardError[dbname];
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        const { dbname, volumeInfo, lockInfo, statDump, brokersCAS } = action.payload;
        state.dashboardLoading[dbname] = false;
        
        state.dashboardData[dbname] = {
          volumes: volumeInfo.spaceinfo || [],
          spaceInfo: volumeInfo.fileinfo || [],
          locks: lockInfo.lockinfo?.[0]?.transaction || [],
          performance: statDump || {},
          brokersCAS: brokersCAS || []
        };
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        const { dbname } = action.meta.arg;
        state.dashboardLoading[dbname] = false;
        state.dashboardError[dbname] = action.payload;
      })
      .addCase(fetchDatabaseParamDump.pending, (state) => {
        state.databaseInfoLoading = true;
        state.databaseInfoError = null;
      })
      .addCase(fetchDatabaseParamDump.fulfilled, (state, action) => {
        const { dbname, data } = action.payload;
        state.databaseInfoLoading = false;
        state.databaseInfoData[dbname] = data;
      })
      .addCase(fetchDatabaseParamDump.rejected, (state, action) => {
        state.databaseInfoLoading = false;
        state.databaseInfoError = action.payload;
      })
      // Plan Dump
      .addCase(fetchDatabasePlanDump.pending, (state) => {
        state.planDumpLoading = true;
        state.planDumpError = null;
      })
      .addCase(fetchDatabasePlanDump.fulfilled, (state, action) => {
        const { dbname, data } = action.payload;
        state.planDumpLoading = false;
        state.planDumpData[dbname] = data;
      })
      .addCase(fetchDatabasePlanDump.rejected, (state, action) => {
        state.planDumpLoading = false;
        state.planDumpError = action.payload;
      })
      // Auto Volume Log
      .addCase(fetchAutoVolumeLog.pending, (state) => {
        state.logsLoading = true;
        state.logsError = null;
      })
      .addCase(fetchAutoVolumeLog.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.autoVolumeLogs = action.payload;
      })
      .addCase(fetchAutoVolumeLog.rejected, (state, action) => {
        state.logsLoading = false;
        state.logsError = action.payload;
      })
      // Auto Volume Config
      .addCase(fetchAutoVolumeConfig.pending, (state) => {
        state.autoVolumeLoading = true;
      })
      .addCase(fetchAutoVolumeConfig.fulfilled, (state, action) => {
        const { dbname, data } = action.payload;
        state.autoVolumeLoading = false;
        state.autoVolumeConfig[dbname] = data;
      })
      .addCase(fetchAutoVolumeConfig.rejected, (state) => {
        state.autoVolumeLoading = false;
      })
      // Update Auto Volume Config
      .addCase(updateAutoVolumeConfig.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateAutoVolumeConfig.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateAutoVolumeConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setSelectedDatabase, 
  setSelectedDatabaseSubItem,
  openUnloadDBModal, 
  closeUnloadDBModal,
  openLoadDBModal,
  closeLoadDBModal,
  openCheckDatabaseModal,
  closeCheckDatabaseModal,
  openCompactDatabaseModal,
  closeCompactDatabaseModal,
  openCopyDatabaseModal,
  closeCopyDatabaseModal,
  openBackupDatabaseModal,
  closeBackupDatabaseModal,
  openOptimizeDatabaseModal,
  closeOptimizeDatabaseModal,
  openAddBackupPlanModal,
  closeAddBackupPlanModal,
  openEditBackupPlanModal,
  closeEditBackupPlanModal,
  openDeleteBackupPlanModal,
  closeDeleteBackupPlanModal,
  openAutoBackupLogModal,
  closeAutoBackupLogModal,
  openLockInfoModal,
  closeLockInfoModal,
  openUnloadResultModal,
  closeUnloadResultModal,
  openTransactionInfoModal,
  closeTransactionInfoModal,
  openKillTransactionModal,
  closeKillTransactionModal,
  openDeleteDBModal,
  closeDeleteDBModal,
  openDatabasePropertyModal,
  closeDatabasePropertyModal,
  openRenameDatabaseModal,
  closeRenameDatabaseModal,
  openAddVolumeModal,
  closeAddVolumeModal,
  openDatabaseInfoModal,
  closeDatabaseInfoModal,
  openPlanDumpModal,
  closePlanDumpModal,
  openAddQueryPlanModal,
  closeAddQueryPlanModal,
  openAutoQueryLogModal,
  closeAutoQueryLogModal,
  setSelectedBackupId,
  clearSelectedBackupId,
  setSelectedQueryPlanId,
  openCreateDatabaseModal,
  closeCreateDatabaseModal,
  openSetAutomationVolumeModal,
  closeSetAutomationVolumeModal,
  openAutoVolumeLogModal,
  closeAutoVolumeLogModal
} = databaseSlice.actions;

export default databaseSlice.reducer;

