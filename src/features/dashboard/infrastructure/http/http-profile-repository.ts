// http-profile-repository.ts
import type { IProfileRepository } from '../../domain/dashboard-repository';
import { getDashboardBundle } from '@/core/api/dashboard.api';

export class HttpProfileRepository implements IProfileRepository {
  async getProfileData() {
    const res = await getDashboardBundle();
    const p = res.data.profile;
    return {
      profileStats: p.profileStats,
      achievements: p.achievements ?? [],
      settings: [], // coming from different endpoint maybe
    };
  }
}
