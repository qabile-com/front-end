'use client';

import { useQuery } from '@tanstack/react-query';
import type { IRoadmapRepository } from '../domain/roadmap-repository';
import { roadmapKeys } from './roadmap-query-keys';

export function useRoadmaps(
  repo: IRoadmapRepository,
  params: { limit?: number; offset?: number; q?: string } = {},
) {
  const query = useQuery({
    queryKey: roadmapKeys.list(params),
    queryFn: ({ signal }) => repo.getRoadmaps(params, { signal }),
    staleTime: 60_000,
    retry: 1,
  });

  return {
    roadmaps: query.data?.roadmaps ?? [],
    meta: query.data?.meta ?? null,
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    rawError: query.error,
    refetch: query.refetch,
  };
}
