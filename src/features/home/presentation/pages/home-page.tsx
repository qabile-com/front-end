'use client';

import { useUser } from '@/features/dashboard/application/use-user';
import { userRepo } from '@/features/dashboard/infrastructure/repository-factory';
import { useCourses } from '@/features/courses/application/use-courses';
import { coursesRepo } from '@/features/courses/infrastructure/repository-factory';
import { useActiveRoadmap } from '@/features/roadmap/application/use-active-roadmap';
import { roadmapRepo } from '@/features/roadmap/infrastructure/repository-factory';
import { TabError, TabLoader } from '@/features/dashboard/presentation/components/dashboard-loading';
import { HomeTab } from '@/features/home/presentation/sections/home-tab';
import { DashboardPageShell, MotionPage } from '@/shared/ui';

export function HomePage() {
  const { user, loading: userLoading, error: userError } = useUser(userRepo);
  const courses = useCourses(coursesRepo);
  const activeRoadmap = useActiveRoadmap(roadmapRepo);

  if (userLoading || courses.loading || activeRoadmap.loading) return <TabLoader />;
  if (userError) return <TabError error={userError} />;
  if (courses.error)
    return <TabError error={courses.error} onRetry={() => void courses.refetch()} />;
  if (activeRoadmap.error)
    return <TabError error={activeRoadmap.error} onRetry={() => void activeRoadmap.refetch()} />;
  if (!user || !courses.courses) return <TabLoader />;

  return (
    <MotionPage>
      <DashboardPageShell>
        <HomeTab user={user} courses={courses.courses} activeRoadmap={activeRoadmap.roadmap} />
      </DashboardPageShell>
    </MotionPage>
  );
}
