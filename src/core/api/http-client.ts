import axios from 'axios';
import { clearAuthSession, getAccessToken } from '@/core/auth/token';

const httpClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

httpClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        clearAuthSession();
      }
      const data = error.response.data;
      const message = data?.message || error.message;
      return Promise.reject(new Error(message));
    }
    return Promise.reject(error);
  },
);

export { httpClient };
