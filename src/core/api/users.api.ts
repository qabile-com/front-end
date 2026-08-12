import { httpClient } from './http-client';

export const getUsers = (params?: { limit?: number; offset?: number; q?: string }) =>
  httpClient.get('/api/v1/users', { params });

export const followUser = (userId: string) => httpClient.post(`/api/v1/users/${userId}/follow`);

export const unfollowUser = (userId: string) => httpClient.delete(`/api/v1/users/${userId}/follow`);

export const getFollowStatus = (userId: string) =>
  httpClient.get<{ isFollowedByMe: boolean }>(`/api/v1/users/${userId}/follow-status`);

export const getUserProfile = (userId: string) => httpClient.get(`/api/v1/users/${userId}/profile`);

export const getUserPosts = (userId: string, params?: { limit?: number; offset?: number }) =>
  httpClient.get(`/api/v1/users/${userId}/posts`, { params });

export const getMyProfile = () => httpClient.get('/api/v1/users/me/profile');

export const getMyReferral = (options?: { signal?: AbortSignal }) =>
  httpClient.get('/api/v1/users/me/referral', { signal: options?.signal });

export const submitMyExchangeReferral = (body: { exchangeReferralUrl: string; identity: string }) =>
  httpClient.post('/api/v1/users/me/referral/exchange', body);

export const getMyFriends = (
  params?: { limit?: number; offset?: number; q?: string },
  options?: { signal?: AbortSignal },
) => httpClient.get('/api/v1/users/me/friends', { params, signal: options?.signal });

export const getMyXpHistory = (
  params?: { limit?: number; offset?: number; q?: string },
  options?: { signal?: AbortSignal },
) => httpClient.get('/api/v1/users/me/xp-history', { params, signal: options?.signal });

export const updateMyOnboarding = (isCompleteOnboarding: boolean) =>
  httpClient.patch('/api/v1/users/me/onboarding', { isCompleteOnboarding });

export const updateMyProfile = (body: {
  firstName?: string;
  username?: string | null;
  lastName?: string;
  displayName?: string;
  bio?: string | null;
}) => httpClient.patch('/api/v1/users/me/profile', body);

export const updateMyProfileAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return httpClient.post('/api/v1/users/me/avatar', formData);
};

export const deleteMyProfileAvatar = () => httpClient.delete('/api/v1/users/me/avatar');

export const registerMyPushToken = (body: { token: string; platform: 'web'; deviceId: string }) =>
  httpClient.post('/api/v1/users/me/push-tokens', body);

export const deleteMyPushToken = (token: string) =>
  httpClient.delete('/api/v1/users/me/push-tokens', { data: { token } });

export const requestEmailVerification = (email: string) =>
  httpClient.post('/api/v1/users/me/email/verification/request', { email });

export const deleteMyAccount = () => httpClient.delete('/api/v1/users/me');

export const getMyAchievements = (
  params?: { limit?: number; offset?: number },
  options?: { signal?: AbortSignal },
) => httpClient.get('/api/v1/users/me/achievements', { params, signal: options?.signal });

export const awardMyAchievement = (achievementId: string, options?: { signal?: AbortSignal }) =>
  httpClient.post(
    `/api/v1/users/me/achievements/${encodeURIComponent(achievementId)}/award`,
    undefined,
    { signal: options?.signal },
  );

export const updateMyProfileSetting = (field: string, value: boolean) =>
  httpClient.patch(`/api/v1/users/me/settings/${field}`, { enabled: value });

export const requestPhoneChangeCode = (currentPhone: string) =>
  httpClient.post('/api/v1/users/me/phone-change/request', { currentPhone });

export const verifyPhoneChangeCode = (currentPhone: string, code: string) =>
  httpClient.post('/api/v1/users/me/phone-change/verify', { currentPhone, code });

export const confirmPhoneChange = (newPhone: string, verificationToken: string) =>
  httpClient.patch('/api/v1/users/me/phone', { newPhone, verificationToken });

export const requestPasswordChangeCode = (email: string) =>
  httpClient.post('/api/v1/users/me/password-change/request', { email });

export const verifyPasswordChangeCode = (email: string, code: string) =>
  httpClient.post('/api/v1/users/me/password-change/verify', { email, code });

export const confirmPasswordChange = (
  password: string,
  passwordConfirmation: string,
  verificationToken: string,
) =>
  httpClient.patch('/api/v1/users/me/password', {
    password,
    passwordConfirmation,
    verificationToken,
  });
