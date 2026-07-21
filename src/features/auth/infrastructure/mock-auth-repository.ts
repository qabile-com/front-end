import type {
  AuthSession,
  AuthUser,
  IAuthRepository,
  VerifyOtpResult,
} from '../domain/auth-repository';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockAuthRepository implements IAuthRepository {
  async requestOtp(identifier: string): Promise<void> {
    await delay(800);
    console.log(`[Mock] OTP sent to ${identifier}`);
  }

  async verifyOtp(identifier: string, code: string, name?: string): Promise<VerifyOtpResult> {
    await delay(1000);
    if (code !== '123456') throw new Error('کد تایید اشتباه است');
    const isNewUser = !name; // mock: no name = new user
    return {
      user: {
        id: 'mock-user-id',
        name: name || 'کاربر جدید',
        phone: identifier,
        email: null,
        role: 'user',
      },
      isNewUser,
      signupReward: isNewUser
        ? { xpGranted: 50, ruleCode: 'signup', ruleTitle: 'Signup reward' }
        : undefined,
      unlockedAchievements: isNewUser
        ? [{ id: 'ach1', label: 'آتش‌افروز', slug: 'atash-afrooz' }]
        : [],
    };
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
