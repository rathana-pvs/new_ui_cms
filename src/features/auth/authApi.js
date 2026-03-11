import apiClient from '../../api/apiClient';

export const authApi = {
  register: (id, password) => {
    return apiClient.post('/auth/register', { id, password });
  },

  login: (id, password) => {
    return apiClient.post('/auth/login', { id, password });
  },
};
