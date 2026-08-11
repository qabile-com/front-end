// src/features/dashboard/application/use-courses.ts
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ICoursesRepository } from '@/features/dashboard/domain/dashboard-repository';
import type {
  ActionRewardResult,
  SectionWatchProgressInput,
  SectionWatchProgressResult,
} from '@/features/dashboard/domain/dashboard.types';
import type { Course } from '@/features/courses/domain/courses.data';
import type { SessionDetail } from '@/features/courses/domain/session-repository';

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

/**
 * Marks a "بدون ترک" episode as watched, granting its XP without tracked playback.
 * Invalidates everything the XP/progress change can affect (course lists, session detail,
 * profile stats and fire balance) so the UI reflects the new state immediately.
 */
export function useMarkEpisodeWatched(repo: ICoursesRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ courseId, episodeId }: { courseId: string; episodeId: string }) =>
      repo.markEpisodeWatched(courseId, episodeId),
    onSuccess: async (_result, { courseId, episodeId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'courses'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'home'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'session', courseId, episodeId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'session', courseId] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'xp-history'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] }),
      ]);
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
    mutationFn: ({ sectionId, body }: { sectionId: string; body: SectionWatchProgressInput }) =>
      repo.reportSectionWatchProgress(sectionId, body),
    onSuccess: async (result, variables) => {
      const { sectionId } = variables;
      const courseId = variables.body.courseId;

      if (result.section.status === 'done') {
        const realProgress = Math.min(100, Math.max(0, result.section.progress ?? 100));
        queryClient.setQueriesData<Course[]>({ queryKey: ['dashboard', 'courses'] }, (previous) => {
          if (!previous) return previous;
          return previous.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  episodes: course.episodes.map((episode) =>
                    episode.id === sectionId
                      ? {
                          ...episode,
                          status: 'done',
                          progress: realProgress,
                          hasReceivedXp: true,
                        }
                      : episode,
                  ),
                }
              : course,
          );
        });

        queryClient.setQueriesData<SessionDetail>(
          { queryKey: ['dashboard', 'session', courseId, sectionId] },
          (previous) => {
            if (!previous) return previous;
            return {
              ...previous,
              part: {
                ...previous.part,
                status: 'done',
                progress: realProgress,
                hasReceivedXp: true,
              },
            };
          },
        );
      }

      if (result.reward) {
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'xp-history'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] });
      }
    },
  });
}
