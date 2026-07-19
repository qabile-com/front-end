import { httpClient } from './http-client';
import type { AxiosResponse } from 'axios';

export interface OtpRequestResponse {
  success: boolean;
  message: string;
  expiresInSeconds: number;
  developmentCode?: number;
}

export interface OtpVerifyResponse {
  accessToken: string;
  tokenType: string;
  expiresInSeconds: number;
  user: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
    role: string;
  };
}

export const requestOtp = (identifier: string) =>
  httpClient.post<any, AxiosResponse<OtpRequestResponse>>('/api/v1/auth/otp/request', {
    identifier,
  });

export const verifyOtp = (identifier: string, code: string, name?: string) =>
  httpClient.post<any, AxiosResponse<OtpVerifyResponse>>('/api/v1/auth/otp/verify', {
    identifier,
    code,
    name,
  });

export const getMe = () => httpClient.get<any, AxiosResponse<OtpVerifyResponse>>('/api/v1/auth/me');
