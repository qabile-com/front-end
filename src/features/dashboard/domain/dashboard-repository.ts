// src/features/dashboard/domain/dashboard-repository.ts

import type { CurrentUser, StatCard, RoadmapItem, ChatMessage } from './dashboard.types';
import type { PodiumPlace, LbRow } from './dashboard.types';
import type { Achievement, SettingItem } from './dashboard.types';
import type { Course } from './courses.data';

/**
 * Repository for the currently logged‑in user.
 */
export interface IUserRepository {
  getCurrentUser(): Promise<CurrentUser>;
}

/**
 * Home tab data.
 */
export interface IHomeRepository {
  getHomeData(): Promise<{
    stats: StatCard[];
    roadmap: RoadmapItem[];
    aiSeed: ChatMessage;
    aiQuickReplies: { label: string; send: string }[];
  }>;
}

/**
 * Leaderboard data.
 */
export interface ILeaderboardRepository {
  getLeaderboardData(): Promise<{
    podium: PodiumPlace[];
    leaderboard: LbRow[];
  }>;
}

/**
 * Courses data.
 */
export interface ICoursesRepository {
  getCourses(): Promise<Course[]>;
}

/**
 * Profile data (excluding current user).
 */
export interface IProfileRepository {
  getProfileData(): Promise<{
    profileStats: { value: string; label: string }[];
    achievements: Achievement[];
    settings: SettingItem[];
  }>;
}

/**
 * User detail for the leaderboard modal.
 * Returns a subset of user info (name, avatar, level, stats, etc.)
 */
// export interface IUserDetailRepository {
//   getUserProfile(userId: string): Promise<{
//     id: string;
//     name: string;
//     avatar: string;
//     level: number;
//     title: string;
//     xp: number;
//     streak: number;
//     // add more fields as needed later
//   }>;
// }
