'use client';

import { useHomeData } from '@/features/home/application/use-home-data';
import { useUser } from '@/features/dashboard/application/use-user';
import { userRepo } from '@/features/dashboard/infrastructure/repository-factory';
import { homeRepo } from '@/features/home/infrastructure/repository-factory';
import { useCourses } from '@/features/courses/application/use-courses';
import { coursesRepo } from '@/features/courses/infrastructure/repository-factory';
import { TabError, TabLoader } from '@/features/dashboard/presentation/components/dashboard-loading';
import { HomeTab } from '@/features/home/presentation/sections/home-tab';
import { MotionPage } from '@/shared/ui';

export function HomePage() {
  const { user, loading: userLoading, error: userError } = useUser(userRepo);
  const home = useHomeData(homeRepo);
  const courses = useCourses(coursesRepo);

  if (userLoading || home.loading || courses.loading) return <TabLoader />;
  if (userError) return <TabError error={userError} />;
  if (home.error) return <TabError error={home.error} onRetry={() => void home.refetch()} />;
  if (courses.error)
    return <TabError error={courses.error} onRetry={() => void courses.refetch()} />;
  if (!user || !home.data || !courses.courses) return <TabLoader />;

  return (
    <MotionPage>
      <HomeTab
        user={user}
        roadmap={home.data.roadmap}
        courses={courses.courses}
      />
    </MotionPage>
  );
}
