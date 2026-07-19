import { httpClient } from './http-client';
import type { AxiosResponse } from 'axios';

export const getUsers = (params?: { limit?: number; offset?: number; q?: string }) =>
  httpClient.get('/api/v1/users', { params });

export const getUserProfile = (userId: string) => httpClient.get(`/api/v1/users/${userId}/profile`);
