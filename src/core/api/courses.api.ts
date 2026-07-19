import { httpClient } from './http-client';
import type { AxiosResponse } from 'axios';

export const getCourses = (params?: { limit?: number; offset?: number; q?: string }) =>
  httpClient.get('/api/v1/courses', { params });

export const updateSectionProgress = (
  sectionId: string,
  body: { status: string; progress?: number },
) => httpClient.patch(`/api/v1/courses/sections/${sectionId}/progress`, body);
