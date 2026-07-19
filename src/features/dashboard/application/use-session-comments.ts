'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { ICommentsRepository } from '../domain/comments-repository';

const PAGE_SIZE = 5;

export function useSessionComments(
  repo: ICommentsRepository,
  courseId: string | null,
  partTitle: string | null,
) {
  return useInfiniteQuery({
    queryKey: ['session-comments', courseId, partTitle],
    queryFn: ({ pageParam = 0 }) =>
      repo.getComments(courseId!, partTitle!, PAGE_SIZE, pageParam * PAGE_SIZE),
    getNextPageParam: (lastPage) => {
      if (lastPage.currentPage < lastPage.totalPages) {
        return lastPage.currentPage; // next page number (0‑based)
      }
      return undefined;
    },
    initialPageParam: 0,
    enabled: !!courseId && !!partTitle,
    staleTime: 2 * 60 * 1000,
  });
}
