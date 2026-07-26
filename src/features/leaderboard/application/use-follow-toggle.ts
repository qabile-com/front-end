'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { IFollowRepository } from '../domain/follow-repository';

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
  });

  return {
    isFollowed: !!isFollowed,
    isLoading,
    toggle: toggleMutation.mutate,
    isToggling: toggleMutation.isPending,
  };
}
