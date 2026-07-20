'use client';

import { useQuery } from '@tanstack/react-query';
import type { ISeasonRepository } from '../domain/season-repository';

export function useSeason(repo: ISeasonRepository) {
  const query = useQuery({
    queryKey: ['dashboard', 'season', 'current'],
    queryFn: () => repo.getCurrentSeason(),
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
