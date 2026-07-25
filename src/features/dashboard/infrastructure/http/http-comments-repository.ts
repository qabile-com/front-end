import type { ICommentsRepository, PaginatedComments } from '../../domain/comments-repository';
import { addSessionComment, getSessionComments } from '@/core/api/comments.api';

export class HttpCommentsRepository implements ICommentsRepository {
  async getComments(
    courseId: string,
    sectionId: string,
    limit = 5,
    offset = 0,
  ): Promise<PaginatedComments> {
    const res = await getSessionComments(courseId, sectionId, limit, offset);
    const payload = res.data.data;
    return {
      comments: payload.comments,
      totalItems: payload.totalItems,
      totalPages: Math.max(1, Math.ceil(payload.totalItems / limit)),
      currentPage: Math.floor(offset / limit) + 1,
    };
  }

  async addComment(courseId: string, sectionId: string, text: string) {
    const res = await addSessionComment(courseId, sectionId, text);
    return res.data.data;
  }
}
