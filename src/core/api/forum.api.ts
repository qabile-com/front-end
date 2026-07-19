import { httpClient } from './http-client';
import type { AxiosResponse } from 'axios';

export interface ForumFeedResponse {
  data: any[];
  meta: { limit: number; offset: number; totalItems: number; totalPages: number };
  trendingTags: string[];
  activeUsers: any[];
}

export const getForumFeed = (params?: { limit?: number; offset?: number; q?: string }) =>
  httpClient.get<any, AxiosResponse<ForumFeedResponse>>('/api/v1/forum/feed', { params });

export const createForumPost = (body: {
  text: string;
  location?: string;
  emoji?: string;
  tags?: string[];
}) => httpClient.post('/api/v1/forum/posts', body);

export const addForumComment = (postId: string, body: { text: string }) =>
  httpClient.post(`/api/v1/forum/posts/${postId}/comments`, body);
