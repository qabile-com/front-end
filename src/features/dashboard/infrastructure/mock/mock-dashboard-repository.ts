// src/features/dashboard/infrastructure/mock-dashboard-repositories.ts

import type {
  IUserRepository,
  IHomeRepository,
  ILeaderboardRepository,
  ICoursesRepository,
} from '../../domain/dashboard-repository';
import type {
  ActionRewardResult,
  CurrentUser,
  SectionWatchProgressInput,
  SectionWatchProgressResult,
} from '../../domain/dashboard.types';
import { USER as CURRENT_USER } from '../../domain/dashboard.data';
import { USER, STATS, ROADMAP, AI_SEED, AI_QUICK } from '../../domain/dashboard.data';
import {
  PODIUM,
  LEADERBOARD,
  ACHIEVEMENTS,
  SETTINGS,
  PROFILE_STATS,
} from '../../domain/dashboard.data';
import { Course, COURSES } from '@/features/courses/domain/courses.data';
import {
  IUserProfileRepository,
  UserProfileData,
  UserProfilePost,
} from '@/features/leaderboard/domain/user-profile-repository';
import type {
  IProfileRepository,
  MyProfile,
  ProfileSecuritySettings,
  ProfileSettingField,
  UpdateProfileInput,
  VerificationResult,
} from '@/features/profile/domain/profile-repository';
import { POSTS } from '@/features/social/domain/social.data';
import {
  applyMockWatchState,
  recordMockWatchProgress,
} from '@/features/courses/infrastructure/mock/mock-course-watch-store';

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
      this.cache = COURSES.map((course) => ({
        ...course,
        episodes: course.episodes.map((part) => applyMockWatchState({ ...part })),
      }));
    }
    this.cache = this.cache.map((course) => ({
      ...course,
      episodes: course.episodes.map((part) => applyMockWatchState(part)),
    }));
    return this.cache;
  }

  async updateSectionProgress(
    sectionId: string,
    body: { status: string; progress?: number },
  ): Promise<ActionRewardResult> {
    const courses = await this.getCourses();
    const part = courses.flatMap((course) => course.episodes).find((item) => item.id === sectionId);
    if (!part) throw new Error('Section not found');
    part.status = body.status === 'done' ? 'done' : body.status === 'partial' ? 'partial' : 'none';
    part.progress = body.progress;
    return {
      xpGranted: part.xp ?? 50,
      streak: {
        increased: true,
        previous: 23,
        current: 24,
        freezesRemaining: 2,
      },
      achievements:
        sectionId === 'c1-s1'
          ? [
              {
                icon: 'flame',
                label: 'آتش‌افروز',
                unlocked: true,
                slug: 'atash-afrooz',
                count: 1,
                isShareable: true,
                conditions: [
                  {
                    id: 'first-exercise',
                    label: 'انجام اولین تمرین',
                    passed: true,
                  },
                ],
              },
            ]
          : [],
    };
  }

  async reportSectionWatchProgress(
    sectionId: string,
    body: SectionWatchProgressInput,
  ): Promise<SectionWatchProgressResult> {
    await delay(200);
    const result = recordMockWatchProgress(sectionId, body);
    if (this.cache) {
      this.cache = this.cache.map((course) => ({
        ...course,
        episodes: course.episodes.map((part) =>
          part.id === sectionId ? { ...part, ...result.section } : part,
        ),
      }));
    }
    return result;
  }
}

// ---------- Profile Repository ----------
export class MockProfileRepository implements IProfileRepository {
  private cache: MyProfile | null = null;
  private securitySettings: ProfileSecuritySettings = {
    dailyReminder: true,
    autoLogout: true,
    weeklySummary: true,
  };

  async getMyProfile(): Promise<MyProfile> {
    if (this.cache) return this.cache;
    await delay(300);
    this.cache = {
      id: 'current-user',
      name: USER.name,
      lastName: USER.lastName,
      username: 'Sample',
      initial: USER.initial,
      avatar: USER.avatar,
      title: USER.title,
      level: USER.level,
      xp: USER.xp,
      xpMax: USER.xpMax,
      streak: 31,
      phone: '09123456789',
      isPhoneVerified: true,
      email: 'arash.karimi@example.com',
      isEmailVerified: true,
      role: 'user',
      securitySettings: this.securitySettings,
      profileStats: PROFILE_STATS,
      achievements: ACHIEVEMENTS,
      settings: SETTINGS,
      posts: POSTS.filter((post) => post.authorId === 'arash')
        .slice(0, 3)
        .map((post) => ({
          id: post.id,
          text: post.text,
          likes: post.likes,
          commentsCount: post.comments.length,
          time: post.time,
        })),
    };
    return this.cache;
  }

  async updateMyProfile(input: UpdateProfileInput): Promise<MyProfile> {
    await delay(250);
    const profile = await this.getMyProfile();
    this.cache = {
      ...profile,
      name: input.name?.trim() || profile.name,
      lastName: input.lastName?.trim() || profile.lastName,
      username: input.username ?? profile.username,
      email: input.email ?? profile.email,
      isEmailVerified:
        input.email && input.email !== profile.email ? false : profile.isEmailVerified,
    };
    return this.cache;
  }

  async updateProfileAvatar(file: File): Promise<MyProfile> {
    await delay(300);
    const profile = await this.getMyProfile();
    const objectUrl =
      typeof URL !== 'undefined' && URL.createObjectURL
        ? URL.createObjectURL(file)
        : profile.avatar;
    this.cache = { ...profile, avatar: objectUrl };
    return this.cache;
  }

  async requestEmailVerification(): Promise<void> {
    await delay(250);
  }

  async deleteMyAccount(): Promise<void> {
    await delay(250);
  }

  async updateSecuritySetting(
    field: ProfileSettingField,
    value: boolean,
  ): Promise<ProfileSecuritySettings> {
    await delay(200);
    this.securitySettings = { ...this.securitySettings, [field]: value };
    if (this.cache) {
      this.cache = { ...this.cache, securitySettings: this.securitySettings };
    }
    return this.securitySettings;
  }

  async requestPhoneChangeCode(): Promise<void> {
    await delay(250);
  }

  async verifyPhoneChangeCode(): Promise<VerificationResult> {
    await delay(250);
    return { verificationToken: 'mock-phone-verification-token' };
  }

  async confirmPhoneChange(newPhone: string): Promise<MyProfile> {
    await delay(250);
    const profile = await this.getMyProfile();
    this.cache = { ...profile, phone: newPhone };
    return this.cache;
  }

  async requestPasswordChangeCode(): Promise<void> {
    await delay(250);
  }

  async verifyPasswordChangeCode(): Promise<VerificationResult> {
    await delay(250);
    return { verificationToken: 'mock-password-verification-token' };
  }

  async confirmPasswordChange(): Promise<void> {
    await delay(250);
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
    const email = 'arash.karimi@example.com';

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

    const userPosts = await this.getUserPosts(userId, 3, 0);

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
      achievements: [],
      posts: userPosts,
    };
  }

  async getUserPosts(userId: string, limit = 6, offset = 0): Promise<UserProfilePost[]> {
    await delay(120);
    const authorId = userId === CURRENT_USER.name ? 'arash' : userId;

    return POSTS.filter((post) => post.authorId === authorId)
      .slice(offset, offset + limit)
      .map((post) => ({
        id: post.id,
        text: post.text,
        likes: post.likes,
        comments: post.comments,
        time: post.time,
        image: post.image,
        hasImage: post.hasImage,
      }));
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
