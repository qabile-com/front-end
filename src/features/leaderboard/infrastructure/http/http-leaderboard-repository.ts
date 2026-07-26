// http-leaderboard-repository.ts
import type { ILeaderboardRepository } from '@/features/dashboard/domain/dashboard-repository';
import type { LbRow, PodiumPlace } from '@/features/dashboard/domain/dashboard.types';
import { getDashboardBundle } from '@/core/api/dashboard.api';

export class HttpLeaderboardRepository implements ILeaderboardRepository {
  async getLeaderboardData(): Promise<{ podium: PodiumPlace[]; leaderboard: LbRow[] }> {
    const res = await getDashboardBundle();
    return res.data.leaderboard as { podium: PodiumPlace[]; leaderboard: LbRow[] };
  }
}
