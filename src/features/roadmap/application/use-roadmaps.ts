'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import type { IRoadmapRepository } from '../domain/roadmap-repository';
import { roadmapKeys } from './roadmap-query-keys';

const ROADMAPS_PAGE_SIZE = 20;

export function useRoadmaps(repo: IRoadmapRepository, params: { q?: string } = {}) {
  const query = useInfiniteQuery({
    queryKey: roadmapKeys.list(params),
    queryFn: ({ pageParam = 0, signal }) =>
      repo.getRoadmaps(
        { limit: ROADMAPS_PAGE_SIZE, offset: pageParam * ROADMAPS_PAGE_SIZE, q: params.q },
        { signal },
      ),
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.length * ROADMAPS_PAGE_SIZE;
      return loaded < lastPage.meta.totalItems ? allPages.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 60_000,
    retry: 1,
  });

  return {
    roadmaps: query.data?.pages.flatMap((page) => page.roadmaps) ?? [],
    meta: query.data?.pages.at(-1)?.meta ?? null,
    loading: query.isPending,
    error: query.error instanceof Error ? query.error.message : null,
    rawError: query.error,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    fetchNextPage: query.fetchNextPage,
  };
}
