'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { IProfileRepository } from '../domain/profile-repository';

const PAGE_SIZE = 10;

export function useXpHistory(repo: IProfileRepository, q = '') {
  return useInfiniteQuery({
    queryKey: ['dashboard', 'profile', 'xp-history', q],
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) =>
      repo.getXpHistory({
        limit: PAGE_SIZE,
        offset: pageParam,
        q: q.trim() || undefined,
      }, { signal }),
    getNextPageParam: (lastPage) => {
      const nextOffset = lastPage.offset + lastPage.limit;
      return nextOffset < lastPage.totalItems ? nextOffset : undefined;
    },
    staleTime: 60_000,
  });
}
