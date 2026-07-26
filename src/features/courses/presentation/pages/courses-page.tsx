'use client';

import { useCourses } from '@/features/courses/application/use-courses';
import { coursesRepo } from '@/features/courses/infrastructure/repository-factory';
import { TabError, TabLoader } from '@/features/dashboard/presentation/components/dashboard-loading';
import { CoursesTab } from '@/features/courses/presentation/sections/courses-tab';
import { MotionPage } from '@/shared/ui';

export function CoursesPage() {
  const courses = useCourses(coursesRepo);

  if (courses.loading) return <TabLoader />;
  if (courses.error) return <TabError error={courses.error} onRetry={() => void courses.refetch()} />;
  if (!courses.courses) return <TabLoader />;

  return (
    <MotionPage>
      <CoursesTab courses={courses.courses} />
    </MotionPage>
  );
}
