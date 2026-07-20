import type { AuthSession, AuthUser, IAuthRepository } from '../domain/auth-repository';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockAuthRepository implements IAuthRepository {
  async requestOtp(identifier: string): Promise<void> {
    await delay(800);
    console.log(`[Mock] OTP sent to ${identifier}`);
  }

  async verifyOtp(
    identifier: string,
    code: string,
    name?: string,
    lastName?: string,
  ): Promise<AuthSession> {
    await delay(1000);
    if (code !== '123456') throw new Error('کد تایید اشتباه است');
    const fullName = [name, lastName].filter(Boolean).join(' ').trim();
    return {
      accessToken: 'mock-access-token',
      tokenType: 'Bearer',
      expiresInSeconds: 60 * 60 * 24 * 7,
      user: {
        id: 'mock-user-id',
        name: fullName || name || 'کاربر مهمان',
        phone: null,
        email: identifier,
        role: 'user',
      },
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
