import axios from 'axios';
import {
  clearAuthSession,
  getAccessToken,
  getRefreshToken,
  getStoredAuthSession,
  updateStoredTokens,
} from '@/core/auth/token';
import { publicEnv } from '@/core/config/public-env';

export class ApiError extends Error {
  statusCode?: number;
  error?: string;
  path?: string;
  requestId?: string;
  isAuthSessionInvalid?: boolean;

  constructor(message: string, details: Partial<ApiError> = {}) {
    super(message);
    this.name = 'ApiError';
    Object.assign(this, details);
  }
}

const apiBaseUrl = publicEnv.apiBaseUrl;

const httpClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (isFormData(config.data)) {
    delete config.headers['Content-Type'];
    delete config.headers['content-type'];
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
              `${apiBaseUrl}/api/v1/auth/refresh`,
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

      const data = error.response.data;
      const message = Array.isArray(data?.message)
        ? data.message.join('، ')
        : data?.message || error.message;
      const sessionInvalid = isInvalidAuthSessionResponse(
        error.response.status,
        message,
        data?.path,
      );

      if (error.response.status === 401 || sessionInvalid) {
        clearAuthSession();
      }

      return Promise.reject(
        new ApiError(sessionInvalid ? 'نشست تو معتبر نیست. لطفاً دوباره وارد شو.' : message, {
          statusCode: sessionInvalid ? 401 : (data?.statusCode ?? error.response.status),
          error: data?.error,
          path: data?.path,
          requestId: data?.requestId,
          isAuthSessionInvalid: sessionInvalid,
        }),
      );
    }
    return Promise.reject(error);
  },
);

export { httpClient };

function isInvalidAuthSessionResponse(statusCode: number, message?: string, path?: string) {
  if (statusCode === 401) return true;
  if (statusCode !== 404) return false;

  const normalizedMessage = (message ?? '').toLowerCase();
  const normalizedPath = path ?? '';
  const isCurrentUserEndpoint =
    normalizedPath.includes('/auth/me') ||
    normalizedPath.includes('/users/me') ||
    normalizedPath.includes('/dashboard');

  if (isCurrentUserEndpoint) return true;

  const storedUserId = getStoredAuthSession()?.user?.id;
  if (!storedUserId) return false;

  return normalizedMessage.includes(storedUserId.toLowerCase());
}

function isFormData(value: unknown): value is FormData {
  return typeof FormData !== 'undefined' && value instanceof FormData;
}
