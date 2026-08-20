import { httpClient } from './http-client';

export interface LandingLeaderboardRowDto {
  rank: number;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  username?: string | null;
  title: string;
  level: number;
  xp: number;
  avatar?: string | null;
  verified: boolean;
}

export interface LandingStatsDto {
  activeMembersCount: number;
  completedLessonsAndCoursesCount: number;
  completedLessonsCount: number;
  completedCoursesCount: number;
}

export interface LandingDataDto {
  leaderboard: LandingLeaderboardRowDto[];
  stats: LandingStatsDto;
}

export const getLandingData = (options?: { signal?: AbortSignal }) =>
  httpClient.get<{ data: LandingDataDto }>('/api/v1/landing', { signal: options?.signal });
