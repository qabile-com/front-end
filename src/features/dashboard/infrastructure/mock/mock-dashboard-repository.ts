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
  PaginatedXpHistory,
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

let mockCurrentUser: CurrentUser = { ...USER };

// ---------- User Repository ----------
export class MockUserRepository implements IUserRepository {
  private cache: CurrentUser | null = null;
  async getCurrentUser(): Promise<CurrentUser> {
    await delay(200);
    this.cache = { ...mockCurrentUser };
    return this.cache;
  }

  async updateOnboardingCompletion(isCompleteOnboarding: boolean): Promise<CurrentUser> {
    await delay(180);
    mockCurrentUser = { ...mockCurrentUser, isCompleteOnboarding };
    this.cache = { ...mockCurrentUser };
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
        isUnlocked: course.isUnlocked ?? course.isPurchased ?? course.isFree ?? false,
        episodes: course.episodes.map((part) =>
          applyMockWatchState({
            ...part,
            isUnlocked: course.isUnlocked ?? course.isPurchased ?? course.isFree ?? false,
            requiresPurchase: !(course.isUnlocked ?? course.isPurchased ?? course.isFree ?? false),
          }),
        ),
      }));
    }
    this.cache = this.cache.map((course) => ({
      ...course,
      isUnlocked: course.isUnlocked ?? course.isPurchased ?? course.isFree ?? false,
      episodes: course.episodes.map((part) =>
        applyMockWatchState({
          ...part,
          isUnlocked: course.isUnlocked ?? course.isPurchased ?? course.isFree ?? false,
          requiresPurchase: !(course.isUnlocked ?? course.isPurchased ?? course.isFree ?? false),
        }),
      ),
    }));
    return this.cache;
  }

  async purchaseCourse(courseId: string) {
    await delay(350);
    const courses = await this.getCourses();
    const course = courses.find((item) => item.id === courseId);
    if (!course) throw new Error('Course not found');
    if (course.isPurchased || course.isFree) {
      course.isPurchased = true;
      course.isUnlocked = true;
      return {
        courseId: course.id,
        course: { ...course, isPurchased: true, isUnlocked: true },
        balance: { fire: mockCurrentUser.xp },
        spentFire: 0,
        isUnlocked: true,
      };
    }

    const price = course.priceInFire ?? 0;
    if (price > mockCurrentUser.xp) {
      throw new Error('آتش کافی برای خرید این دوره نداری.');
    }

    mockCurrentUser = { ...mockCurrentUser, xp: mockCurrentUser.xp - price };
    course.isPurchased = true;
    course.isUnlocked = true;
    this.cache = courses.map((item) =>
      item.id === courseId ? { ...item, isPurchased: true, isUnlocked: true } : item,
    );

    return {
      courseId: course.id,
      course: { ...course, isPurchased: true, isUnlocked: true },
      balance: { fire: mockCurrentUser.xp },
      spentFire: price,
      isUnlocked: true,
    };
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

  async markEpisodeWatched(courseId: string, episodeId: string) {
    await delay(200);
    if (this.cache) {
      this.cache = this.cache.map((course) =>
        course.id === courseId
          ? {
              ...course,
              episodes: course.episodes.map((part) =>
                part.id === episodeId ? { ...part, status: 'done' as const, progress: 100 } : part,
              ),
            }
          : course,
      );
    }

    return { success: true, reward: null, courseProgress: null };
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
      firstName: USER.name,
      lastName: USER.lastName,
      displayName: [USER.name, USER.lastName].filter(Boolean).join(' '),
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
      stats: {
        xp: USER.xp,
        streak: 31,
        followersCount: 0,
        followingCount: 1,
        forumLikesCount: 0,
        forumCommentsCount: 0,
        postsCount: POSTS.filter((post) => post.authorId === 'arash').length,
      },
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

  async getXpHistory(params?: {
    limit?: number;
    offset?: number;
    q?: string;
  }): Promise<PaginatedXpHistory> {
    await delay(220);
    const limit = params?.limit ?? 10;
    const offset = params?.offset ?? 0;
    const q = params?.q?.trim().toLowerCase();
    const allItems = [
      {
        id: 'history-1',
        amount: 90,
        sourceType: 'episode',
        courseId: 'c1',
        episodeId: 'c1-s1',
        roadmapStepId: null,
        eventKey: 'episode:current-user:c1-s1:done',
        title: 'قدم اول: ذهن‌آگاهی',
        meta: { title: 'قدم اول: ذهن‌آگاهی' },
        createdAt: '2026-07-28T12:00:00.000Z',
      },
      {
        id: 'history-2',
        amount: 50,
        sourceType: 'roadmap',
        courseId: null,
        episodeId: null,
        roadmapStepId: 'step-1',
        eventKey: 'roadmap:current-user:step-1:done',
        title: 'از خاکستر پرواز آغاز می‌شود',
        meta: { title: 'از خاکستر پرواز آغاز می‌شود' },
        createdAt: '2026-07-27T15:30:00.000Z',
      },
      {
        id: 'history-3',
        amount: -650,
        sourceType: 'course_purchase',
        courseId: 'c3',
        episodeId: null,
        roadmapStepId: null,
        eventKey: 'course:current-user:c3:purchase',
        title: 'خرید کورس عادت‌سازی اتمی',
        meta: { title: 'خرید کورس عادت‌سازی اتمی' },
        createdAt: '2026-07-26T10:12:00.000Z',
      },
      {
        id: 'history-4',
        amount: 150,
        sourceType: 'achievement',
        courseId: null,
        episodeId: null,
        roadmapStepId: null,
        eventKey: 'achievement:current-user:atash-afrooz',
        title: 'دستاورد آتش‌افروز',
        meta: { title: 'دستاورد آتش‌افروز' },
        createdAt: '2026-07-25T09:10:00.000Z',
      },
    ];
    const filtered = q
      ? allItems.filter(
          (item) =>
            item.title.toLowerCase().includes(q) || item.sourceType.toLowerCase().includes(q),
        )
      : allItems;

    return {
      items: filtered.slice(offset, offset + limit),
      limit,
      offset,
      totalItems: filtered.length,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    };
  }

  async updateMyProfile(input: UpdateProfileInput): Promise<MyProfile> {
    await delay(250);
    const profile = await this.getMyProfile();
    this.cache = {
      ...profile,
      firstName: input.firstName?.trim() || profile.firstName,
      lastName: input.lastName?.trim() || profile.lastName,
      displayName:
        input.displayName?.trim() ||
        [input.firstName?.trim() || profile.firstName, input.lastName?.trim() || profile.lastName]
          .filter(Boolean)
          .join(' '),
      name:
        input.displayName?.trim() ||
        [input.firstName?.trim() || profile.firstName, input.lastName?.trim() || profile.lastName]
          .filter(Boolean)
          .join(' '),
      username: input.username ?? profile.username,
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

  async deleteProfileAvatar(): Promise<MyProfile> {
    await delay(200);
    const profile = await this.getMyProfile();
    this.cache = { ...profile, avatar: CURRENT_USER.avatar };
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

  async claimAchievement(achievementId: string) {
    await delay(250);
    return { id: achievementId, unlocked: true, reward: null };
  }

  async getMyAchievements() {
    await delay(200);
    const profile = await this.getMyProfile();
    return profile.achievements;
  }

  async getRebirthStatus() {
    await delay(200);
    const profile = await this.getMyProfile();
    const requiredXp = 100000;

    return {
      rebirthCount: 0,
      maxRebirthCount: 3,
      verified: Boolean(profile.verified),
      rebirthVerifiedAt: null,
      canRebirth: profile.xp >= requiredXp,
      maxReached: false,
      requiredXp,
      currentXp: profile.xp,
      xpShortage: Math.max(0, requiredXp - profile.xp),
      nextRule: { rebirthNumber: 1, title: 'Rebirth #1', requiredXp, isActive: true },
    };
  }

  async performRebirth() {
    await delay(300);
    const profile = await this.getMyProfile();

    return {
      rebirthCount: 1,
      verified: true,
      rebirthVerifiedAt: new Date().toISOString(),
      completedRebirthNumber: 1,
      burnedXp: profile.xp,
      requiredXp: 100000,
      nextAvailableRebirthNumber: 2,
      maxRebirthCount: 3,
    };
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

  async blockUser(): Promise<void> {
    await delay(120);
  }

  async unblockUser(): Promise<void> {
    await delay(120);
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
