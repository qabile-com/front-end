import type {
  Achievement,
  ActionRewardResult,
  SettingItem,
} from '@/features/dashboard/domain/dashboard.types';

export type ProfileSettingField = 'dailyReminder' | 'autoLogout' | 'weeklySummary';

export interface ProfileSecuritySettings {
  dailyReminder: boolean;
  autoLogout: boolean;
  weeklySummary: boolean;
}

export interface ProfileStats {
  xp: number;
  streak: number;
  followersCount: number;
  followingCount: number;
  forumLikesCount: number;
  forumCommentsCount: number;
  postsCount: number;
}

export interface VerificationResult {
  verificationToken: string;
}

export interface MyProfile {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  displayName: string;
  username?: string | null;
  bio?: string | null;
  initial: string;
  avatar: string;
  title: string;
  level: number;
  xp: number;
  xpMax: number;
  streak: number;
  phone?: string | null;
  isPhoneVerified?: boolean;
  email?: string | null;
  isEmailVerified?: boolean;
  verified?: boolean;
  rebirthCount?: number;
  role?: string;
  isCompleteOnboarding?: boolean;
  securitySettings: ProfileSecuritySettings;
  stats: ProfileStats;
  usedReferralCode?: string | null;
  profileStats: { value: string; label: string }[];
  achievements: Achievement[];
  settings: SettingItem[];
  posts?: {
    id: string;
    text: string;
    likes: number;
    commentsCount: number;
    time: string;
    image?: string;
    hasImage?: boolean;
    isPinned?: boolean;
  }[];
  actionReward?: ActionRewardResult | null;
}

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  username?: string | null;
  bio?: string | null;
  email?: string | null;
}

export interface XpHistoryItem {
  id: string;
  amount: number;
  sourceType: string;
  courseId?: string | null;
  episodeId?: string | null;
  roadmapStepId?: string | null;
  eventKey?: string | null;
  title?: string | null;
  meta?: Record<string, unknown> | null;
  createdAt: string;
}

export interface PaginatedXpHistory {
  items: XpHistoryItem[];
  totalItems: number;
  totalPages: number;
  limit: number;
  offset: number;
}

export interface IProfileRepository {
  getMyProfile(): Promise<MyProfile>;
  getXpHistory(
    params?: { limit?: number; offset?: number; q?: string },
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedXpHistory>;
  updateMyProfile(input: UpdateProfileInput): Promise<MyProfile>;
  updateProfileAvatar(file: File): Promise<MyProfile>;
  deleteProfileAvatar(): Promise<MyProfile>;
  requestEmailVerification(email: string): Promise<void>;
  deleteMyAccount(): Promise<void>;
  updateSecuritySetting(
    field: ProfileSettingField,
    value: boolean,
  ): Promise<ProfileSecuritySettings>;
  requestPhoneChangeCode(currentPhone: string): Promise<void>;
  verifyPhoneChangeCode(currentPhone: string, code: string): Promise<VerificationResult>;
  confirmPhoneChange(newPhone: string, verificationToken: string): Promise<MyProfile>;
  requestPasswordChangeCode(email: string): Promise<void>;
  verifyPasswordChangeCode(email: string, code: string): Promise<VerificationResult>;
  confirmPasswordChange(
    password: string,
    passwordConfirmation: string,
    verificationToken: string,
  ): Promise<void>;
  claimAchievement(achievementId: string): Promise<AchievementClaimResult>;
  getMyAchievements(options?: { signal?: AbortSignal }): Promise<Achievement[]>;
}

export interface AchievementClaimResult {
  id: string;
  slug?: string;
  title?: string;
  description?: string;
  xpEarned?: number;
  streak?: number;
  threshold?: number;
  unlocked: boolean;
  reward?: ActionRewardResult | null;
}
