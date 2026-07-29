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
      const previousProfile = queryClient.getQueryData<UserProfileData>([
        'dashboard',
        'profile',
        userId,
      ]);

      queryClient.setQueriesData<InfiniteData<Post[]>>({ queryKey: ['social-feed'] }, (current) =>
        updateFeedAuthorFollow(current, userId, nextFollowed),
      );

      queryClient.setQueriesData<Post>({ queryKey: ['social-post'] }, (current) =>
        updatePostAuthorFollow(current, userId, nextFollowed),
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
        updateUserProfileFollow(current, nextFollowed),
      );

      return { previousFeed, previousActiveUsers, previousProfile, intendedFollowed: nextFollowed };
    },
    onError: (_error, variables, context) => {
      context?.previousFeed.forEach(([queryKey, data]) => queryClient.setQueryData(queryKey, data));
      queryClient.setQueryData(['social', 'active-users'], context?.previousActiveUsers);
      queryClient.setQueryData(['dashboard', 'profile', variables.userId], context?.previousProfile);
      queryClient.setQueryData(['follow-status', variables.userId], variables.isFollowedByMe);
    },
    onSuccess: (updatedUser, variables, context) => {
      const followed = context?.intendedFollowed ?? !variables.isFollowedByMe;

      queryClient.setQueryData<ActiveUser[]>(['social', 'active-users'], (current) =>
        current?.map((user) =>
          user.id === variables.userId
            ? updateActiveUserFollow(user, followed, updatedUser)
            : user,
        ),
      );

      queryClient.setQueriesData<InfiniteData<Post[]>>({ queryKey: ['social-feed'] }, (current) =>
        updateFeedAuthorFollow(current, variables.userId, followed),
      );

      queryClient.setQueriesData<Post>({ queryKey: ['social-post'] }, (current) =>
        updatePostAuthorFollow(current, variables.userId, followed),
      );

      queryClient.setQueryData(['follow-status', variables.userId], followed);
      queryClient.setQueryData<UserProfileData>(
        ['dashboard', 'profile', variables.userId],
        (current) =>
          updateUserProfileFollow(current, followed, updatedUser),
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

function updateActiveUserFollow(
  user: ActiveUser,
  followed: boolean,
  updatedUser?: ActiveUser,
): ActiveUser {
  const followersCount =
    typeof updatedUser?.followersCount === 'number'
      ? updatedUser.followersCount
      : typeof user.followersCount === 'number'
        ? Math.max(0, user.followersCount + (followed ? 1 : -1))
        : user.followersCount;

  return {
    ...user,
    ...updatedUser,
    followersCount,
    isFollowedByMe: followed,
    followedByMe: followed,
  };
}

function updatePostAuthorFollow(post: Post | undefined, userId: string, followed: boolean) {
  return post?.authorId === userId ? { ...post, isAuthorFollowedByMe: followed } : post;
}

function updateUserProfileFollow(
  profile: UserProfileData | undefined,
  followed: boolean,
  updatedUser?: ActiveUser,
) {
  if (!profile) return profile;

  const followersCount =
    typeof updatedUser?.followersCount === 'number'
      ? updatedUser.followersCount
      : Math.max(0, profile.stats.peersFollowed + (followed ? 1 : -1));

  return {
    ...profile,
    followedByMe: followed,
    blockedByMe: updatedUser?.blockedByMe ?? profile.blockedByMe,
    canFollow: updatedUser?.canFollow ?? profile.canFollow,
    stats: {
      ...profile.stats,
      peersFollowed: followersCount,
    },
    profileStats: profile.profileStats.map((stat) =>
      stat.label.includes('هم‌پرواز') || stat.label.includes('هم پرواز')
        ? { ...stat, value: String(followersCount) }
        : stat,
    ),
  };
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
