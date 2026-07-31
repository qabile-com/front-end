'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { ISocialRepository, SocialFeedFilters } from '../domain/social-repository';

const FEED_PAGE_SIZE = 7;

export function useInfiniteFeed(repo: ISocialRepository, filters: SocialFeedFilters = {}) {
  return useInfiniteQuery({
    queryKey: ['social-feed', filters],
    queryFn: ({ pageParam = 0, signal }) =>
      repo.getFeed(FEED_PAGE_SIZE, pageParam * FEED_PAGE_SIZE, filters, { signal }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < FEED_PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    staleTime: 0,
  });
}
