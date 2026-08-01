'use client';

import { useQuery } from '@tanstack/react-query';
import type { IUserRepository } from '../domain/dashboard-repository';

export function useUser(repo: IUserRepository) {
  const query = useQuery({
    queryKey: ['dashboard', 'user', 'current'],
    queryFn: () => repo.getCurrentUser(),
    staleTime: 0,
    retry: 1,
  });

  return {
    user: query.data ?? null,
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}
