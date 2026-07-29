import { httpClient } from './http-client';
import type { SectionWatchProgressInput } from '@/features/dashboard/domain/dashboard.types';

export const getCourses = (params?: { limit?: number; offset?: number; q?: string }) =>
  httpClient.get('/api/v1/courses', { params });

export const getCourseSection = (courseId: string, sectionId: string) =>
  httpClient.get(`/api/v1/courses/${courseId}/episodes/${sectionId}`);

export const purchaseCourse = (courseId: string) =>
  httpClient.post(`/api/v1/courses/${courseId}/purchase`);

export const updateSectionProgress = (
  sectionId: string,
  body: { status: string; progress?: number },
) => httpClient.patch(`/api/v1/courses/episodes/${sectionId}/progress`, body);

export const reportSectionWatchProgress = (sectionId: string, body: SectionWatchProgressInput) =>
  httpClient.patch(`/api/v1/courses/episodes/${sectionId}/watch-progress`, body);
