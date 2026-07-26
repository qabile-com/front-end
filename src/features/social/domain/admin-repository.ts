export interface IAdminRepository {
  pinPost(postId: string, isPinned: boolean): Promise<void>;
  deletePost(postId: string): Promise<void>;
  deleteComment(commentId: string): Promise<void>;
}
