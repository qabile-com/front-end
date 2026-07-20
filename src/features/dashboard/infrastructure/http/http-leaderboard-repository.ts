// http-leaderboard-repository.ts
import type { ILeaderboardRepository } from '../../domain/dashboard-repository';
import type { LbRow, PodiumPlace } from '../../domain/dashboard.types';
import { getDashboardBundle } from '@/core/api/dashboard.api';

export class HttpLeaderboardRepository implements ILeaderboardRepository {
  async getLeaderboardData(): Promise<{ podium: PodiumPlace[]; leaderboard: LbRow[] }> {
    const res = await getDashboardBundle();
    return res.data.leaderboard as { podium: PodiumPlace[]; leaderboard: LbRow[] };
  }
}
