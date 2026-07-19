import type { ICommentsRepository, PaginatedComments } from '../../domain/comments-repository';
import { getSessionComments } from '@/core/api/comments.api';

export class HttpCommentsRepository implements ICommentsRepository {
  async getComments(
    courseId: string,
    partId: string,
    limit = 5,
    offset = 0,
  ): Promise<PaginatedComments> {
    const res = await getSessionComments(courseId, partId, limit, offset);
    const data = res.data;
    return {
      comments: data.data,
      totalItems: data.meta.totalItems,
      totalPages: data.meta.totalPages,
      currentPage: Math.floor(offset / limit) + 1,
    };
  }
}
