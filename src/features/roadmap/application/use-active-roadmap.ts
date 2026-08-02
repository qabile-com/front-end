'use client';

import { useQuery } from '@tanstack/react-query';
import type { IRoadmapRepository } from '../domain/roadmap-repository';
import { roadmapKeys } from './roadmap-query-keys';

export function useActiveRoadmap(repo: IRoadmapRepository) {
  const query = useQuery({
    queryKey: roadmapKeys.active(),
    queryFn: ({ signal }) => repo.getActiveRoadmap({ signal }),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  return {
    roadmap: query.data ?? null,
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    rawError: query.error,
    refetch: query.refetch,
  };
}
