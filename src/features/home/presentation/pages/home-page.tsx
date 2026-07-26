'use client';

import { useHomeData } from '@/features/home/application/use-home-data';
import { useUser } from '@/features/dashboard/application/use-user';
import { userRepo } from '@/features/dashboard/infrastructure/repository-factory';
import { homeRepo } from '@/features/home/infrastructure/repository-factory';
import { TabError, TabLoader } from '@/features/dashboard/presentation/components/dashboard-loading';
import { HomeTab } from '@/features/home/presentation/sections/home-tab';
import { MotionPage } from '@/shared/ui';

export function HomePage() {
  const { user, loading: userLoading, error: userError } = useUser(userRepo);
  const home = useHomeData(homeRepo);

  if (userLoading || home.loading) return <TabLoader />;
  if (userError) return <TabError error={userError} />;
  if (home.error) return <TabError error={home.error} onRetry={() => void home.refetch()} />;
  if (!user || !home.data) return <TabLoader />;

  return (
    <MotionPage>
    <HomeTab
      user={user}
      stats={home.data.stats}
      roadmap={home.data.roadmap}
      aiSeed={home.data.aiSeed}
      aiQuickReplies={home.data.aiQuickReplies}
    />
    </MotionPage>
  );
}
