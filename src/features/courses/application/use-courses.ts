// src/features/dashboard/application/use-courses.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ICoursesRepository } from '@/features/dashboard/domain/dashboard-repository';
import type {
  ActionRewardResult,
  SectionWatchProgressInput,
} from '@/features/dashboard/domain/dashboard.types';

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
    staleTime: 2 * 60 * 1000,
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

export function useUpdateSectionProgress(
  repo: ICoursesRepository,
  onReward?: (reward?: ActionRewardResult | null) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sectionId,
      body,
    }: {
      sectionId: string;
      body: { status: string; progress?: number };
    }) => repo.updateSectionProgress(sectionId, body),
    onSuccess: async (result, variables) => {
      onReward?.(result);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'courses'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'home'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'session'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'xp-history'] }),
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
    onSuccess: async (_data, courseId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'courses'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'home'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'session'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'session', courseId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'xp-history'] }),
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
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'home'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'session'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'xp-history'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] }),
      ]);
    },
  });
}
