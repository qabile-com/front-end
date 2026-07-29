'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IFollowRepository } from '../domain/follow-repository';
import type { UserProfileData } from '../domain/user-profile-repository';

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
        await repo.unfollowUser(userId);
      } else {
        await repo.followUser(userId);
      }
    },
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<boolean>(queryKey);
      queryClient.setQueryData(queryKey, !previous);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      queryClient.setQueryData(queryKey, context?.previous ?? false);
    },
    onSuccess: () => {
      if (!userId) return;
      const followed = !isFollowed;
      queryClient.setQueryData(queryKey, followed);
      queryClient.setQueryData<UserProfileData>(['dashboard', 'profile', userId], (current) =>
        current
          ? {
              ...current,
              followedByMe: followed,
              stats: {
                ...current.stats,
                peersFollowed: Math.max(
                  0,
                  current.stats.peersFollowed + (followed ? 1 : -1),
                ),
              },
            }
          : current,
      );
    },
    onSettled: () => {
      if (!userId) return;
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['social-feed'] });
      queryClient.invalidateQueries({ queryKey: ['social', 'active-users'] });
    },
  });

  return {
    isFollowed: !!isFollowed,
    isLoading,
    toggle: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  };
}
