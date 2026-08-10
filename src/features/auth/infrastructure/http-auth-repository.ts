import type {
  IAuthRepository,
  AuthUser,
  GoogleAuthPayload,
  VerifyOtpResult,
} from '../domain/auth-repository';
import * as authApi from '@/core/api/auth.api';
import type { OtpVerifyResponse } from '@/core/api/auth.api';
import { normalizeAchievements } from '@/features/dashboard/domain/achievement-normalizer';

export class HttpAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<VerifyOtpResult> {
    const response = await authApi.login(email, password);
    if (!response.data.accessToken || !response.data.user) {
      throw new Error(response.data.message ?? 'ورود با رمز عبور کامل نشد');
    }

    return mapAuthSession(response.data as OtpVerifyResponse);
  }

  async loginWithGoogle(payload: GoogleAuthPayload): Promise<VerifyOtpResult> {
    if (!payload.accessToken) {
      throw new Error('Google access token is missing');
    }

    const response = await authApi.loginWithGoogle(payload);
    return mapAuthSession(response.data);
  }

  async validateReferralCode(referralCode: string): Promise<boolean> {
    const response = await authApi.validateReferralCode(referralCode);
    return Boolean(response.data.valid);
  }

  async requestOtp(identifier: string, referralCode?: string): Promise<string | void> {
    const response = await authApi.requestOtp(identifier, referralCode);
    return response.data.message;
  }

  async verifyOtp(identifier: string, code: string, referralCode?: string): Promise<VerifyOtpResult> {
    const response = await authApi.verifyOtp(identifier, code, referralCode);
    return mapAuthSession(response.data);
  }

  async getMe(): Promise<AuthUser> {
    const response = await authApi.getMe();
    return mapAuthUser(response.data.user);
  }

  async requestForgotPassword(email: string): Promise<string | void> {
    const response = await authApi.requestForgotPassword(email);
    return response.data.message;
  }

  async verifyForgotPassword(email: string, code: string): Promise<{ verificationToken: string }> {
    const response = await authApi.verifyForgotPassword(email, code);
    return response.data;
  }

  async resetPassword(
    verificationToken: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<string | void> {
    const response = await authApi.resetPassword(verificationToken, password, passwordConfirmation);
    return 'message' in response.data ? response.data.message : undefined;
  }
}

function mapAuthSession(response: OtpVerifyResponse): VerifyOtpResult {
  return {
    accessToken: response.accessToken,
    tokenType: response.tokenType,
    expiresAt: response.accessTokenExpiredAt ?? response.expiresAt,
    refreshTokenExpiresAt: response.refreshTokenExpiredAt,
    refreshToken: response.refreshToken,
    user: mapAuthUser(response.user),
    isNewUser: response.isNewUser,
    signupReward: response.signupReward,
    firstLoginReward: response.firstLoginReward,
    unlockedAchievements: normalizeAchievements(response.unlockedAchievements),
  };
}

function mapAuthUser(user: OtpVerifyResponse['user']): AuthUser {
  const displayName = user.displayName ?? user.name ?? [user.firstName, user.lastName].filter(Boolean).join(' ');

  return {
    id: user.id,
    name: displayName || user.email || 'کاربر قبیله',
    firstName: user.firstName,
    lastName: user.lastName,
    displayName,
    username: user.username,
    avatar: user.avatar,
    phone: user.phone,
    email: user.email,
    role: user.role,
    title: user.title,
    level: user.level,
    xp: user.xp,
    xpMax: user.xpMax,
    streak: user.streak,
    isCompleteOnboarding: user.isCompleteOnboarding,
  };
}

export function normalizeUnlockedAchievements(items: unknown[] | undefined) {
  if (!Array.isArray(items)) return [];

  return items.map((item, index) => {
    const achievement = item as {
      id?: string;
      slug?: string;
      title?: string;
      label?: string;
      repeatIndex?: number;
      count?: number;
      isShareable?: boolean;
    };

    return {
      ...achievement,
      id: achievement.id ?? achievement.slug ?? `achievement-${index}`,
      label: achievement.label ?? achievement.title ?? achievement.slug ?? 'دستاورد جدید',
      icon: 'flame',
      unlocked: true,
      count: achievement.count ?? achievement.repeatIndex ?? 1,
      isShareable: achievement.isShareable,
    };
  });
}
