import type { AuthUser, IAuthRepository, VerifyOtpResult } from '../domain/auth-repository';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export class MockAuthRepository implements IAuthRepository {
  async login(email: string, password: string): Promise<VerifyOtpResult> {
    await delay(700);
    if (!password || password.length < 8) {
      throw new Error('رمز عبور معتبر نیست');
    }

    return createMockSession(email, 'آرش کریمی');
  }

  async requestOtp(identifier: string): Promise<void> {
    await delay(800);
    console.log(`[Mock] OTP sent to ${identifier}`);
  }

  async verifyOtp(identifier: string, code: string, name?: string): Promise<VerifyOtpResult> {
    await delay(1000);
    if (code !== '123456') throw new Error('کد تایید اشتباه است');
    const isNewUser = Boolean(name);
    return {
      ...createMockSession(identifier, name || 'کاربر جدید'),
      isNewUser,
      signupReward: isNewUser
        ? { xpGranted: 50, ruleCode: 'signup', ruleTitle: 'Signup reward' }
        : undefined,
      unlockedAchievements: isNewUser
        ? [{ id: 'ach1', label: 'آتش‌افروز', slug: 'atash-afrooz' }]
        : [],
    };
  }

  async requestForgotPassword(email: string): Promise<void> {
    await delay(700);
    console.log(`[Mock] Password reset OTP sent to ${email}`);
  }

  async verifyForgotPassword(email: string, code: string): Promise<{ verificationToken: string }> {
    await delay(700);
    if (code !== '123456') throw new Error('کد تایید اشتباه است');
    return { verificationToken: `mock-reset-token:${email}` };
  }

  async resetPassword(
    verificationToken: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<void> {
    await delay(700);
    if (!verificationToken) throw new Error('توکن تغییر رمز معتبر نیست');
    if (password !== passwordConfirmation) throw new Error('تکرار رمز عبور درست نیست');
  }

  async getMe(): Promise<AuthUser> {
    await delay(500);
    return {
      id: 'mock-user-id',
      name: 'کاربر مهمان',
      phone: null,
      email: 'guest@qabile.local',
      role: 'user',
    };
  }
}

function createMockSession(email: string, name: string): VerifyOtpResult {
  return {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    tokenType: 'Bearer',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    user: {
      id: 'mock-user-id',
      name,
      phone: null,
      email,
      role: 'user',
      title: 'ققنوس طلایی',
      level: 24,
      xp: 6800,
      xpMax: 10000,
      streak: 31,
    },
  };
}
