import type { GoogleAuthPayload, VerifyOtpResult } from '../domain/auth-repository';

export function createMockGoogleAuthSession(payload: GoogleAuthPayload = {}): VerifyOtpResult {
  const name = payload.mockName ?? 'کاربر Gmail';
  const email = payload.mockEmail ?? 'gmail-user@qabile.local';

  return {
    accessToken: 'mock-google-internal-access-token',
    refreshToken: 'mock-google-internal-refresh-token',
    tokenType: 'Bearer',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isNewUser: false,
    user: {
      id: `mock-google-user:${email}`,
      name,
      firstName: name.split(' ')[0] ?? 'کاربر',
      lastName: 'Gmail',
      displayName: name,
      username: email.split('@')[0] ?? 'gmail_user',
      avatar: payload.googleAvatarUrl,
      phone: null,
      email,
      role: 'user',
      title: 'عضو قبیله',
      level: 2,
      xp: 1050,
      xpMax: 2000,
      streak: 8,
      isCompleteOnboarding: true,
    },
  };
}
