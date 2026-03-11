import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { databaseApi } from './databaseApi';

export const fetchDatabaseStartInfo = createAsyncThunk(
  'database/fetchDatabaseStartInfo',
  async (hostUid, { rejectWithValue }) => {
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

// Helper to parse the shared response format
const parseDbResponse = (state, payload) => {
  state.databases = payload.dblist?.dbs || [];
  state.activeDatabases = payload.activelist?.active?.map(d => d.dbname) || [];

  const exists = state.databases.find(db => db.dbname === state.selectedDatabase);
  if (!exists && state.databases.length > 0) {
    state.selectedDatabase = state.databases[0].dbname;
  } else if (state.databases.length === 0) {
    state.selectedDatabase = null;
  }
};

const initialState = {
  databases: [],
  activeDatabases: [],
  selectedDatabase: null,
  isUnloadDBModalOpen: false,
  isLoadDBModalOpen: false,
  isCheckDatabaseModalOpen: false,
  isCompactDatabaseModalOpen: false,
  isCopyDatabaseModalOpen: false,
  isBackupDatabaseModalOpen: false,
  isLockInfoModalOpen: false,
  isUnloadResultModalOpen: false,
  unloadResultData: null,
  loading: false,
  actionLoading: false, // Separate loading for start/stop operations
  error: null,
};

const databaseSlice = createSlice({
  name: 'database',
  initialState,
  reducers: {
    setSelectedDatabase: (state, action) => {
      state.selectedDatabase = action.payload;
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
  },
  extraReducers: (builder) => {
    builder
      // Fetch start-info
      .addCase(fetchDatabaseStartInfo.pending, (state) => {
        state.loading = true;
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
      });
  },
});

export const { 
  setSelectedDatabase, 
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
  closeUnloadResultModal 
} = databaseSlice.actions;

export default databaseSlice.reducer;

