import type { StoredAuthUser } from '@/core/auth/token';

export interface AuthUser {
  id: string;
  name: string;
  phone?: string | null;
  email: string;
  role: string;
}

export interface AuthSession {
  accessToken: string;
  tokenType?: string;
  expiresInSeconds?: number;
  user: StoredAuthUser;
}

export interface IAuthRepository {
  requestOtp(identifier: string): Promise<void>;
  verifyOtp(identifier: string, code: string, name?: string, lastName?: string): Promise<AuthSession>;
  getMe(): Promise<AuthUser>;
}
