'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { IProfileRepository } from '../domain/profile-repository';

/**
 * Claims an achievement (or records a daily check-in for `manual_daily_check` ones).
 *
 * Invalidates profile/XP/user queries because a successful claim grants XP and flips the
 * achievement to unlocked, which the header balance and profile stats both render.
 */
export function useClaimAchievement(repo: IProfileRepository) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (achievementId: string) => repo.claimAchievement(achievementId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'me'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'profile', 'xp-history'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'user', 'current'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'home'] }),
      ]);
    },
  });
}
