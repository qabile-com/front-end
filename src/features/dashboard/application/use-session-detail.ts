'use client';

import { useQuery } from '@tanstack/react-query';
import type { ISessionRepository } from '../domain/session-repository';

export function useSessionDetail(
  repo: ISessionRepository,
  courseId: string | null,
  partTitle: string | null,
) {
  return useQuery({
    queryKey: ['session-detail', courseId, partTitle],
    queryFn: () => repo.getSessionDetail(courseId!, partTitle!),
    enabled: !!courseId && !!partTitle,
    staleTime: 5 * 60 * 1000,
  });
}
