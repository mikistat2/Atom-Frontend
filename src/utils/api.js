import axios from 'axios';

const normalizeBaseUrl = (value) => {
  const v = (value ?? '').trim();
  if (!v) return 'http://localhost:3000';
  const noTrailingSlash = v.endsWith('/') ? v.slice(0, -1) : v;
  if (noTrailingSlash.startsWith('http://') || noTrailingSlash.startsWith('https://')) return noTrailingSlash;
  return `http://${noTrailingSlash}`;
};

const baseURL = normalizeBaseUrl(import.meta.env.VITE_BACKEND_URL);

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teachhub_token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      localStorage.removeItem('teachhub_token');
      localStorage.removeItem('teachhub_user');
    }
    return Promise.reject(error);
  }
);
