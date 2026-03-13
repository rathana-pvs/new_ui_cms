import apiClient from '../../api/apiClient';

export const userApi = {
  getPreferences: () => {
    return apiClient.get('/user/preferences');
  },
  updatePreferences: (preferences) => {
    return apiClient.put('/user/preferences', preferences);
  },
};
