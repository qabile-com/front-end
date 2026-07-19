// http-leaderboard-repository.ts
import type { ILeaderboardRepository } from '../../domain/dashboard-repository';
import { getDashboardBundle } from '@/core/api/dashboard.api';

export class HttpLeaderboardRepository implements ILeaderboardRepository {
  async getLeaderboardData() {
    const res = await getDashboardBundle();
    return res.data.leaderboard;
  }
}
