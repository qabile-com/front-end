'use client';

import { useQuery } from '@tanstack/react-query';
import type { ISocialRepository } from '../domain/social-repository';

export const postingStatusQueryKey = ['social', 'posting-status'] as const;

export function usePostingStatus(repo: ISocialRepository) {
  return useQuery({
    queryKey: postingStatusQueryKey,
    queryFn: ({ signal }) => repo.getPostingStatus({ signal }),
    staleTime: 30_000,
    retry: 1,
  });
}
