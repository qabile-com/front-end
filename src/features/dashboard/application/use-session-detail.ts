'use client';

import { useQuery } from '@tanstack/react-query';
import type { ISessionRepository } from '../domain/session-repository';

export function useSessionDetail(
  repo: ISessionRepository,
  courseId: string | null,
  sectionId: string | null,
) {
  return useQuery({
    queryKey: ['dashboard', 'session', courseId, sectionId],
    queryFn: () => repo.getSessionDetail(courseId!, sectionId!),
    enabled: !!courseId && !!sectionId,
    staleTime: 5 * 60 * 1000,
  });
}
