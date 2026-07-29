// src/features/dashboard/domain/dashboard-repository.ts

import type {
  ActionRewardResult,
  ChatMessage,
  CurrentUser,
  RoadmapItem,
  SectionWatchProgressInput,
  SectionWatchProgressResult,
  StatCard,
} from './dashboard.types';
import type { PodiumPlace, LbRow } from './dashboard.types';
import type { Course } from '@/features/courses/domain/courses.data';
import type { IProfileRepository } from '@/features/profile/domain/profile-repository';

/**
 * Repository for the currently logged‑in user.
 */
export interface IUserRepository {
  getCurrentUser(): Promise<CurrentUser>;
  updateOnboardingCompletion(isCompleteOnboarding: boolean): Promise<CurrentUser>;
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
  purchaseCourse(courseId: string): Promise<CoursePurchaseResult>;
  updateSectionProgress(
    sectionId: string,
    body: { status: string; progress?: number },
  ): Promise<ActionRewardResult>;
  reportSectionWatchProgress(
    sectionId: string,
    body: SectionWatchProgressInput,
  ): Promise<SectionWatchProgressResult>;
}

export interface CoursePurchaseResult {
  courseId: string;
  course?: Course;
  balance: {
    fire: number;
  };
  spentFire: number;
  isUnlocked: boolean;
}

export type { IProfileRepository };

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
