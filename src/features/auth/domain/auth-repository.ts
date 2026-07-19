export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: string;
}

export interface IAuthRepository {
  requestOtp(identifier: string): Promise<void>;
  verifyOtp(identifier: string, code: string, name?: string): Promise<AuthUser>;
  getMe(): Promise<AuthUser>;
}
