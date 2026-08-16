// src/features/dashboard/application/use-courses.ts
'use client';

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ICoursesRepository } from '@/features/dashboard/domain/dashboard-repository';
import type {
  ActionRewardResult,
  SectionWatchProgressInput,
  SectionWatchProgressResult,
} from '@/features/dashboard/domain/dashboard.types';
import { getCourseProgress, type Course } from '@/features/courses/domain/courses.data';
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

const COURSES_PAGE_SIZE = 20;

export function useInfiniteCourses(repo: ICoursesRepository, q?: string) {
  return useInfiniteQuery({
    queryKey: ['dashboard', 'courses', 'infinite', q],
    queryFn: ({ pageParam = 0, signal }) =>
      repo.getCourses({ limit: COURSES_PAGE_SIZE, offset: pageParam * COURSES_PAGE_SIZE, q }, { signal }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < COURSES_PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000,
  });
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
          return previous.map((course) => {
            if (course.id !== courseId) return course;

            const episodes = course.episodes.map((episode) =>
              episode.id === sectionId
                ? {
                    ...episode,
                    status: 'done' as const,
                    progress: realProgress,
                    hasReceivedXp: true,
                  }
                : episode,
            );
            const completedEpisodes = episodes.filter((episode) => episode.status === 'done').length;
            const totalEpisodes = course.totalEpisodes ?? episodes.length;
            const patched: Course = {
              ...course,
              episodes,
              completedEpisodes,
              totalEpisodes,
              progressPercent: undefined,
            };

            return { ...patched, progressPercent: getCourseProgress(patched) };
          });
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
