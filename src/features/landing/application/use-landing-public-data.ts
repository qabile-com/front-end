'use client';

import { useQuery } from '@tanstack/react-query';
import type { ILandingPublicRepository } from '../domain/landing-repository';

export function useLandingPublicData(repo: ILandingPublicRepository) {
  const stats = useQuery({
    queryKey: ['landing-stats'],
    queryFn: () => repo.getStats(),
    staleTime: 5 * 60 * 1000,
  });
  const testimonials = useQuery({
    queryKey: ['landing-testimonials'],
    queryFn: () => repo.getTestimonials(),
    staleTime: 5 * 60 * 1000,
  });
  const leaderboard = useQuery({
    queryKey: ['landing-leaderboard'],
    queryFn: () => repo.getLeaderboard(),
    staleTime: 5 * 60 * 1000,
  });
  return { stats, testimonials, leaderboard };
}
