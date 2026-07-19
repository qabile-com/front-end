import type { ILandingUserRepository } from '../domain/landing-repository';
import { USER } from '@/features/dashboard/domain/dashboard.data';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockLandingUserRepository implements ILandingUserRepository {
  async getPersonalisedData() {
    await delay(400);
    // Simulate logged-in user
    const isLoggedIn = true; // or check token existence
    if (!isLoggedIn) return { user: null, chips: null };
    return {
      user: USER,
      chips: [
        { icon: 'bolt', value: '۲٬۴۸۰', label: 'امتیاز امروز' },
        { icon: 'flame', value: '۳۱ روز', label: 'زنجیره‌ی پیوسته' },
        { icon: 'medal', value: 'سطح ۲۴', label: 'ققنوس طلایی' },
      ],
    };
  }
}
