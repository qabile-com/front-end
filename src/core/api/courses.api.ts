import { httpClient } from './http-client';
import type { SectionWatchProgressInput } from '@/features/dashboard/domain/dashboard.types';

export const getCourses = (
  params?: { limit?: number; offset?: number; q?: string },
  options?: { signal?: AbortSignal },
) => httpClient.get('/api/v1/courses', { params, signal: options?.signal });

export const getCourseSection = (
  courseId: string,
  sectionId: string,
  options?: { signal?: AbortSignal },
) =>
  httpClient.get(`/api/v1/courses/${courseId}/episodes/${sectionId}`, { signal: options?.signal });

export const purchaseCourse = (courseId: string, options?: { signal?: AbortSignal }) =>
  httpClient.post(`/api/v1/courses/${courseId}/purchase`, undefined, { signal: options?.signal });

export const updateSectionProgress = (
  sectionId: string,
  body: { status: string; progress?: number },
  options?: { signal?: AbortSignal },
) =>
  httpClient.patch(`/api/v1/courses/episodes/${sectionId}/progress`, body, {
    signal: options?.signal,
  });

export const reportSectionWatchProgress = (
  sectionId: string,
  body: SectionWatchProgressInput,
  options?: { signal?: AbortSignal },
) =>
  httpClient.patch(`/api/v1/courses/episodes/${sectionId}/watch-progress`, body, {
    signal: options?.signal,
  });

/**
 * Marks an episode as watched and grants its XP without tracked playback.
 * Only accepted when the episode (or its course) has `noTrackRequired` enabled.
 */
export const markEpisodeWatched = (
  courseId: string,
  episodeId: string,
  options?: { signal?: AbortSignal },
) =>
  httpClient.patch(
    `/api/v1/courses/${encodeURIComponent(courseId)}/episodes/${encodeURIComponent(episodeId)}/watched`,
    undefined,
    { signal: options?.signal },
  );
