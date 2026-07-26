import type {
  IAuthRepository,
  AuthUser,
  VerifyOtpResult,
} from '../domain/auth-repository';
import * as authApi from '@/core/api/auth.api';

export class HttpAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<VerifyOtpResult> {
    const response = await authApi.login(email, password);
    if (!response.data.accessToken || !response.data.user) {
      throw new Error(response.data.message ?? 'ورود با رمز عبور کامل نشد');
    }

    return {
      accessToken: response.data.accessToken,
      expiresAt: response.data.expiresAt,
      refreshToken: response.data.refreshToken,
      user: response.data.user,
    };
  }

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

  async requestForgotPassword(email: string): Promise<void> {
    await authApi.requestForgotPassword(email);
  }

  async verifyForgotPassword(email: string, code: string): Promise<{ verificationToken: string }> {
    const response = await authApi.verifyForgotPassword(email, code);
    return response.data;
  }

  async resetPassword(
    verificationToken: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<void> {
    await authApi.resetPassword(verificationToken, password, passwordConfirmation);
  }
}
