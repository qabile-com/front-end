'use client';

import { useQuery } from '@tanstack/react-query';
import type { IProfileRepository } from '../domain/profile-repository';

/**
 * Achievements from the dedicated endpoint.
 *
 * The copy embedded in `/users/me/profile` drives the grid, but it omits `triggerType` and
 * `threshold` — the fields that identify a user-claimable (daily check-in) achievement. This
 * query supplies them so the claim button can be shown for the right achievements.
 */
export function useMyAchievements(repo: IProfileRepository) {
  return useQuery({
    queryKey: ['dashboard', 'profile', 'achievements'],
    queryFn: ({ signal }) => repo.getMyAchievements({ signal }),
    staleTime: 5 * 60 * 1000,
  });
}
