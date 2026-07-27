'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { IUserProfileRepository } from '../domain/user-profile-repository';

const USER_POSTS_PAGE_SIZE = 6;

export function useUserPosts(repo: IUserProfileRepository, userId: string) {
  return useInfiniteQuery({
    queryKey: ['user-profile', userId, 'posts'],
    queryFn: ({ pageParam = 0 }) =>
      repo.getUserPosts(userId, USER_POSTS_PAGE_SIZE, Number(pageParam) * USER_POSTS_PAGE_SIZE),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < USER_POSTS_PAGE_SIZE) return undefined;
      return allPages.length;
    },
    initialPageParam: 0,
    enabled: Boolean(userId),
    staleTime: 60_000,
  });
}
