import type { Achievement, SettingItem } from './dashboard.types';

export type ProfileSettingField = 'dailyReminder' | 'autoLogout' | 'weeklySummary';

export interface ProfileSecuritySettings {
  dailyReminder: boolean;
  autoLogout: boolean;
  weeklySummary: boolean;
}

export interface VerificationResult {
  verificationToken: string;
}

export interface MyProfile {
  id: string;
  name: string;
  username?: string | null;
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
  role?: string;
  securitySettings: ProfileSecuritySettings;
  profileStats: { value: string; label: string }[];
  achievements: Achievement[];
  settings: SettingItem[];
  posts?: {
    id: string;
    text: string;
    likes: number;
    commentsCount: number;
    time: string;
  }[];
}

export interface UpdateProfileInput {
  name?: string;
  username?: string | null;
  email?: string | null;
}

export interface IProfileRepository {
  getMyProfile(): Promise<MyProfile>;
  updateMyProfile(input: UpdateProfileInput): Promise<MyProfile>;
  updateProfileAvatar(file: File): Promise<MyProfile>;
  requestEmailVerification(email: string): Promise<void>;
  deleteMyAccount(): Promise<void>;
  updateSecuritySetting(field: ProfileSettingField, value: boolean): Promise<ProfileSecuritySettings>;
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
}
