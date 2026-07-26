// src/features/dashboard/application/use-user-detail.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { IUserProfileRepository } from '../domain/user-profile-repository';

export function useUserDetail(repo: IUserProfileRepository, userId: string | null) {
  const query = useQuery({
    queryKey: ['dashboard', 'profile', userId],
    queryFn: () => repo.getUserProfile(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    detail: query.data ?? null,
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
