import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // sends the httpOnly refreshToken cookie
});

// In-memory access token (never localStorage — keeps it out of reach of XSS)
let accessToken = null;
export function setAccessToken(token) {
  accessToken = token;
}
export function getAccessToken() {
  return accessToken;
}

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// If a request comes back 401 (expired access token), silently hit /auth/refresh
// once and retry the original request — this is what keeps a user "logged in"
// across page reloads and past the 15-minute access token expiry.

let refreshPromise = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    // 1. GUARD CLAUSE: If the failed request WAS the refresh endpoint itself,
    // stop immediately. Do not attempt to retry or let it loop.

    if (original.url.includes('/auth/refresh')) {
      setAccessToken(null);
      
      // Only redirect if we aren't already on the login page

      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // 2. Normal 401 retry logic for all other API endpoints
    
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios
            .post(`${API_URL}/auth/refresh`, {}, { withCredentials: true })
            .finally(() => (refreshPromise = null));
        }
        
        const { data } = await refreshPromise;
        setAccessToken(data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        
        return api(original);
      } catch (refreshErr) {
        setAccessToken(null);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshErr);
      }
    }
    
    return Promise.reject(error);
  }
);


export default api;
