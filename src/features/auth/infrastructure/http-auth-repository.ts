import type { IAuthRepository, AuthSession, AuthUser } from '../domain/auth-repository';
import * as authApi from '@/core/api/auth.api';

export class HttpAuthRepository implements IAuthRepository {
  async requestOtp(identifier: string): Promise<void> {
    await authApi.requestOtp(identifier);
  }

  async verifyOtp(
    identifier: string,
    code: string,
    name?: string,
    lastName?: string,
  ): Promise<AuthSession> {
    const response = await authApi.verifyOtp(identifier, code, name, lastName);
    return {
      accessToken: response.data.accessToken,
      tokenType: response.data.tokenType,
      expiresInSeconds: response.data.expiresInSeconds,
      user: response.data.user,
    };
  }

  async getMe(): Promise<AuthUser> {
    const response = await authApi.getMe();
    return response.data.user;
  }
}
