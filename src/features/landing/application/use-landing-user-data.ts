'use client';

import { useQuery } from '@tanstack/react-query';
import type { ILandingUserRepository } from '../domain/landing-repository';

export function useLandingUserData(repo: ILandingUserRepository) {
  return useQuery({
    queryKey: ['landing-user'],
    queryFn: () => repo.getPersonalisedData(),
    staleTime: 10 * 60 * 1000,
  });
}
