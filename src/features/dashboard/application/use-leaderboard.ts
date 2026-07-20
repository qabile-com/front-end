// src/features/dashboard/application/use-leaderboard.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { ILeaderboardRepository } from '../domain/dashboard-repository';

export function useLeaderboard(repo: ILeaderboardRepository) {
  const query = useQuery({
    queryKey: ['dashboard', 'leaderboard'],
    queryFn: () => repo.getLeaderboardData(),
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
