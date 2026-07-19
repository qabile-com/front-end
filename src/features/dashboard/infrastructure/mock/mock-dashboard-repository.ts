// src/features/dashboard/infrastructure/mock-dashboard-repositories.ts

import type {
  IUserRepository,
  IHomeRepository,
  ILeaderboardRepository,
  ICoursesRepository,
  IProfileRepository,
} from '../../domain/dashboard-repository';
import type { CurrentUser } from '../../domain/dashboard.types';
import { USER as CURRENT_USER } from '../../domain/dashboard.data';
import { USER, STATS, ROADMAP, AI_SEED, AI_QUICK } from '../../domain/dashboard.data';
import {
  PODIUM,
  LEADERBOARD,
  ACHIEVEMENTS,
  SETTINGS,
  PROFILE_STATS,
} from '../../domain/dashboard.data';
import { Course, COURSES } from '../../domain/courses.data';
import { IUserProfileRepository, UserProfileData } from '../../domain/user-profile-repository';
import { POSTS } from '../../domain/social.data';

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
export class MockUserDetailRepository implements IUserProfileRepository {
  async getUserProfile(userId: string): Promise<UserProfileData> {
    await delay(200);
    let name = userId;
    let avatar = 'linear-gradient(135deg,#ff8a3d,#cc4308)';
    let title = 'ققنوس طلایی';
    let level = 24;
    let xp = 6800;
    let xpMax = 10000;
    let streak = 31;
    const peersFollowed = 120;
    const peersFollowing = 85;
    const phone = '09123456789';
    const email = null;

    if (userId === CURRENT_USER.name) {
      name = CURRENT_USER.name;
      avatar = CURRENT_USER.avatar;
      title = CURRENT_USER.title;
      level = CURRENT_USER.level;
      xp = CURRENT_USER.xp;
      xpMax = CURRENT_USER.xpMax;
      // streak not in CurrentUser, we'll keep default
    } else {
      const row = LEADERBOARD.find((r) => r.name === userId);
      if (row) {
        name = row.name;
        avatar = row.avatar;
        const streakNum = parseInt(row.streak, 10) || 0;
        level = Math.floor(streakNum / 3) + 1 || 1;
        title = getTitleFromStreak(streakNum);
        xp = parseInt(row.points.replace(/\D/g, ''), 10) || 0;
        xpMax = 10000;
        streak = streakNum;
      }
    }

    const userPosts = POSTS.filter(
      (p) => p.authorId === (userId === CURRENT_USER.name ? 'arash' : 'other'),
    )
      .slice(0, 3)
      .map((p) => ({
        id: p.id,
        text: p.text,
        likes: p.likes,
        comments: p.comments,
        time: p.time,
      }));

    return {
      id: userId,
      name,
      avatar,
      title,
      level,
      phone,
      email,
      role: 'user',
      xp,
      xpMax,
      streak,
      stats: {
        xp,
        streak,
        peersFollowed,
        peersFollowing,
      },
      profileStats: [{ value: `${streak}`, label: 'روز زنجیره' }],
      posts: userPosts,
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
