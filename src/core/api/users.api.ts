import { httpClient } from './http-client';

export const getUsers = (params?: { limit?: number; offset?: number; q?: string }) =>
  httpClient.get('/api/v1/users', { params });

export const getUserProfile = (userId: string) => httpClient.get(`/api/v1/users/${userId}/profile`);

export const getMyProfile = () => httpClient.get('/api/v1/users/me/profile');

export const updateMyProfile = (body: {
  name?: string;
  username?: string | null;
  email?: string | null;
}) => httpClient.patch('/api/v1/users/me/profile', body);

export const updateMyProfileAvatar = (file: File) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return httpClient.post('/api/v1/users/me/avatar', formData);
};

export const requestEmailVerification = (email: string) =>
  httpClient.post('/api/v1/users/me/email/verification/request', { email });

export const deleteMyAccount = () => httpClient.delete('/api/v1/users/me');

export const updateMyProfileSetting = (field: string, value: boolean) =>
  httpClient.patch(`/api/v1/users/me/settings/${field}`, { value });

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
