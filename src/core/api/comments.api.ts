import { NEXT_CACHE_ROOT_PARAM_TAG_ID } from 'next/dist/lib/constants';
import { httpClient } from './http-client';

interface CommentsResponse {
  data: {
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

export const getSessionComments = (courseId: string, partId: string, limit = 5, offset = 0) =>
  httpClient.get<any, { data: CommentsResponse }>(
    `/api/v1/courses/${courseId}/parts/${partId}/comments`,
    { params: { limit, offset } },
  );
