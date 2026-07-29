import { httpClient } from './http-client';

export const getRoadmap = (params?: { limit?: number; offset?: number; q?: string }) =>
  httpClient.get('/api/v1/roadmap', { params });

export const getRoadmaps = (params?: { limit?: number; offset?: number; q?: string }) =>
  httpClient.get('/api/v1/roadmaps', { params });

export const getActiveRoadmap = () => httpClient.get('/api/v1/roadmaps/active');

export const getRoadmapStep = (num: number) => httpClient.get(`/api/v1/roadmap/steps/${num}`);

export const completeRoadmapStep = (num: number) =>
  httpClient.post(`/api/v1/roadmap/steps/${num}/complete`);

export const completeRoadmapStepByRoadmap = (roadmapId: string, stepId: string | number) =>
  httpClient.post(`/api/v1/roadmaps/${roadmapId}/steps/${stepId}/complete`);
