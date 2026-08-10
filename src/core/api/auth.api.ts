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
  accessTokenExpiredAt?: string | number;
  refreshToken?: string;
  refreshTokenExpiredAt?: string | number;
  user: {
    id: string;
    name?: string;
    firstName?: string | null;
    lastName?: string | null;
    displayName?: string | null;
    username?: string | null;
    avatar?: string | null;
    phone?: string | null;
    email?: string | null;
    role: string;
    title?: string;
    level?: number;
    xp?: number;
    xpMax?: number;
    streak?: number;
    isCompleteOnboarding?: boolean;
  };
  isNewUser?: boolean;
  signupReward?: {
    xpGranted: number;
    ruleCode: string;
    ruleTitle: string;
  };
  firstLoginReward?: {
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
  accessTokenExpiredAt?: string | number;
  refreshTokenExpiredAt?: string | number;
}

export interface ForgotPasswordVerifyResponse {
  verificationToken: string;
}

export interface GoogleLoginRequest {
  accessToken?: string;
  referralCode?: string;
  refreshToken?: string;
  code?: string;
  tokenType?: string;
  expiresIn?: number;
  scope?: string;
  googleAvatarUrl?: string;
}

export const requestOtp = (email: string, referralCode?: string) =>
  httpClient.post<OtpRequestResponse>('/api/v1/auth/otp/request', {
    email,
    ...(referralCode?.trim() ? { referralCode: referralCode.trim() } : {}),
  });

export const login = (email: string, password?: string) =>
  httpClient.post<LoginResponse>('/api/v1/auth/login', {
    email,
    ...(password ? { password } : {}),
  });

export const loginWithGoogle = (payload: GoogleLoginRequest) =>
  httpClient.post<OtpVerifyResponse>(
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_EXCHANGE_ENDPOINT || '/api/v1/auth/google',
    {
      accessToken: payload.accessToken,
      ...(payload.referralCode?.trim() ? { referralCode: payload.referralCode.trim() } : {}),
    },
  );

export const validateReferralCode = (referralCode: string) =>
  httpClient.get<{ valid: boolean }>(
    `/api/v1/auth/referral-codes/${encodeURIComponent(referralCode.trim())}/validate`,
  );

export const verifyOtp = (email: string, code: string, referralCode?: string) =>
  httpClient.post<OtpVerifyResponse>('/api/v1/auth/otp/verify', {
    email,
    code,
    ...(referralCode?.trim() ? { referralCode: referralCode.trim() } : {}),
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
  httpClient.post<{ success: boolean; message?: string }>('/api/v1/auth/password/reset', {
    verificationToken,
    password,
    passwordConfirmation,
  });
