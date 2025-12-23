import axios from 'axios';

// Prefer explicit REACT_APP_API_URL; fallback to localhost:22222 which is
// the backend port used during local development in this workspace.
const envUrl = process.env.REACT_APP_API_URL && process.env.REACT_APP_API_URL.trim() ? process.env.REACT_APP_API_URL.trim() : null;
const defaultDev = typeof window !== 'undefined' ? 'http://localhost:22222' : '';
const apiUrl = envUrl || defaultDev;

if (!envUrl) {
  // eslint-disable-next-line no-console
  console.warn('[api] REACT_APP_API_URL is not set; falling back to', apiUrl);
}

const api = axios.create({
  baseURL: apiUrl,
  // you can set other defaults here
});

// Attach Authorization header from localStorage for admin requests
api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    // ignore (localStorage not available in some environments)
  }
  // Log the full request URL for easier debugging
  try {
    const fullUrl = config.baseURL ? `${config.baseURL.replace(/\/$/, '')}/${config.url.replace(/^\//, '')}` : config.url;
    // eslint-disable-next-line no-console
    console.debug('[api] Request:', config.method?.toUpperCase() || 'GET', fullUrl, { params: config.params, data: config.data });
  } catch (e) {}
  return config;
});

api.interceptors.response.use(
  (response) => {
    // eslint-disable-next-line no-console
    console.debug('[api] Response:', response.config?.url, response.status);
    return response;
  },
  (error) => {
    // eslint-disable-next-line no-console
    try {
      const url = error?.config?.url || error?.config?.baseURL || '(unknown)';
      const status = error?.response?.status;
      const data = error?.response?.data;
      console.error('[api] Response error:', url, status, data);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('[api] Response error (failed to stringify)', error);
    }
    return Promise.reject(error);
  }
);

export default api;
