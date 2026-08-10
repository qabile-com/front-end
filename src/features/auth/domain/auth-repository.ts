import type { StoredAuthUser } from '@/core/auth/token';

export interface AuthUser {
  id: string;
  name: string;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  username?: string | null;
  phone?: string | null;
  email?: string | null;
  role: string;
  title?: string;
  level?: number;
  xp?: number;
  xpMax?: number;
  streak?: number;
  isCompleteOnboarding?: boolean;
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
  refreshTokenExpiresAt?: number | string;
  refreshToken?: string;
  user: AuthUser;
  isNewUser?: boolean;
  signupReward?: {
    xpGranted: number;
    ruleCode: string;
    ruleTitle: string;
  };
  firstLoginReward?: {
    xpGranted: number;
    ruleCode: string;
    ruleTitle: string;
  };
  unlockedAchievements?: unknown[];
}

export interface GoogleAuthPayload {
  accessToken?: string;
  referralCode?: string;
  refreshToken?: string;
  code?: string;
  tokenType?: string;
  expiresIn?: number;
  scope?: string;
  mock?: boolean;
  mockEmail?: string;
  mockName?: string;
}

export interface IAuthRepository {
  login(email: string, password: string): Promise<VerifyOtpResult>;
  loginWithGoogle(payload: GoogleAuthPayload): Promise<VerifyOtpResult>;
  requestOtp(identifier: string, referralCode?: string): Promise<string | void>;
  verifyOtp(identifier: string, code: string, referralCode?: string): Promise<VerifyOtpResult>;
  requestForgotPassword(email: string): Promise<string | void>;
  verifyForgotPassword(email: string, code: string): Promise<{ verificationToken: string }>;
  resetPassword(
    verificationToken: string,
    password: string,
    passwordConfirmation: string,
  ): Promise<string | void>;
  getMe(): Promise<AuthUser>;
}
