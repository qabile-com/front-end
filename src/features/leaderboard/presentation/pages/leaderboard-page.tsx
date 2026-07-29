'use client';

import { useLeaderboard } from '@/features/leaderboard/application/use-leaderboard';
import { useSeason } from '@/features/leaderboard/application/use-season';
import {
  leaderboardRepo,
  seasonRepo,
  userProfileRepo,
} from '@/features/leaderboard/infrastructure/repository-factory';
import { TabError, TabLoader } from '@/features/dashboard/presentation/components/dashboard-loading';
import { LeaderboardTab } from '@/features/leaderboard/presentation/sections/leaderboard-tab';
import { DashboardPageShell, MotionPage } from '@/shared/ui';

export function LeaderboardPage() {
  const leaderboard = useLeaderboard(leaderboardRepo);
  const season = useSeason(seasonRepo);

  if (leaderboard.loading || season.loading) return <TabLoader />;
  if (leaderboard.error) {
    return <TabError error={leaderboard.error} onRetry={() => void leaderboard.refetch()} />;
  }
  if (season.error) return <TabError error={season.error} onRetry={() => void season.refetch()} />;
  if (!leaderboard.data || !season.data) return <TabLoader />;

  return (
    <MotionPage>
      <DashboardPageShell>
        <LeaderboardTab
          podium={leaderboard.data.podium}
          leaderboard={leaderboard.data.leaderboard}
          userProfileRepo={userProfileRepo}
          seasonTargetDate={new Date(season.data.targetDate)}
          seasonPointsNeeded={season.data.pointsNeeded}
          seasonName={season.data.seasonName}
        />
      </DashboardPageShell>
    </MotionPage>
  );
}
