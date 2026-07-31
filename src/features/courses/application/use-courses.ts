// src/features/dashboard/application/use-courses.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ICoursesRepository } from '@/features/dashboard/domain/dashboard-repository';
import type { SectionWatchProgressInput } from '@/features/dashboard/domain/dashboard.types';

export interface CourseListFilters {
  limit?: number;
  offset?: number;
  q?: string;
}

export function useCourses(repo: ICoursesRepository, filters: CourseListFilters = {}) {
  const query = useQuery({
    queryKey: ['dashboard', 'courses', filters],
    queryFn: ({ signal }) => repo.getCourses(filters, { signal }),
    placeholderData: (previous) => previous,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    courses: query.data ?? null,
    loading: query.isPending,
    fetching: query.isFetching,
    error: query.error instanceof Error ? query.error.message : null,
    rawError: query.error,
  };
}

export function useUpdateSectionProgress(repo: ICoursesRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sectionId,
      body,
    }: {
      sectionId: string;
      body: { status: string; progress?: number };
    }) => repo.updateSectionProgress(sectionId, body),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'courses'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'session'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'comments'] }),
      ]);
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'section', variables.sectionId] });
    },
  });
}

export function usePurchaseCourse(repo: ICoursesRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => repo.purchaseCourse(courseId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'courses'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'session'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] }),
      ]);
    },
  });
}

export function useReportSectionWatchProgress(repo: ICoursesRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sectionId,
      body,
    }: {
      sectionId: string;
      body: SectionWatchProgressInput;
    }) => repo.reportSectionWatchProgress(sectionId, body),
    onSuccess: async (result) => {
      if (result.section.status !== 'done') return;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'courses'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'session'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] }),
      ]);
    },
  });
}
