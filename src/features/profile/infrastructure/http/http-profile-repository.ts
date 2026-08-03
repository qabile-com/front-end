import {
  confirmPasswordChange,
  confirmPhoneChange,
  deleteMyAccount,
  getMyProfile,
  getMyXpHistory,
  requestPasswordChangeCode,
  requestEmailVerification,
  requestPhoneChangeCode,
  updateMyProfile,
  updateMyProfileAvatar,
  updateMyProfileSetting,
  verifyPasswordChangeCode,
  verifyPhoneChangeCode,
} from '@/core/api/users.api';
import type {
  IProfileRepository,
  MyProfile,
  PaginatedXpHistory,
  ProfileSecuritySettings,
  ProfileSettingField,
  UpdateProfileInput,
  VerificationResult,
  XpHistoryItem,
} from '../../domain/profile-repository';
import { DEFAULT_AVATAR_GRADIENT } from '@/features/dashboard/domain/dashboard.types';
import {
  normalizeAchievements,
  normalizeActionRewardResult,
} from '@/features/dashboard/domain/achievement-normalizer';

const DEFAULT_SECURITY_SETTINGS: ProfileSecuritySettings = {
  dailyReminder: true,
  autoLogout: true,
  weeklySummary: true,
};

type MyProfileDto = Omit<
  MyProfile,
  | 'name'
  | 'firstName'
  | 'lastName'
  | 'displayName'
  | 'initial'
  | 'avatar'
  | 'posts'
  | 'achievements'
> & {
  name?: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  initial?: string;
  avatar?: string | null;
  securitySettings?: Partial<ProfileSecuritySettings>;
  achievements?: (MyProfile['achievements'][number] & {
    timesAchieved?: number;
    earnedCount?: number;
    shareable?: boolean;
  })[];
  posts?: {
    id: string;
    text: string;
    likes: number;
    commentsCount?: number;
    comments?: unknown[];
    time?: string;
    createdAt?: string;
  }[];
};

type XpHistoryDto = Omit<XpHistoryItem, 'title'> & {
  meta?: (Record<string, unknown> & { title?: string | null }) | null;
  title?: string | null;
};

type PaginatedXpHistoryDto = {
  data?: XpHistoryDto[];
  meta?: {
    limit?: number;
    offset?: number;
    totalItems?: number;
    totalPages?: number;
  };
};

export class HttpProfileRepository implements IProfileRepository {
  async getMyProfile(): Promise<MyProfile> {
    const res = await getMyProfile();
    const p = (res.data.data ?? res.data) as MyProfileDto;
    return this.normalizeProfile(p, res.data);
  }

  async getXpHistory(
    params?: {
      limit?: number;
      offset?: number;
      q?: string;
    },
    options?: { signal?: AbortSignal },
  ): Promise<PaginatedXpHistory> {
    const res = await getMyXpHistory(params, options);
    const payload = (res.data ?? {}) as PaginatedXpHistoryDto | XpHistoryDto[];
    const items = Array.isArray(payload) ? payload : (payload.data ?? []);
    const meta = Array.isArray(payload) ? undefined : payload.meta;

    return {
      items: items.map((item) => ({
        ...item,
        title: item.title ?? item.meta?.title ?? null,
      })),
      limit: meta?.limit ?? params?.limit ?? items.length,
      offset: meta?.offset ?? params?.offset ?? 0,
      totalItems: meta?.totalItems ?? items.length,
      totalPages: meta?.totalPages ?? 1,
    };
  }

  async updateMyProfile(input: UpdateProfileInput): Promise<MyProfile> {
    const firstName = input.firstName?.trim();
    const lastName = input.lastName?.trim();
    const displayName =
      input.displayName?.trim() || [firstName, lastName].filter(Boolean).join(' ');

    const res = await updateMyProfile({
      firstName,
      lastName,
      displayName,
      username: input.username?.trim() || null,
    });
    const data = res.data.data ?? res.data;
    return this.normalizeProfile(data as MyProfileDto, res.data);
  }

  async updateProfileAvatar(file: File): Promise<MyProfile> {
    const res = await updateMyProfileAvatar(file);
    const data = res.data.data ?? res.data;
    return this.normalizeProfile(data as MyProfileDto, res.data);
  }

  async requestEmailVerification(email: string): Promise<void> {
    await requestEmailVerification(email);
  }

  async deleteMyAccount(): Promise<void> {
    await deleteMyAccount();
  }

  async updateSecuritySetting(
    field: ProfileSettingField,
    value: boolean,
  ): Promise<ProfileSecuritySettings> {
    const res = await updateMyProfileSetting(field, value);
    const data = (res.data.data ?? res.data) as Partial<ProfileSecuritySettings>;
    return { ...DEFAULT_SECURITY_SETTINGS, ...data, [field]: value };
  }

  async requestPhoneChangeCode(currentPhone: string): Promise<void> {
    await requestPhoneChangeCode(currentPhone);
  }

  async verifyPhoneChangeCode(currentPhone: string, code: string): Promise<VerificationResult> {
    const res = await verifyPhoneChangeCode(currentPhone, code);
    return res.data.data ?? res.data;
  }

  async confirmPhoneChange(newPhone: string, verificationToken: string): Promise<MyProfile> {
    const res = await confirmPhoneChange(newPhone, verificationToken);
    return this.normalizeProfile((res.data.data ?? res.data) as MyProfileDto);
  }

  async requestPasswordChangeCode(email: string): Promise<void> {
    await requestPasswordChangeCode(email);
  }

  async verifyPasswordChangeCode(email: string, code: string): Promise<VerificationResult> {
    const res = await verifyPasswordChangeCode(email, code);
    return res.data.data ?? res.data;
  }

  async confirmPasswordChange(
    password: string,
    passwordConfirmation: string,
    verificationToken: string,
  ): Promise<void> {
    await confirmPasswordChange(password, passwordConfirmation, verificationToken);
  }

  private normalizeProfile(p: MyProfileDto, rewardPayload?: unknown): MyProfile {
    const firstName = p.firstName ?? '';
    const lastName = p.lastName ?? '';
    const displayName = p.displayName ?? [firstName, lastName].filter(Boolean).join(' ');
    const name = displayName || p.name || firstName || '';

    return {
      id: p.id,
      name,
      firstName,
      lastName,
      displayName,
      username: p.username,
      initial: p.initial ?? name[0] ?? '?',
      avatar: p.avatar ?? DEFAULT_AVATAR_GRADIENT,
      title: p.title,
      level: p.level,
      xp: p.xp,
      xpMax: p.xpMax,
      streak: p.streak,
      phone: p.phone,
      isPhoneVerified: p.isPhoneVerified,
      email: p.email,
      isEmailVerified: p.isEmailVerified,
      role: p.role,
      isCompleteOnboarding: p.isCompleteOnboarding ?? false,
      securitySettings: { ...DEFAULT_SECURITY_SETTINGS, ...p.securitySettings },
      profileStats: p.profileStats ?? [],
      achievements: normalizeAchievements(p.achievements),
      settings: p.settings ?? [],
      posts: (p.posts ?? []).map((post) => ({
        id: post.id,
        text: post.text,
        likes: post.likes,
        commentsCount: post.commentsCount ?? post.comments?.length ?? 0,
        time: post.time ?? post.createdAt ?? '',
      })),
      actionReward: normalizeActionRewardResult(rewardPayload ?? p),
    };
  }
}
