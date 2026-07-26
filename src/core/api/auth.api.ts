import { httpClient } from './http-client';

export interface OtpRequestResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
  expiresInSeconds?: number;
  developmentCode?: number;
}

export interface OtpVerifyResponse {
  accessToken: string;
  tokenType?: string;
  expiresAt?: string | number;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    phone?: string | null;
    email?: string | null;
    role: string;
  };
  isNewUser?: boolean;
  signupReward?: {
    xpGranted: number;
    ruleCode: string;
    ruleTitle: string;
  };
  unlockedAchievements?: unknown[];
}

export interface LoginResponse extends Partial<OtpVerifyResponse> {
  mode?: 'otp' | 'password';
  success: boolean;
  message?: string;
  expiresIn?: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string | number;
}

export interface ForgotPasswordVerifyResponse {
  verificationToken: string;
}

export const requestOtp = (email: string) =>
  httpClient.post<OtpRequestResponse>('/api/v1/auth/otp/request', {
    email,
  });

export const login = (email: string, password?: string) =>
  httpClient.post<LoginResponse>('/api/v1/auth/login', {
    email,
    ...(password ? { password } : {}),
  });

export const verifyOtp = (email: string, code: string, name?: string, lastName?: string) =>
  httpClient.post<OtpVerifyResponse>('/api/v1/auth/otp/verify', {
    email,
    code,
    name,
    lastName,
  });

export const getMe = () => httpClient.get<OtpVerifyResponse>('/api/v1/auth/me');

export const refreshAuth = (refreshToken: string) =>
  httpClient.post<RefreshTokenResponse>('/api/v1/auth/refresh', { refreshToken });

export const logout = (refreshToken: string) =>
  httpClient.post<{ success: boolean }>('/api/v1/auth/logout', { refreshToken });

export const requestForgotPassword = (email: string) =>
  httpClient.post<{ success: boolean; message?: string }>('/api/v1/auth/password/forgot/request', {
    email,
  });

export const verifyForgotPassword = (email: string, code: string) =>
  httpClient.post<ForgotPasswordVerifyResponse>('/api/v1/auth/password/forgot/verify', {
    email,
    code,
  });

export const resetPassword = (
  verificationToken: string,
  password: string,
  passwordConfirmation: string,
) =>
  httpClient.post<{ success: boolean }>('/api/v1/auth/password/reset', {
    verificationToken,
    password,
    passwordConfirmation,
  });
