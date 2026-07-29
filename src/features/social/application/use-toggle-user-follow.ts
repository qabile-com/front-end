'use client';

import { useMutation, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import type { ISocialRepository } from '../domain/social-repository';
import type { ActiveUser, Post } from '../domain/social.data';
import type { UserProfileData } from '@/features/leaderboard/domain/user-profile-repository';

export function useToggleUserFollow(repo: ISocialRepository) {
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
        return repo.unfollowUser(userId);
      }
      return repo.followUser(userId);
    },
    onMutate: async ({ userId, isFollowedByMe }) => {
      const nextFollowed = !isFollowedByMe;

      await Promise.all([
        queryClient.cancelQueries({ queryKey: ['social-feed'] }),
        queryClient.cancelQueries({ queryKey: ['social', 'active-users'] }),
      ]);

      const previousFeed = queryClient.getQueriesData<InfiniteData<Post[]>>({
        queryKey: ['social-feed'],
      });
      const previousActiveUsers = queryClient.getQueryData<ActiveUser[]>([
        'social',
        'active-users',
      ]);

      queryClient.setQueriesData<InfiniteData<Post[]>>({ queryKey: ['social-feed'] }, (current) =>
        updateFeedAuthorFollow(current, userId, nextFollowed),
      );

      queryClient.setQueriesData<Post>({ queryKey: ['social-post'] }, (current) =>
        current?.authorId === userId
          ? { ...current, isAuthorFollowedByMe: nextFollowed }
          : current,
      );

      queryClient.setQueryData<ActiveUser[]>(['social', 'active-users'], (current) =>
        current?.map((user) =>
          user.id === userId
            ? {
                ...user,
                isFollowedByMe: nextFollowed,
                followedByMe: nextFollowed,
                followersCount:
                  typeof user.followersCount === 'number'
                    ? Math.max(0, user.followersCount + (nextFollowed ? 1 : -1))
                    : user.followersCount,
              }
            : user,
        ),
      );

      queryClient.setQueryData(['follow-status', userId], nextFollowed);
      queryClient.setQueryData<UserProfileData>(['dashboard', 'profile', userId], (current) =>
        current
          ? {
              ...current,
              followedByMe: nextFollowed,
              stats: {
                ...current.stats,
                peersFollowed: Math.max(
                  0,
                  current.stats.peersFollowed + (nextFollowed ? 1 : -1),
                ),
              },
            }
          : current,
      );

      return { previousFeed, previousActiveUsers };
    },
    onError: (_error, variables, context) => {
      context?.previousFeed.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      queryClient.setQueryData(['social', 'active-users'], context?.previousActiveUsers);
      queryClient.setQueryData(['follow-status', variables.userId], variables.isFollowedByMe);
    },
    onSuccess: (updatedUser, variables) => {
      const followed = Boolean(updatedUser.isFollowedByMe ?? updatedUser.followedByMe);

      queryClient.setQueryData<ActiveUser[]>(['social', 'active-users'], (current) =>
        current?.map((user) =>
          user.id === variables.userId
            ? {
                ...user,
                ...updatedUser,
                isFollowedByMe: followed,
                followedByMe: followed,
              }
            : user,
        ),
      );

      queryClient.setQueriesData<InfiniteData<Post[]>>({ queryKey: ['social-feed'] }, (current) =>
        updateFeedAuthorFollow(current, variables.userId, followed),
      );

      queryClient.setQueriesData<Post>({ queryKey: ['social-post'] }, (current) =>
        current?.authorId === variables.userId
          ? { ...current, isAuthorFollowedByMe: followed }
          : current,
      );

      queryClient.setQueryData(['follow-status', variables.userId], followed);
      queryClient.setQueryData<UserProfileData>(
        ['dashboard', 'profile', variables.userId],
        (current) =>
          current
            ? {
                ...current,
                followedByMe: followed,
                blockedByMe: updatedUser.blockedByMe ?? current.blockedByMe,
                canFollow: updatedUser.canFollow ?? current.canFollow,
                stats: {
                  ...current.stats,
                  peersFollowed:
                    updatedUser.followersCount ?? current.stats.peersFollowed,
                },
              }
            : current,
      );
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['social', 'active-users'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['user-profile', variables.userId, 'posts'] });
      queryClient.invalidateQueries({ queryKey: ['follow-status', variables.userId] });
    },
  });
}

function updateFeedAuthorFollow(
  current: InfiniteData<Post[]> | undefined,
  userId: string,
  followed: boolean,
) {
  if (!current) return current;
  return {
    ...current,
    pages: current.pages.map((page) =>
      page.map((post) =>
        post.authorId === userId ? { ...post, isAuthorFollowedByMe: followed } : post,
      ),
    ),
  };
}
