import { createSlice } from '@reduxjs/toolkit';

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
  },
});

export const {
  openProfileModal,
  closeProfileModal,
  updateProfile,
} = userSlice.actions;

export default userSlice.reducer;
