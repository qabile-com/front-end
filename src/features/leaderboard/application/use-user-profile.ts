// src/features/dashboard/application/use-user-profile.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { IUserProfileRepository } from '../domain/user-profile-repository';

export function useUserProfile(repo: IUserProfileRepository, userId: string) {
  const query = useQuery({
    queryKey: ['dashboard', 'profile', userId],
    queryFn: () => repo.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 2 * 60 * 1000,
  });

  return {
    ...query,
    data: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
    rawError: query.error,
  };
}
