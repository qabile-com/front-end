// src/features/dashboard/application/use-home-data.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { IHomeRepository } from '../domain/dashboard-repository';

export function useHomeData(repo: IHomeRepository) {
  const query = useQuery({
    queryKey: ['dashboard', 'home'],
    queryFn: () => repo.getHomeData(),
    staleTime: 60_000,
    retry: 1,
  });

  return {
    data: query.data ?? null,
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    refetch: query.refetch,
  };
}
