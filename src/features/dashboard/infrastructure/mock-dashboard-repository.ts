// src/features/dashboard/infrastructure/mock-dashboard-repositories.ts

import type {
  IUserRepository,
  IHomeRepository,
  ILeaderboardRepository,
  ICoursesRepository,
  IProfileRepository,
  IUserDetailRepository,
} from '../domain/dashboard-repository';
import type { CurrentUser } from '../domain/dashboard.types';
import { USER, STATS, ROADMAP, AI_SEED, AI_QUICK } from '../domain/dashboard.data';
import {
  PODIUM,
  LEADERBOARD,
  ACHIEVEMENTS,
  SETTINGS,
  PROFILE_STATS,
} from '../domain/dashboard.data';
import { Course, COURSES } from '../domain/courses.data';

// ---------- User Repository ----------
export class MockUserRepository implements IUserRepository {
  private cache: CurrentUser | null = null;
  async getCurrentUser(): Promise<CurrentUser> {
    if (this.cache) return this.cache;
    await delay(200);
    this.cache = { ...USER };
    return this.cache;
  }
}

// ---------- Home Repository ----------
export class MockHomeRepository implements IHomeRepository {
  private cache: Awaited<ReturnType<IHomeRepository['getHomeData']>> | null = null;
  async getHomeData() {
    if (this.cache) return this.cache;
    await delay(300);
    this.cache = { stats: STATS, roadmap: ROADMAP, aiSeed: AI_SEED, aiQuickReplies: AI_QUICK };
    return this.cache;
  }
}

// ---------- Leaderboard Repository ----------
export class MockLeaderboardRepository implements ILeaderboardRepository {
  private cache: Awaited<ReturnType<ILeaderboardRepository['getLeaderboardData']>> | null = null;
  async getLeaderboardData() {
    if (this.cache) return this.cache;
    await delay(400);
    this.cache = { podium: PODIUM, leaderboard: LEADERBOARD };
    return this.cache;
  }
}

// ---------- Courses Repository ----------
export class MockCoursesRepository implements ICoursesRepository {
  private cache: Course[] | null = null;

  async getCourses(): Promise<Course[]> {
    if (!this.cache) {
      await delay(250);
      this.cache = [...COURSES];
    }
    return this.cache;
  }
}

// ---------- Profile Repository ----------
export class MockProfileRepository implements IProfileRepository {
  private cache: Awaited<ReturnType<IProfileRepository['getProfileData']>> | null = null;
  async getProfileData() {
    if (this.cache) return this.cache;
    await delay(300);
    this.cache = {
      profileStats: PROFILE_STATS,
      achievements: ACHIEVEMENTS,
      settings: SETTINGS,
    };
    return this.cache;
  }
}

// ---------- User Detail Repository (for modal) ----------
export class MockUserDetailRepository implements IUserDetailRepository {
  async getUserDetail(userId: string): Promise<{
    id: string;
    name: string;
    avatar: string;
    level: number;
    title: string;
    xp: number;
    streak: number;
  }> {
    await delay(200);
    const row = LEADERBOARD.find((r) => r.name === userId || r.rank.toString() === userId);
    if (!row) throw new Error('User not found');

    const streak = parseInt(row.streak, 10) || 0;
    const xp = parseInt(row.points.replace(/\D/g, ''), 10) || 0;

    const level = Math.floor(streak / 3) + 1;

    // Simple title mapping
    const title = getTitleFromStreak(streak);

    return {
      id: row.rank.toString(),
      name: row.name,
      avatar: row.avatar,
      level,
      title,
      xp,
      streak,
    };
  }
}

// helper
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getTitleFromStreak(streak: number): string {
  if (streak >= 30) return 'ققنوس افسانه‌ای';
  if (streak >= 20) return 'ققنوس طلایی';
  if (streak >= 10) return 'ققنوس نقره‌ای';
  return 'ققنوس برنزی';
}
