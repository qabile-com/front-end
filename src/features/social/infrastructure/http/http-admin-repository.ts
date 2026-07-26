import type { IAdminRepository } from '../../domain/admin-repository';
import { adminPinPost, adminDeletePost, adminDeleteComment } from '@/core/api/forum.api';

export class HttpAdminRepository implements IAdminRepository {
  async pinPost(postId: string, isPinned: boolean) {
    await adminPinPost(postId, isPinned);
  }
  async deletePost(postId: string) {
    await adminDeletePost(postId);
  }
  async deleteComment(commentId: string) {
    await adminDeleteComment(commentId);
  }
}
