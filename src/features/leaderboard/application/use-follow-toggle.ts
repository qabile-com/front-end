'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IFollowRepository } from '../domain/follow-repository';
import type { UserProfileData } from '../domain/user-profile-repository';
import type { ActiveUser, Post } from '@/features/social/domain/social.data';

export function useFollowToggle(repo: IFollowRepository, userId: string | null) {
  const queryClient = useQueryClient();
  const queryKey = ['follow-status', userId];

  const { data: isFollowed, isLoading } = useQuery({
    queryKey,
    queryFn: () => repo.getFollowStatus(userId!),
    enabled: !!userId,
  });

  const toggleMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      if (isFollowed) {
        return repo.unfollowUser(userId);
      } else {
        return repo.followUser(userId);
      }
    },
    onMutate: async () => {
      if (!userId) return { previous: undefined, previousProfile: undefined, followed: false };
      const followed = !Boolean(isFollowed);

      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: ['dashboard', 'profile', userId] });

      const previous = queryClient.getQueryData<boolean>(queryKey);
      const previousProfile = queryClient.getQueryData<UserProfileData>([
        'dashboard',
        'profile',
        userId,
      ]);

      queryClient.setQueryData(queryKey, followed);
      queryClient.setQueryData<UserProfileData>(['dashboard', 'profile', userId], (current) =>
        updateUserProfileFollow(current, followed),
      );
      syncSocialCaches(queryClient, userId, followed);

      return { previous, previousProfile, followed };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKey, context?.previous ?? false);
      if (userId) {
        queryClient.setQueryData(['dashboard', 'profile', userId], context?.previousProfile);
      }
    },
    onSuccess: (updatedUser, _vars, context) => {
      if (!userId) return;
      const followed = context?.followed ?? !Boolean(isFollowed);
      queryClient.setQueryData(queryKey, followed);
      queryClient.setQueryData<UserProfileData>(['dashboard', 'profile', userId], (current) =>
        updateUserProfileFollow(current, followed, updatedUser),
      );
      syncSocialCaches(queryClient, userId, followed, updatedUser);
    },
    onSettled: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['social', 'active-users'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap-step-condition'] });
    },
  });

  return {
    isFollowed: !!isFollowed,
    isLoading,
    toggle: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  };
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
      stat.label.includes('فالور')
        ? { ...stat, value: String(followersCount) }
        : stat,
    ),
  };
}

function syncSocialCaches(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: string,
  followed: boolean,
  updatedUser?: ActiveUser,
) {
  queryClient.setQueryData<ActiveUser[]>(['social', 'active-users'], (current) =>
    current?.map((user) =>
      user.id === userId
        ? {
            ...user,
            ...updatedUser,
            followersCount: updatedUser?.followersCount ?? user.followersCount,
            followedByMe: followed,
            isFollowedByMe: followed,
          }
        : user,
    ),
  );

  queryClient.setQueriesData<{ pages: Post[][] }>({ queryKey: ['social-feed'] }, (current) =>
    current
      ? {
          ...current,
          pages: current.pages.map((page) =>
            page.map((post) =>
              post.authorId === userId ? { ...post, isAuthorFollowedByMe: followed } : post,
            ),
          ),
        }
      : current,
  );

  queryClient.setQueriesData<Post>({ queryKey: ['social-post'] }, (current) =>
    current?.authorId === userId ? { ...current, isAuthorFollowedByMe: followed } : current,
  );
}
