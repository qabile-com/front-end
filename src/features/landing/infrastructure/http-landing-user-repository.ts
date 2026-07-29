import type { ILandingUserRepository } from '../domain/landing-repository';
import { getStoredAuthSession } from '@/core/auth/token';
import { HttpUserRepository } from '@/features/dashboard/infrastructure/http/http-user-repository';

const userRepo = new HttpUserRepository();

export class HttpLandingUserRepository implements ILandingUserRepository {
  async getPersonalisedData() {
    const session = getStoredAuthSession();

    if (!session?.accessToken) {
      return { user: null, chips: null };
    }

    const user = await userRepo.getCurrentUser();

    return {
      user,
      chips: [
        { icon: 'bolt', value: String(user.xp ?? 0), label: 'آتش فعلی' },
        { icon: 'flame', value: `${user.streak ?? 0} روز`, label: 'زنجیره پیوسته' },
        { icon: 'medal', value: `سطح ${user.level ?? 0}`, label: user.title || 'عضو قبیله' },
      ],
    };
  }
}
