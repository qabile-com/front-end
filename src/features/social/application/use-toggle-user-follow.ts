'use client';

import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import type { IFollowRepository } from '@/features/leaderboard/domain/follow-repository';
import type { ActiveUser, Post } from '../domain/social.data';

export function useToggleUserFollow(repo: IFollowRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      isFollowedByMe,
    }: {
      userId: string;
      isFollowedByMe: boolean;
    }) => {
      if (isFollowedByMe) {
        await repo.unfollowUser(userId);
      } else {
        await repo.followUser(userId);
      }
    },
    onMutate: async ({ userId, isFollowedByMe }) => {
      const nextFollowed = !isFollowedByMe;

      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['social-feed'] }),
        queryClient.cancelQueries({ queryKey: ['social', 'active-users'] }),
      ]);

      const previousFeed = queryClient.getQueryData<InfiniteData<Post[]>>(['social-feed']);
      const previousActiveUsers = queryClient.getQueryData<ActiveUser[]>([
        'social',
        'active-users',
      ]);

      queryClient.setQueryData<InfiniteData<Post[]>>(['social-feed'], (current) =>
        current
          ? {
              ...current,
              pages: current.pages.map((page) =>
                page.map((post) =>
                  post.authorId === userId
                    ? { ...post, isAuthorFollowedByMe: nextFollowed }
                    : post,
                ),
              ),
            }
          : current,
      );

      queryClient.setQueriesData<Post>({ queryKey: ['social-post'] }, (current) =>
        current?.authorId === userId
          ? { ...current, isAuthorFollowedByMe: nextFollowed }
          : current,
      );

      queryClient.setQueryData<ActiveUser[]>(['social', 'active-users'], (current) =>
        current?.map((user) =>
          user.id === userId ? { ...user, isFollowedByMe: nextFollowed } : user,
        ),
      );

      queryClient.setQueryData(['follow-status', userId], nextFollowed);

      return { previousFeed, previousActiveUsers };
    },
    onError: (_error, variables, context) => {
      queryClient.setQueryData(['social-feed'], context?.previousFeed);
      queryClient.setQueryData(['social', 'active-users'], context?.previousActiveUsers);
      queryClient.setQueryData(['follow-status', variables.userId], variables.isFollowedByMe);
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['social', 'active-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['follow-status', variables.userId] });
    },
  });
}
