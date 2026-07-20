import { httpClient } from './http-client';

interface CommentsResponse {
  data: {
    id: string;
    name: string;
    text: string;
    time: string;
  }[];
  meta: {
    limit: number;
    offset: number;
    totalItems: number;
    totalPages: number;
  };
}

export const getSessionComments = (courseId: string, sectionId: string, limit = 5, offset = 0) =>
  httpClient.get<CommentsResponse>(`/api/v1/courses/${courseId}/sections/${sectionId}/comments`, {
    params: { limit, offset },
  });

export const addSessionComment = (courseId: string, sectionId: string, text: string) =>
  httpClient.post<{ data: CommentsResponse['data'][number] }>(
    `/api/v1/courses/${courseId}/sections/${sectionId}/comments`,
    { text },
  );
