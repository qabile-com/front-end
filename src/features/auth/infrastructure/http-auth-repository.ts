import type {
  IAuthRepository,
  AuthSession,
  AuthUser,
  VerifyOtpResult,
} from '../domain/auth-repository';
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
  ): Promise<VerifyOtpResult> {
    const response = await authApi.verifyOtp(identifier, code, name, lastName);
    return {
      accessToken: response.data.accessToken,
      tokenType: response.data.tokenType,
      expiresAt: response.data.expiresAt,
      refreshToken: response.data.refreshToken,
      user: response.data.user,
      isNewUser: response.data.isNewUser,
      signupReward: response.data.signupReward,
      unlockedAchievements: response.data.unlockedAchievements,
    };
  }

  async getMe(): Promise<AuthUser> {
    const response = await authApi.getMe();
    return response.data.user;
  }
}
