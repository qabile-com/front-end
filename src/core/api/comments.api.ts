import { httpClient } from './http-client';

interface CommentsResponse {
  data: {
    comments: Array<{
      id: string;
      name: string;
      text: string;
      time: string;
      authorId?: string;
      avatar?: string | null;
      moderationStatus?: string;
      createdAt?: string;
    }>;
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
  httpClient.post<{ data: CommentsResponse['data']['comments'][number] }>(
    `/api/v1/courses/${courseId}/episodes/${sectionId}/comments`,
    { text },
  );
