import axios from 'axios';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  updateStoredTokens,
} from '@/core/auth/token';

export class ApiError extends Error {
  statusCode?: number;
  error?: string;
  path?: string;
  requestId?: string;

  constructor(message: string, details: Partial<ApiError> = {}) {
    super(message);
    this.name = 'ApiError';
    Object.assign(this, details);
  }
}

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
            updateStoredTokens({
              accessToken: response.data.accessToken,
              refreshToken: response.data.refreshToken,
              expiresAt: response.data.accessTokenExpiredAt ?? response.data.expiresAt,
              refreshTokenExpiresAt: response.data.refreshTokenExpiredAt,
            });
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return httpClient(originalRequest);
          } catch {
            const currentToken = getAccessToken();
            const originalToken = originalRequest.headers.Authorization?.replace('Bearer ', '');
            if (currentToken && currentToken !== originalToken) {
              return Promise.reject(error);
            }
            clearAuthSession();
          }
        }
      }

      if (error.response.status === 401) {
        clearAuthSession();
      }
      const data = error.response.data;
      const message = Array.isArray(data?.message) ? data.message.join('، ') : data?.message || error.message;
      return Promise.reject(
        new ApiError(message, {
          statusCode: data?.statusCode ?? error.response.status,
          error: data?.error,
          path: data?.path,
          requestId: data?.requestId,
        }),
      );
    }
    return Promise.reject(error);
  },
);

export { httpClient };
