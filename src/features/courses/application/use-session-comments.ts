'use client';

import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ICommentsRepository } from '../domain/comments-repository';
import type { ActionRewardResult } from '@/features/dashboard/domain/dashboard.types';

const PAGE_SIZE = 5;

export function useSessionComments(
  repo: ICommentsRepository,
  courseId: string | null,
  sectionId: string | null,
  enabled = true,
) {
  return useInfiniteQuery({
    queryKey: ['dashboard', 'comments', courseId, sectionId],
    queryFn: ({ pageParam = 0 }) =>
      repo.getComments(courseId!, sectionId!, PAGE_SIZE, pageParam * PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage;
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: enabled && !!courseId && !!sectionId,
    staleTime: 2 * 60 * 1000,
  });
}

export function useAddSessionComment(
  repo: ICommentsRepository,
  onReward?: (reward?: ActionRewardResult | null) => void,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      courseId,
      sectionId,
      text,
    }: {
      courseId: string;
      sectionId: string;
      text: string;
    }) => repo.addComment(courseId, sectionId, text),
    onSuccess: async (result, variables) => {
      onReward?.(result.reward);
      await queryClient.invalidateQueries({
        queryKey: ['dashboard', 'comments', variables.courseId, variables.sectionId],
      });
      queryClient.invalidateQueries({
        queryKey: ['dashboard', 'session', variables.courseId, variables.sectionId],
      });
    },
  });
}
