import axios from 'axios';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  updateStoredTokens,
} from '@/core/auth/token';

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
  async (error) => {
    if (error.response) {
      const originalRequest = error.config;
      if (error.response.status === 401 && !originalRequest?._retry) {
        const refreshToken = getRefreshToken();
        if (refreshToken) {
          try {
            originalRequest._retry = true;
            const response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'}/api/v1/auth/refresh`,
              { refreshToken },
              { headers: { 'Content-Type': 'application/json' } },
            );
            updateStoredTokens(response.data);
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return httpClient(originalRequest);
          } catch {
            clearAuthSession();
          }
        }
      }

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
