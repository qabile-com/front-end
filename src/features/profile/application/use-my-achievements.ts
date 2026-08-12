'use client';

import { useQuery } from '@tanstack/react-query';
import type { IProfileRepository } from '../domain/profile-repository';

export function useMyAchievements(repo: IProfileRepository) {
  return useQuery({
    queryKey: ['dashboard', 'profile', 'achievements'],
    queryFn: ({ signal }) => repo.getMyAchievements({ signal }),
    staleTime: 5 * 60 * 1000,
  });
}
