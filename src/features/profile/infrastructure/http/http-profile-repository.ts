import {
  confirmPasswordChange,
  confirmPhoneChange,
  deleteMyAccount,
  getMyProfile,
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
  ProfileSecuritySettings,
  ProfileSettingField,
  UpdateProfileInput,
  VerificationResult,
} from '../../domain/profile-repository';
import { DEFAULT_AVATAR_GRADIENT } from '@/features/dashboard/domain/dashboard.types';

const DEFAULT_SECURITY_SETTINGS: ProfileSecuritySettings = {
  dailyReminder: true,
  autoLogout: true,
  weeklySummary: true,
};

type MyProfileDto = Omit<MyProfile, 'initial' | 'avatar' | 'posts' | 'achievements'> & {
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

export class HttpProfileRepository implements IProfileRepository {
  async getMyProfile(): Promise<MyProfile> {
    const res = await getMyProfile();
    const p = (res.data.data ?? res.data) as MyProfileDto;

    return {
      id: p.id,
      name: p.name,
      lastName: p.lastName,
      username: p.username,
      initial: p.initial ?? p.name[0] ?? '?',
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
      securitySettings: { ...DEFAULT_SECURITY_SETTINGS, ...p.securitySettings },
      profileStats: p.profileStats ?? [],
      achievements: (p.achievements ?? []).map((achievement) => ({
        ...achievement,
        count: achievement.count ?? achievement.timesAchieved ?? achievement.earnedCount,
        isShareable: achievement.isShareable ?? achievement.shareable,
      })),
      settings: p.settings ?? [],
      posts: (p.posts ?? []).map((post) => ({
        id: post.id,
        text: post.text,
        likes: post.likes,
        commentsCount: post.commentsCount ?? post.comments?.length ?? 0,
        time: post.time ?? post.createdAt ?? '',
      })),
    };
  }

  async updateMyProfile(input: UpdateProfileInput): Promise<MyProfile> {
    const res = await updateMyProfile(input);
    const data = res.data.data ?? res.data;
    return this.normalizeProfile(data as MyProfileDto);
  }

  async updateProfileAvatar(file: File): Promise<MyProfile> {
    const res = await updateMyProfileAvatar(file);
    const data = res.data.data ?? res.data;
    return this.normalizeProfile(data as MyProfileDto);
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

  async verifyPhoneChangeCode(
    currentPhone: string,
    code: string,
  ): Promise<VerificationResult> {
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

  private normalizeProfile(p: MyProfileDto): MyProfile {
    return {
      id: p.id,
      name: p.name,
      lastName: p.lastName,
      username: p.username,
      initial: p.initial ?? p.name[0] ?? '?',
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
      securitySettings: { ...DEFAULT_SECURITY_SETTINGS, ...p.securitySettings },
      profileStats: p.profileStats ?? [],
      achievements: (p.achievements ?? []).map((achievement) => ({
        ...achievement,
        count: achievement.count ?? achievement.timesAchieved ?? achievement.earnedCount,
        isShareable: achievement.isShareable ?? achievement.shareable,
      })),
      settings: p.settings ?? [],
      posts: (p.posts ?? []).map((post) => ({
        id: post.id,
        text: post.text,
        likes: post.likes,
        commentsCount: post.commentsCount ?? post.comments?.length ?? 0,
        time: post.time ?? post.createdAt ?? '',
      })),
    };
  }
}
