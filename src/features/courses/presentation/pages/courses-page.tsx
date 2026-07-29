'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCourses } from '@/features/courses/application/use-courses';
import { useUser } from '@/features/dashboard/application/use-user';
import { coursesRepo } from '@/features/courses/infrastructure/repository-factory';
import { userRepo } from '@/features/dashboard/infrastructure/repository-factory';
import { TabError } from '@/features/dashboard/presentation/components/dashboard-loading';
import { CoursesTab } from '@/features/courses/presentation/sections/courses-tab';
import { CoursesPageSkeleton, DashboardPageShell, MotionPage } from '@/shared/ui';

export function CoursesPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const filters = useMemo(
    () => ({
      limit: 30,
      offset: 0,
      q: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch],
  );
  const courses = useCourses(coursesRepo, filters);
  const { user, loading: userLoading } = useUser(userRepo);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timeoutId);
  }, [search]);

  if (courses.loading || userLoading) {
    return (
      <DashboardPageShell size="wide">
        <CoursesPageSkeleton />
      </DashboardPageShell>
    );
  }
  if (courses.error) return <TabError error={courses.error} onRetry={() => void courses.refetch()} />;
  if (!courses.courses) {
    return (
      <DashboardPageShell size="wide">
        <CoursesPageSkeleton />
      </DashboardPageShell>
    );
  }

  return (
    <MotionPage>
      <DashboardPageShell size="wide">
        <CoursesTab
          courses={courses.courses}
          fireBalance={user?.xp ?? 0}
          search={search}
          isSearching={courses.fetching}
          onSearchChange={setSearch}
        />
      </DashboardPageShell>
    </MotionPage>
  );
}
