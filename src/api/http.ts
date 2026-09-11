import axios from 'axios';

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api/v1',
  headers: { Accept: 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('ffn_admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ffn_admin_token');
      localStorage.removeItem('ffn_admin_user');
      window.dispatchEvent(new Event('ffn:auth-expired'));
    }
    return Promise.reject(error);
  },
);
