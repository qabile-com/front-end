import type { IAdminRepository } from '../../domain/admin-repository';
import { adminPinPost, adminDeletePost, adminDeleteComment } from '@/core/api/forum.api';
import { apiForumPostToDomain } from './http-social-repository';

export class HttpAdminRepository implements IAdminRepository {
  async pinPost(postId: string, isPinned: boolean) {
    const response = await adminPinPost(postId, isPinned);
    return apiForumPostToDomain(response.data);
  }
  async deletePost(postId: string) {
    await adminDeletePost(postId);
  }
  async deleteComment(commentId: string) {
    await adminDeleteComment(commentId);
  }
}
