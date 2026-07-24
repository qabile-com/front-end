import type { IAdminRepository } from '../../domain/admin-repository';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export class MockAdminRepository implements IAdminRepository {
  async pinPost(postId: string, isPinned: boolean) {
    await delay(200);
    // In a real mock we would update the post in the store, but for simplicity we do nothing
  }
  async deletePost(postId: string) {
    await delay(200);
  }
  async deleteComment(commentId: string) {
    await delay(200);
  }
}
