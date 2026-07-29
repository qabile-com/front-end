'use client';

import { useCourses } from '@/features/courses/application/use-courses';
import { useUser } from '@/features/dashboard/application/use-user';
import { coursesRepo } from '@/features/courses/infrastructure/repository-factory';
import { userRepo } from '@/features/dashboard/infrastructure/repository-factory';
import { TabError, TabLoader } from '@/features/dashboard/presentation/components/dashboard-loading';
import { CoursesTab } from '@/features/courses/presentation/sections/courses-tab';
import { DashboardPageShell, MotionPage } from '@/shared/ui';

export function CoursesPage() {
  const courses = useCourses(coursesRepo);
  const { user, loading: userLoading } = useUser(userRepo);

  if (courses.loading || userLoading) return <TabLoader />;
  if (courses.error) return <TabError error={courses.error} onRetry={() => void courses.refetch()} />;
  if (!courses.courses) return <TabLoader />;

  return (
    <MotionPage>
      <DashboardPageShell size="wide">
        <CoursesTab courses={courses.courses} fireBalance={user?.xp ?? 0} />
      </DashboardPageShell>
    </MotionPage>
  );
}
