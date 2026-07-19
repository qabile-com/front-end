import type { IAuthRepository, AuthUser } from '../domain/auth-repository';
import * as authApi from '@/core/api/auth.api';
import { setAccessToken } from '@/core/auth/token';

export class HttpAuthRepository implements IAuthRepository {
  async requestOtp(identifier: string): Promise<void> {
    await authApi.requestOtp(identifier);
  }

  async verifyOtp(identifier: string, code: string, name?: string): Promise<AuthUser> {
    const response = await authApi.verifyOtp(identifier, code, name);
    setAccessToken(response.data.accessToken);
    return response.data.user;
  }

  async getMe(): Promise<AuthUser> {
    const response = await authApi.getMe();
    return response.data.user;
  }
}
