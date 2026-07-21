import { httpClient } from './http-client';

export interface OtpRequestResponse {
  success: boolean;
  message: string;
  expiresInSeconds: number;
  developmentCode?: number;
}

export interface OtpVerifyResponse {
  accessToken: string;
  tokenType?: string;
  expiresAt?: number;
  refreshToken?: string;
  user: {
    id: string;
    name: string;
    phone?: string | null;
    email: string;
    role: string;
  };
}

export const requestOtp = (email: string) =>
  httpClient.post<OtpRequestResponse>('/api/v1/auth/otp/request', {
    email,
  });

export const verifyOtp = (email: string, code: string, name?: string, lastName?: string) =>
  httpClient.post<OtpVerifyResponse>('/api/v1/auth/otp/verify', {
    email,
    code,
    name,
    lastName,
  });

export const getMe = () => httpClient.get<OtpVerifyResponse>('/api/v1/auth/me');
