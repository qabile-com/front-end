'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IProfileRepository } from '../domain/profile-repository';

export function useClaimAchievement(repo: IProfileRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (achievementId: string) => repo.claimAchievement(achievementId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'achievements'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'xp-history'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'home'] }),
      ]);
    },
  });
}
