'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { ISocialRepository } from '../domain/social-repository';

const FEED_PAGE_SIZE = 7;

export function useInfiniteFeed(repo: ISocialRepository) {
  return useInfiniteQuery({
    queryKey: ['social-feed'],
    queryFn: ({ pageParam = 0 }) => repo.getFeed(FEED_PAGE_SIZE, pageParam * FEED_PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < FEED_PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000,
  });
}
