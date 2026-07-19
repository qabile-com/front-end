import type { IAuthRepository, AuthUser } from '../domain/auth-repository';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockAuthRepository implements IAuthRepository {
  async requestOtp(identifier: string): Promise<void> {
    await delay(800);
    console.log(`[Mock] OTP sent to ${identifier}`);
  }

  async verifyOtp(identifier: string, code: string, name?: string): Promise<AuthUser> {
    await delay(1000);
    if (code !== '123456') throw new Error('کد تایید اشتباه است');
    return {
      id: 'mock-user-id',
      name: name || 'کاربر مهمان',
      phone: identifier,
      email: null,
      role: 'user',
    };
  }

  async getMe(): Promise<AuthUser> {
    await delay(500);
    return {
      id: 'mock-user-id',
      name: 'کاربر مهمان',
      phone: '09123456789',
      email: null,
      role: 'user',
    };
  }
}
