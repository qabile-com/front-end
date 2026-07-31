import { httpClient } from './http-client';

export const getRoadmap = (params?: { limit?: number; offset?: number; q?: string }, options?: { signal?: AbortSignal }) =>
  httpClient.get('/api/v1/roadmap', { params, signal: options?.signal });

export const getRoadmaps = (params?: { limit?: number; offset?: number; q?: string }, options?: { signal?: AbortSignal }) =>
  httpClient.get('/api/v1/roadmaps', { params, signal: options?.signal });

export const getActiveRoadmap = (options?: { signal?: AbortSignal }) =>
  httpClient.get('/api/v1/roadmaps/active', { signal: options?.signal });

export const getRoadmapStep = (num: number, options?: { signal?: AbortSignal }) =>
  httpClient.get(`/api/v1/roadmap/steps/${num}`, { signal: options?.signal });

export const completeRoadmapStep = (num: number, options?: { signal?: AbortSignal }) =>
  httpClient.post(`/api/v1/roadmap/steps/${num}/complete`, undefined, { signal: options?.signal });

export const completeRoadmapStepByRoadmap = (roadmapId: string, stepId: string | number, options?: { signal?: AbortSignal }) =>
  httpClient.post(`/api/v1/roadmaps/${roadmapId}/steps/${stepId}/complete`, undefined, { signal: options?.signal });
