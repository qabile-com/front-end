import type { IAdminRepository } from '../../domain/admin-repository';
import type { Post } from '../../domain/social.data';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockAdminRepository implements IAdminRepository {
  async pinPost(postId: string, isPinned: boolean): Promise<Post> {
    await delay(200);
    return {
      id: postId,
      author: 'ادمین',
      authorId: 'admin',
      avatar: 'linear-gradient(135deg,#cc4308,#ff6200,#f3ba63)',
      time: new Date().toISOString(),
      text: '',
      likes: 0,
      likedByMe: false,
      comments: [],
      commentsCount: 0,
      isPinned,
    };
  }
  async deletePost(postId: string) {
    await delay(200);
  }
  async deleteComment(commentId: string) {
    await delay(200);
  }
}
