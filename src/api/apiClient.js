import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://100.72.152.120:8081',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Initialize token from localStorage on app load
const initialToken = localStorage.getItem('token');
if (initialToken) {
  setAuthToken(initialToken);
}

// Track continuous auth failures per host to avoid infinite fetch/revoke loops
const failedRevokeAttempts = new Map();

// Response interceptor (e.g. handle 401)
apiClient.interceptors.response.use(
  (response) => {
    // Backend always returns { data: {...}, status: 200, note: "success" }
    // Unwrap the top level structure automatically
    const urlParts = response.config?.url?.split('/');
    const possibleHostUid = urlParts && urlParts[1];

    // Reset the fail counter if a request to this host succeeds
    if (possibleHostUid && failedRevokeAttempts.has(possibleHostUid)) {
      failedRevokeAttempts.delete(possibleHostUid);
    }

    return response.data?.data || response.data;
  },
  (error) => {
    const apiData = error.response?.data;

    // Handle generic unauthorized
    if (error.response?.status === 401) {
      console.warn('Unauthorized. Redirecting to login...');
      localStorage.removeItem('token');
      // Forcing standard reload to kick the router to /login without React cyclic redundancy
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle specific host session expiry
    if (apiData?.note === 'INVALID_TOKEN') {
      const urlParts = error.config?.url?.split('/');
      // e.g. /host-uid-1/database/start-info -> target URL starts with / so index 1 is the host UID
      const possibleHostUid = urlParts && urlParts[1];

      if (possibleHostUid) {
        const attempts = (failedRevokeAttempts.get(possibleHostUid) || 0) + 1;
        failedRevokeAttempts.set(possibleHostUid, attempts);

        if (attempts <= 2) {
          console.warn(`Host session expired for ${possibleHostUid} (Attempt ${attempts}). Revoking access...`);
          import('../app/store').then(({ store }) => {
            import('../features/host/hostSlice').then(({ revokeHostLogin }) => {
              store.dispatch(revokeHostLogin(possibleHostUid));
            });
          });
        } else {
          console.error(`Host session for ${possibleHostUid} failed to authorize after ${attempts} attempts. Aborting endless retry loop.`);
        }
      }
    }

    // Standardize the error message into apiData.message so all components get it automatically
    if (apiData) {
      apiData.message = apiData.data?.title || apiData.note || apiData.message || 'An unexpected error occurred';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
