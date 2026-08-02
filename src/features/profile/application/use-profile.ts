// src/features/dashboard/application/use-profile.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { IProfileRepository } from '../domain/profile-repository';

export function useProfile(repo: IProfileRepository) {
  const query = useQuery({
    queryKey: ['dashboard', 'profile', 'me'],
    queryFn: () => repo.getMyProfile(),
    staleTime: 2 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
