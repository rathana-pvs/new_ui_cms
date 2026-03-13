import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { databaseApi } from './databaseApi';

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

// Helper to parse the shared response format
const parseDbResponse = (state, payload) => {
  const newDbs = payload.dblist?.dbs || [];
  const newActive = payload.activelist?.active?.map(d => d.dbname) || [];

  // Referential stability check: Only update if content changed
  if (JSON.stringify(state.databases) !== JSON.stringify(newDbs)) {
    state.databases = newDbs;
  }
  
  if (JSON.stringify(state.activeDatabases) !== JSON.stringify(newActive)) {
    state.activeDatabases = newActive;
  }

  const exists = state.databases.find(db => db.dbname === state.selectedDatabase);
  if (!exists && state.databases.length > 0) {
    state.selectedDatabase = state.databases[0].dbname;
    state.selectedDatabaseSubItem = null;
  } else if (state.databases.length === 0) {
    state.selectedDatabase = null;
    state.selectedDatabaseSubItem = null;
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
  isLockInfoModalOpen: false,
  isUnloadResultModalOpen: false,
  isTransactionInfoModalOpen: false,
  isKillTransactionModalOpen: false,
  isDeleteDBModalOpen: false,
  killTransactionData: null,
  unloadResultData: null,
  volumes: [],
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
  openLockInfoModal,
  closeLockInfoModal,
  openUnloadResultModal,
  closeUnloadResultModal,
  openTransactionInfoModal,
  closeTransactionInfoModal,
  openKillTransactionModal,
  closeKillTransactionModal,
  openDeleteDBModal,
  closeDeleteDBModal
} = databaseSlice.actions;

export default databaseSlice.reducer;

