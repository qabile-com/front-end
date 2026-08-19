'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { ISocialRepository } from '../domain/social-repository';

const MY_POSTS_PAGE_SIZE = 7;

export function useInfiniteMyPosts(
  repo: ISocialRepository,
  q: string | undefined,
  options?: { enabled?: boolean },
) {
  return useInfiniteQuery({
    queryKey: ['social-my-posts', q],
    queryFn: ({ pageParam = 0, signal }) =>
      repo.getMyPosts(MY_POSTS_PAGE_SIZE, pageParam * MY_POSTS_PAGE_SIZE, q, { signal }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < MY_POSTS_PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    staleTime: 0,
    enabled: options?.enabled ?? true,
  });
}
