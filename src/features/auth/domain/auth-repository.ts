import type { StoredAuthUser } from '@/core/auth/token';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  role: string;
  title?: string;
  level?: number;
  xp?: number;
  xpMax?: number;
  streak?: number;
}

export interface AuthSession {
  accessToken: string;
  tokenType?: string;
  expiresInSeconds?: number;
  user: StoredAuthUser;
}

export interface VerifyOtpResult {
  accessToken: string;
  tokenType?: string;
  expiresAt?: number | string;
  refreshToken?: string;
  user: AuthUser;
  isNewUser?: boolean;
  signupReward?: {
    xpGranted: number;
    ruleCode: string;
    ruleTitle: string;
  };
  unlockedAchievements?: unknown[];
}

export interface IAuthRepository {
  login(email: string, password: string): Promise<VerifyOtpResult>;
  requestOtp(identifier: string): Promise<void>;
  verifyOtp(
    identifier: string,
    code: string,
    name?: string,
    lastName?: string,
  ): Promise<VerifyOtpResult>;
  requestForgotPassword(email: string): Promise<void>;
  verifyForgotPassword(email: string, code: string): Promise<{ verificationToken: string }>;
  resetPassword(
    verificationToken: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<void>;
  getMe(): Promise<AuthUser>;
}
