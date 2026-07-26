// src/features/dashboard/application/use-courses.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ICoursesRepository } from '@/features/dashboard/domain/dashboard-repository';
import type { SectionWatchProgressInput } from '@/features/dashboard/domain/dashboard.types';

export function useCourses(repo: ICoursesRepository) {
  const query = useQuery({
    queryKey: ['dashboard', 'courses'],
    queryFn: () => repo.getCourses(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...query,
    courses: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
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
