import { httpClient } from './http-client';
import type { ForumUserDto } from './forum.api';
import type { ActionRewardResult } from '@/features/dashboard/domain/dashboard.types';

export interface CourseCommentDto {
  id: string;
  name?: string | null;
  text: string;
  time?: string | null;
  authorId?: string;
  author?: ForumUserDto | null;
  avatar?: string | null;
  moderationStatus?: string;
  createdAt?: string;
}

interface CommentsResponse {
  data: {
    comments: CourseCommentDto[];
    nextCursor?: string;
    totalItems: number;
  };
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const getSessionComments = (courseId: string, sectionId: string, limit = 5, offset = 0) =>
  httpClient.get<CommentsResponse>(`/api/v1/courses/${courseId}/episodes/${sectionId}/comments`, {
    params: { limit, offset },
  });

export const addSessionComment = (courseId: string, sectionId: string, text: string) =>
  httpClient.post<{ data: CourseCommentDto; reward?: ActionRewardResult | null; unlockedAchievements?: ActionRewardResult['unlockedAchievements'] }>(
    `/api/v1/courses/${courseId}/episodes/${sectionId}/comments`,
    { text },
  );
