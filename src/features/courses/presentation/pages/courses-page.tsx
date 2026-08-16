'use client';

import { useMemo, useState } from 'react';
import { useInfiniteCourses } from '@/features/courses/application/use-courses';
import { useUser } from '@/features/dashboard/application/use-user';
import { coursesRepo } from '@/features/courses/infrastructure/repository-factory';
import { userRepo } from '@/features/dashboard/infrastructure/repository-factory';
import { useDebounce } from '@/shared/hooks/use-debounce';
import { TabError } from '@/features/dashboard/presentation/components/dashboard-loading';
import { CoursesTab } from '@/features/courses/presentation/sections/courses-tab';
import { CoursesPageSkeleton, DashboardPageShell, MotionPage } from '@/shared/ui';

export function CoursesPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const q = useMemo(() => debouncedSearch.trim() || undefined, [debouncedSearch]);
  const courses = useInfiniteCourses(coursesRepo, q);
  const { user, loading: userLoading } = useUser(userRepo);

  if (courses.isPending || userLoading) {
    return (
      <DashboardPageShell size="wide">
        <CoursesPageSkeleton />
      </DashboardPageShell>
    );
  }
  if (courses.error) {
    return (
      <TabError
        error={courses.error instanceof Error ? courses.error.message : 'خطا در دریافت کورس‌ها'}
        onRetry={() => void courses.refetch()}
      />
    );
  }

  const allCourses = courses.data?.pages.flat() ?? [];

  return (
    <MotionPage>
      <DashboardPageShell size="wide">
        <CoursesTab
          courses={allCourses}
          fireBalance={user?.xp ?? 0}
          search={search}
          isSearching={courses.isFetching && !courses.isFetchingNextPage}
          onSearchChange={setSearch}
          hasMoreCourses={courses.hasNextPage}
          isLoadingMoreCourses={courses.isFetchingNextPage}
          onLoadMoreCourses={() => void courses.fetchNextPage()}
        />
      </DashboardPageShell>
    </MotionPage>
  );
}
