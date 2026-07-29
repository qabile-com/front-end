import type { Comment, ICommentsRepository, PaginatedComments } from '../../domain/comments-repository';
import type { CourseCommentDto } from '@/core/api/comments.api';
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
      comments: payload.comments.map(apiCommentToDomain),
      totalItems: payload.totalItems,
      totalPages: Math.max(1, Math.ceil(payload.totalItems / limit)),
      currentPage: Math.floor(offset / limit) + 1,
    };
  }

  async addComment(courseId: string, sectionId: string, text: string) {
    const res = await addSessionComment(courseId, sectionId, text);
    return apiCommentToDomain(res.data.data);
  }
}

function apiCommentToDomain(comment: CourseCommentDto): Comment {
  const authorName = normalizeAuthorName(comment.author);

  return {
    id: comment.id,
    authorId: comment.authorId ?? comment.author?.id,
    name: authorName || comment.name?.trim() || 'کاربر قبیله',
    text: comment.text,
    time: comment.time ?? comment.createdAt,
    avatar: comment.avatar ?? comment.author?.avatar ?? null,
    moderationStatus: comment.moderationStatus,
    createdAt: comment.createdAt,
  };
}

function normalizeAuthorName(author: CourseCommentDto['author']) {
  if (!author) return '';

  return (
    author.displayName?.trim() ||
    author.name?.trim() ||
    [author.firstName, author.lastName].filter(Boolean).join(' ').trim() ||
    author.username?.trim() ||
    ''
  );
}
