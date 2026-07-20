import { httpClient } from './http-client';
import type { SectionWatchProgressInput } from '@/features/dashboard/domain/dashboard.types';

export const getCourses = (params?: { limit?: number; offset?: number; q?: string }) =>
  httpClient.get('/api/v1/courses', { params });

export const getCourseSection = (courseId: string, sectionId: string) =>
  httpClient.get(`/api/v1/courses/${courseId}/sections/${sectionId}`);

export const updateSectionProgress = (
  sectionId: string,
  body: { status: string; progress?: number },
) => httpClient.patch(`/api/v1/courses/sections/${sectionId}/progress`, body);

export const reportSectionWatchProgress = (
  sectionId: string,
  body: SectionWatchProgressInput,
) => httpClient.patch(`/api/v1/courses/sections/${sectionId}/watch-progress`, body);
