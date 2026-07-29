import type { Post } from './social.data';

export interface IAdminRepository {
  pinPost(postId: string, isPinned: boolean): Promise<Post>;
  deletePost(postId: string): Promise<void>;
  deleteComment(commentId: string): Promise<void>;
}
