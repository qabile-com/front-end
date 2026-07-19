import { httpClient } from './http-client';
import type { AxiosResponse } from 'axios';

export const getRoadmap = (params?: { limit?: number; offset?: number; q?: string }) =>
  httpClient.get('/api/v1/roadmap', { params });

export const getRoadmapStep = (num: number) => httpClient.get(`/api/v1/roadmap/steps/${num}`);
