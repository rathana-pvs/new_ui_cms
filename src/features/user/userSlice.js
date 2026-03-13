import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userApi } from './userApi';

export const fetchPreferences = createAsyncThunk(
  'user/fetchPreferences',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userApi.getPreferences();
      return response;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch preferences');
    }
  }
);

export const updatePreferences = createAsyncThunk(
  'user/updatePreferences',
  async (preferences, { rejectWithValue }) => {
    try {
      const response = await userApi.updatePreferences(preferences);
      return preferences;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update preferences');
    }
  }
);

const initialState = {
  isProfileOpen: false,
  profile: {
    fullName: 'Admin User',
    email: 'admin@cubrid.com',
    role: 'Database Administrator',
    phone: '+1 (555) 123-4567',
    department: 'Engineering',
    timezone: 'UTC+7',
  },
  preferences: {
    dashboardInterval: 0,
    brokerStatusInterval: 0,
  },
  preferencesLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    openProfileModal: (state) => {
      state.isProfileOpen = true;
    },
    closeProfileModal: (state) => {
      state.isProfileOpen = false;
    },
    updateProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPreferences.pending, (state) => {
        state.preferencesLoading = true;
      })
      .addCase(fetchPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload;
      })
      .addCase(fetchPreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.error = action.payload;
      })
      .addCase(updatePreferences.pending, (state) => {
        state.preferencesLoading = true;
      })
      .addCase(updatePreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload;
      })
      .addCase(updatePreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  openProfileModal,
  closeProfileModal,
  updateProfile,
  clearUserError,
} = userSlice.actions;

export default userSlice.reducer;
