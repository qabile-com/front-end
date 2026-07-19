import type { Testimonial, PodiumPlace, LeaderboardRow } from './landing.types';
import type { CurrentUser } from '@/features/dashboard/domain/dashboard.types';

export interface ILandingPublicRepository {
  getStats(): Promise<{
    totalMembers: number;
    rating: number;
  }>;
  getTestimonials(): Promise<Testimonial[]>;
  getLeaderboard(): Promise<{
    podium: PodiumPlace[];
    leaderboard: LeaderboardRow[];
  }>;
}

export interface ILandingUserRepository {
  getPersonalisedData(): Promise<{
    user: CurrentUser | null;
    chips: { icon: string; value: string; label: string }[] | null;
  }>;
}
